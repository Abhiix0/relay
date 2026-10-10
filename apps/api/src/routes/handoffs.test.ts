import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handoffSchema } from "@web-types/types";
import { getCollections, type ChunkDoc } from "../db/collections";
import { AppError } from "../lib/errors";
import { FakeGithub, FakeLlm } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

const HEADINGS = [
  "1. Project summary",
  "2. Architecture and important subsystems",
  "3. Current state and recent changes",
  "4. Active PRs and unresolved issues",
  "5. Known operational caveats",
  "6. Important engineering decisions",
  "7. Recommended next actions",
];
const llmOut = (cite: string[] = ["E1"]) => ({
  title: "Widget handoff",
  summary: "A summary.",
  sections: HEADINGS.map((heading) => ({ heading, body: `Body for ${heading}`, citedEvidence: cite })),
});

async function setup(indexed = true) {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  const llm = new FakeLlm();
  const app = makeTestApp({ db, github, llm });
  const user = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", user.cookie).send({ fullName: "acme/widget" });
  const pid = new ObjectId(created.body.id as string);
  await getCollections(db).projects.updateOne(
    { _id: pid },
    { $set: { syncGeneration: 1, syncStatus: indexed ? "succeeded" : "running" } },
  );
  const chunk: ChunkDoc = {
    _id: new ObjectId(), projectId: pid, artifactId: null, type: "file", path: "README.md",
    url: "https://github.com/acme/widget/blob/main/README.md", title: "README.md", language: "markdown",
    startLine: 1, text: "Widget is a gadget toolkit.", gen: 1,
  };
  await getCollections(db).chunks.insertOne(chunk);
  const url = `/api/v1/projects/${pid.toHexString()}/handoffs`;
  const call = (m: "get" | "post" | "patch", p: string, body?: object) =>
    request(app)[m](url + p).set("Cookie", user.cookie).send(body);
  return { llm, pid, call };
}

describe("handoffs", () => {
  it("generate matrix: create v1, unchanged, regenerate in place", async () => {
    const s = await setup();
    s.llm.responses.push(llmOut());
    const r1 = await s.call("post", "/generate", { regenerate: false });
    expect(r1.status).toBe(200);
    const h1 = handoffSchema.parse(r1.body);
    expect(h1.version).toBe(1);
    expect(h1.sections.map((x) => x.heading)).toEqual(HEADINGS);
    expect(h1.sections[0]?.sources[0]?.path).toBe("README.md");

    const r2 = await s.call("post", "/generate", {});
    expect(r2.body).toEqual(r1.body);
    expect(s.llm.calls).toHaveLength(1);

    s.llm.responses.push({ ...llmOut(), summary: "Fresh." });
    const r3 = await s.call("post", "/generate", { regenerate: true });
    expect(r3.body).toMatchObject({ id: h1.id, version: 1, summary: "Fresh.", title: "Widget handoff" });
    expect((await s.call("get", "")).body).toHaveLength(1);

    const events = await getCollections(db).activityEvents.countDocuments({ projectId: s.pid, type: "handoff" });
    expect(events).toBe(2);
  });

  it("regenerate with no handoff creates v1", async () => {
    const s = await setup();
    s.llm.responses.push(llmOut());
    expect((await s.call("post", "/generate", { regenerate: true })).body.version).toBe(1);
  });

  it("409 before indexing finishes", async () => {
    const s = await setup(false);
    const r = await s.call("post", "/generate", {});
    expect(r.status).toBe(409);
    expect(r.body.message).toBe("Project has not finished indexing");
    expect(s.llm.calls).toHaveLength(0);
  });

  it("drops fabricated labels and marks sections without a valid source", async () => {
    const s = await setup();
    s.llm.responses.push(llmOut(["E9", "src_abc"]));
    const h = handoffSchema.parse((await s.call("post", "/generate", {})).body);
    expect(h.sections.every((x) => x.sources.length === 0 && x.insufficientEvidence === true)).toBe(true);
    expect(h.sections[0]?.body).toContain("Not enough evidence");
  });

  it("LLM failure -> 502 and no row written", async () => {
    const s = await setup();
    s.llm.responses.push(new AppError(502, "llm_failed", "Answer generation failed"));
    expect((await s.call("post", "/generate", {})).status).toBe(502);
    expect(await getCollections(db).handoffs.countDocuments({ projectId: s.pid })).toBe(0);
  });

  it("404 when none exists", async () => {
    const s = await setup();
    const cur = await s.call("get", "/current");
    expect(cur.status).toBe(404);
    expect(cur.body.message).toBe("No handoff found");
    expect((await s.call("post", "/versions", {})).body.message).toBe("No current handoff to version");
    expect((await s.call("patch", "/current", { title: "x" })).status).toBe(404);
    expect((await s.call("get", "")).body).toEqual([]);
  });

  it("PATCH then versions (HandoffPage sequence); ?version returns one object", async () => {
    const s = await setup();
    s.llm.responses.push(llmOut());
    const v1 = (await s.call("post", "/generate", {})).body;
    const sections = [{ ...v1.sections[0], body: "Edited", id: undefined, version: 9, projectId: "x", extra: 1 }];
    const p = await s.call("patch", "/current", { sections, id: "evil", version: 9, projectId: "evil" });
    expect(p.status).toBe(200);
    const patched = handoffSchema.parse(p.body);
    expect(patched).toMatchObject({ id: v1.id, version: 1, projectId: s.pid.toHexString() });
    expect(patched.sections).toHaveLength(1);
    expect(patched.sections[0]?.body).toBe("Edited");
    expect(patched.sections[0]).not.toHaveProperty("extra");
    expect(patched.sections[0]?.id).toMatch(/^sec_/);

    const v = await s.call("post", "/versions", { description: "ignored" });
    expect(v.status).toBe(201);
    expect(handoffSchema.parse(v.body)).toMatchObject({ version: 2, summary: v1.summary });
    expect(v.body.id).not.toBe(v1.id);

    const one = await s.call("get", "?version=1");
    expect(Array.isArray(one.body)).toBe(false);
    expect(one.body.version).toBe(1);
    const list = await s.call("get", "");
    expect(list.body.map((h: { version: number }) => h.version)).toEqual([2, 1]);
    expect((await s.call("get", "/current")).body.version).toBe(2);
    expect((await s.call("get", "?version=7")).body.message).toBe("Version not found");
    expect((await s.call("get", "?version=0")).status).toBe(422);
    expect((await s.call("get", "?version=abc")).status).toBe(422);
  });

  it("validates PATCH and manual create", async () => {
    const s = await setup();
    s.llm.responses.push(llmOut());
    await s.call("post", "/generate", {});
    const sec = { heading: "H", body: "B" };
    for (const bad of [
      {},
      { title: "" },
      { title: "x".repeat(201) },
      { summary: "x".repeat(2001) },
      { sections: [{ heading: "", body: "B" }] },
      { sections: [{ heading: "H", body: "x".repeat(20001) }] },
      { sections: Array.from({ length: 31 }, () => sec) },
    ]) {
      expect((await s.call("patch", "/current", bad)).status).toBe(422);
    }
    const m = await s.call("post", "", { title: "Manual", summary: "S", sections: [sec], version: 50 });
    expect(m.status).toBe(201);
    expect(handoffSchema.parse(m.body).version).toBe(2);
    expect((await s.call("post", "", { title: "Manual" })).status).toBe(422);
  });
});
