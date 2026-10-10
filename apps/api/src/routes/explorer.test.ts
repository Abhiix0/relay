import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  activityEventSchema,
  artifactDetailSchema,
  artifactSchema,
  fileContentSchema,
  repositoryTreeSchema,
} from "@web-types/types";
import { getCollections, type ArtifactDoc, type RepoFileDoc } from "../db/collections";
import { createSyncRunner } from "../jobs/syncRunner";
import { run as runAnalysis } from "../services/analysisService";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  const app = makeTestApp({ db, github });
  const { cookie } = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  const pid = new ObjectId(id);
  const c = getCollections(db);
  await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 2 } });
  const get = (path: string) => request(app).get(`/api/v1/projects/${id}${path}`).set("Cookie", cookie);
  return { app, github, cookie, id, pid, c, get };
}

const art = (pid: ObjectId, over: Partial<ArtifactDoc>): ArtifactDoc => ({
  _id: new ObjectId(),
  projectId: pid,
  type: "file",
  externalId: new ObjectId().toHexString(),
  key: new ObjectId().toHexString(),
  title: "t",
  path: null,
  url: null,
  summary: null,
  body: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  gen: 2,
  ...over,
});

const file = (pid: ObjectId, path: string, over: Partial<RepoFileDoc> = {}): RepoFileDoc => ({
  _id: new ObjectId(),
  projectId: pid,
  path,
  name: path.split("/").pop() as string,
  language: "rust",
  size: 10,
  sha: "s",
  isBinary: false,
  isLarge: false,
  content: "fn main() {}",
  gen: 2,
  ...over,
});

describe("artifacts", () => {
  it("filters by type and q, sorts newest first, hides other generations, no body", async () => {
    const { c, pid, get } = await setup();
    await c.artifacts.insertMany([
      art(pid, { title: "old", type: "issue", updatedAt: new Date(1000) }),
      art(pid, { title: "100% (match)", type: "issue", summary: "Hello", updatedAt: new Date(3000) }),
      art(pid, { title: "pr one", type: "pr", updatedAt: new Date(2000) }),
      art(pid, { title: "mirror", type: "decision", gen: null, updatedAt: new Date(500) }),
      art(pid, { title: "stale", type: "issue", gen: 1, updatedAt: new Date(9000) }),
    ]);

    const all = await get("/artifacts");
    expect(all.status).toBe(200);
    const parsed = all.body.map((a: unknown) => artifactSchema.parse(a));
    expect(parsed.map((a: { title: string }) => a.title)).toEqual(["100% (match)", "pr one", "old", "mirror"]);
    expect(all.body[0]).not.toHaveProperty("body");

    expect((await get("/artifacts?type=all")).body).toHaveLength(4);
    const issues = await get("/artifacts?type=issue");
    expect(issues.body.map((a: { title: string }) => a.title)).toEqual(["100% (match)", "old"]);
    expect((await get("/artifacts?q=HELLO")).body).toHaveLength(1);
    expect((await get("/artifacts?q=" + encodeURIComponent("100% (match)"))).body).toHaveLength(1);
    expect((await get("/artifacts?q=.*")).body).toHaveLength(0);
    expect((await get("/artifacts?type=bogus")).status).toBe(422);
    expect((await get("/artifacts?q=" + "x".repeat(201))).status).toBe(422);
  });

  it("caps the list at 200", async () => {
    const { c, pid, get } = await setup();
    await c.artifacts.insertMany(Array.from({ length: 205 }, () => art(pid, {})));
    expect((await get("/artifacts")).body).toHaveLength(200);
  });

  it("returns detail with body cut to 20000, 404 otherwise", async () => {
    const { c, pid, get } = await setup();
    const a = art(pid, { body: "x".repeat(25000), url: "https://github.com/acme/widget/issues/1" });
    const old = art(pid, { gen: 1 });
    await c.artifacts.insertMany([a, old]);
    const res = await get(`/artifacts/${a.key}`);
    expect(res.status).toBe(200);
    expect(artifactDetailSchema.parse(res.body).body).toHaveLength(20000);
    for (const id of ["nothex", new ObjectId().toHexString(), old.key, a._id.toHexString()]) {
      const r = await get(`/artifacts/${id}`);
      expect(r.status).toBe(404);
      expect(r.body.message).toBe("Artifact not found");
    }
  });
});

describe("activity", () => {
  it("is newest first and capped at 50", async () => {
    const { c, pid, get } = await setup();
    await c.activityEvents.insertMany(
      Array.from({ length: 55 }, (_, i) => ({
        _id: new ObjectId(),
        projectId: pid,
        type: "sync",
        title: `e${i}`,
        description: "d",
        createdAt: new Date(1000 + i),
      })),
    );
    const res = await get("/activity");
    expect(res.body).toHaveLength(50);
    res.body.forEach((e: unknown) => activityEventSchema.parse(e));
    expect(res.body[0].title).toBe("e54");
  });
});

