import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { activityEventSchema, artifactSchema, decisionSchema } from "@web-types/types";
import { getCollections } from "../db/collections";
import { retrieve } from "../services/retrievalService";
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
  const a = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", a.cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  const post = (body: unknown, cookie = a.cookie, pid = id) =>
    request(app).post(`/api/v1/projects/${pid}/decisions`).set("Cookie", cookie).send(body as object);
  return { app, a, id, post };
}

const valid = { title: "  Use Rust ", summary: "Core moves to Rust", rationale: "GC pauses", id: "evil", projectId: "evil" };

describe("decisions", () => {
  it("creates, parses the web schema, strips unknown keys, lists newest first", async () => {
    const { app, a, id, post } = await setup();
    const res = await post({
      ...valid,
      sources: [{ type: "file", path: "src/a.rs", snippet: "fn main", extra: 1 }],
    });
    expect(res.status).toBe(201);
    const d = decisionSchema.parse(res.body);
    expect(d).toMatchObject({ title: "Use Rust", projectId: id, rationale: "GC pauses" });
    expect(d.id).not.toBe("evil");
    expect(d.sources[0]).toMatchObject({ type: "file", path: "src/a.rs", url: null, snippet: "fn main" });
    expect(d.sources[0]).not.toHaveProperty("extra");

    const second = await post({ title: "B", summary: "s" });
    expect(second.body.rationale).toBe("");
    const list = await request(app).get(`/api/v1/projects/${id}/decisions`).set("Cookie", a.cookie);
    expect(list.body.map((x: { title: string }) => x.title)).toEqual(["B", "Use Rust"]);

    const act = await request(app).get(`/api/v1/projects/${id}/activity`).set("Cookie", a.cookie);
    expect(act.body.filter((e: { type: string }) => e.type === "decision")).toHaveLength(2);
    activityEventSchema.array().parse(act.body);
  });

  it("422 on invalid bodies", async () => {
    const { post } = await setup();
    for (const bad of [
      {},
      { title: "  ", summary: "s" },
      { title: "t", summary: "" },
      { title: "x".repeat(201), summary: "s" },
      { title: "t", summary: "s", rationale: "x".repeat(10001) },
      { title: "t", summary: "s", sources: Array.from({ length: 21 }, () => ({ type: "file" })) },
      { title: "t", summary: "s", sources: [{ type: "bogus" }] },
    ]) {
      expect((await post(bad)).status).toBe(422);
    }
  });

  it("mirrors into artifacts and a retrievable chunk that survives a new generation", async () => {
    const { app, a, id, post } = await setup();
    const d = (await post(valid)).body;
    const pid = new ObjectId(id);
    const get = () => request(app).get(`/api/v1/projects/${id}/artifacts?type=decision`).set("Cookie", a.cookie);

    const arts = artifactSchema.array().parse((await get()).body);
    expect(arts).toHaveLength(1);
    expect(arts[0]).toMatchObject({ type: "decision", title: "Use Rust", url: null });

    // simulate a completed re-sync: bump generation and delete older rows like syncRunner does
    const c = getCollections(db);
    await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 5 } });
    await Promise.all([
      c.artifacts.deleteMany({ projectId: pid, gen: { $lt: 5 } }),
      c.chunks.deleteMany({ projectId: pid, gen: { $lt: 5 } }),
    ]);
    expect((await get()).body).toHaveLength(1);
    const project = (await c.projects.findOne({ _id: pid }))!;
    const hits = await retrieve(db, project, "pauses");
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ type: "decision", path: null, gen: null });
    expect(hits[0]!.artifactId).not.toBeNull();
    expect(d.id).toBeTruthy();

    // path-null chunks stay out of search
    const search = await request(app).get("/api/v1/search?q=pauses").set("Cookie", a.cookie);
    expect(search.body.totalCount).toBe(0);
  });

  it("is per-project and per-user", async () => {
    const { app, a, id, post } = await setup();
    await post(valid);
    const github = new FakeGithub();
    github.addRepo("acme/other");
    const app2 = makeTestApp({ db, github });
    const other = await request(app2).post("/api/v1/projects").set("Cookie", a.cookie).send({ fullName: "acme/other" });
    const list = await request(app2).get(`/api/v1/projects/${other.body.id}/decisions`).set("Cookie", a.cookie);
    expect(list.body).toEqual([]);
    const b = await loginAs(db);
    expect((await post(valid, b.cookie)).status).toBe(404);
    expect((await request(app).get(`/api/v1/projects/${id}/decisions`)).status).toBe(401);
  });
});