describe("repository", () => {
  it("builds a nested tree: folders first, alphabetical, current generation only", async () => {
    const { c, pid, get } = await setup();
    await c.repoFiles.insertMany([
      file(pid, "b.rs"),
      file(pid, "a.rs"),
      file(pid, "src/z/deep.rs"),
      file(pid, "src/main.rs", { size: 42 }),
      file(pid, "docs/guide.md", { language: "markdown" }),
      file(pid, "gone.rs", { gen: 1 }),
    ]);
    const res = await get("/repository/tree");
    const tree = repositoryTreeSchema.parse(res.body);
    expect(tree.repository).toBe("acme/widget");
    expect(tree.tree.map((i) => `${i.type}:${i.path}`)).toEqual([
      "folder:docs",
      "folder:src",
      "file:a.rs",
      "file:b.rs",
    ]);
    const src = tree.tree[1]!;
    expect(src.children!.map((i) => i.id)).toEqual(["src/z", "src/main.rs"]);
    expect(src.children![1]).toMatchObject({ type: "file", language: "rust", size: 42, name: "main.rs" });
    expect(src.children![0]!.children![0]!.id).toBe("src/z/deep.rs");
  });

  it("serves files with spaces in the path, flags binary/large, 404 otherwise", async () => {
    const { c, pid, get } = await setup();
    await c.repoFiles.insertMany([
      file(pid, "my docs/read me.md", { content: "hello", language: "markdown" }),
      file(pid, "img.png", { isBinary: true, content: null }),
      file(pid, "big.json", { isLarge: true, content: null, size: 999999 }),
      file(pid, "old.rs", { gen: 1 }),
    ]);
    const ok = await get("/repository/files/my%20docs/read%20me.md");
    expect(ok.status).toBe(200);
    expect(fileContentSchema.parse(ok.body)).toMatchObject({ content: "hello", name: "read me.md" });

    const bin = fileContentSchema.parse((await get("/repository/files/img.png")).body);
    expect(bin).toMatchObject({ content: "", isBinary: true });
    const big = fileContentSchema.parse((await get("/repository/files/big.json")).body);
    expect(big).toMatchObject({ content: "", isLarge: true, size: 999999 });

    for (const p of ["nope.rs", "old.rs"]) {
      const r = await get(`/repository/files/${p}`);
      expect(r.status).toBe(404);
      expect(r.body.message).toBe("File not found");
    }
  });
});

describe("sync creates file artifacts", () => {
  it("makes key text file artifacts, not chunked again", async () => {
    const { app, github, cookie, id, pid, c, get } = await setup();
    await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 0 } });
    github.addFile("README.md", "# hi");
    github.addFile("package.json", "{}");
    github.addFile("src/index.ts", "export {}");
    github.addFile("src/util/helper.ts", "export {}");
    github.addFile("docs/a b.md", "doc");
    github.addFile("logo.png", null);
    const start = await request(app).post(`/api/v1/projects/${id}/sync`).set("Cookie", cookie).send({});
    expect(start.status).toBe(200);
    await createSyncRunner({ db, github }).start(pid);

    const res = await get("/artifacts?type=file");
    const files = res.body.map((a: unknown) => artifactSchema.parse(a));
    expect(files.map((a: { title: string }) => a.title).sort()).toEqual([
      "README.md",
      "docs/a b.md",
      "package.json",
      "src/index.ts",
    ]);
    const idx = files.find((a: { title: string }) => a.title === "src/index.ts");
    expect(idx.summary).toBe("typescript - 0.0 KB");
    expect(idx.url).toBe("https://github.com/acme/widget/blob/main/src/index.ts");
    const detail = await get(`/artifacts/${idx.id}`);
    expect(detail.body.body).toBe("export {}");
    expect(await c.chunks.countDocuments({ projectId: pid, artifactId: { $ne: null }, type: "file" })).toBe(0);
  });

  it("keeps artifact keys and plan artifact ids stable across re-syncs", async () => {
    const { app, github, cookie, id, pid, c, get } = await setup();
    await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 0 } });
    github.addFile("README.md", "# hi");
    github.addFile("src/index.ts", "export {}");
    const sync = async () => {
      await request(app).post(`/api/v1/projects/${id}/sync`).set("Cookie", cookie).send({});
      const runner = createSyncRunner({ db, github });
      await runner.start(pid);
      await runAnalysis(db, undefined, pid, new AbortController().signal);
    };
    await sync();
    const before = (await get("/artifacts?type=file")).body.map((a: { id: string }) => artifactSchema.parse(a).id).sort();
    const plan = await c.onboardingPlans.findOne({ projectId: pid });
    const planIds = plan!.items.flatMap((i) => i.artifactIds);
    expect(planIds.length).toBeGreaterThan(0);
    const legacy = await c.artifacts.findOne({ projectId: pid, type: "file" });

    await sync();
    const after = (await get("/artifacts?type=file")).body.map((a: { id: string }) => a.id).sort();
    expect(after).toEqual(before);
    expect(await c.onboardingPlans.countDocuments({ projectId: pid })).toBe(1);
    for (const k of planIds) expect(artifactDetailSchema.parse((await get(`/artifacts/${k}`)).body).id).toBe(k);
    expect((await get(`/artifacts/${legacy!._id.toHexString()}`)).status).toBe(404);
  });
});
