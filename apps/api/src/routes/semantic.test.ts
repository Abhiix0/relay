import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { askAnswerSchema, searchResultsSchema } from "@web-types/types";
import { getCollections, type ChunkDoc, type ProjectDoc } from "../db/collections";
import { createSyncRunner } from "../jobs/syncRunner";
import { retrieve } from "../services/retrievalService";
import { FakeEmbedder, FakeGithub, FakeLlm } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup(full = "acme/widget") {
  const github = new FakeGithub();
  github.addRepo(full);
  const llm = new FakeLlm();
  const embedder = new FakeEmbedder();
  const app = makeTestApp({ db, github, llm, embedder });
  const user = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", user.cookie).send({ fullName: full });
  const pid = new ObjectId(created.body.id as string);
  const c = getCollections(db);
  const insert = async (pid_: ObjectId, path: string | null, text: string, over: Partial<ChunkDoc> = {}) => {
    const chunk: ChunkDoc = {
      _id: new ObjectId(), projectId: pid_, artifactId: null, type: "file", path,
      url: `https://github.com/${full}/blob/main/${path}`, title: path ?? "t", language: null,
      startLine: 1, text, gen: 1, ...over,
    };
    const [embedding] = await embedder.embed([text]);
    await c.chunks.insertOne({ ...chunk, embedding });
    return chunk;
  };
  await c.projects.updateOne({ _id: pid }, { $set: { syncGeneration: 1 } });
  const project = (await c.projects.findOne({ _id: pid })) as ProjectDoc;
  const ask = (q: string) =>
    request(app).post(`/api/v1/projects/${pid.toHexString()}/ask`).set("Cookie", user.cookie).send({ question: q });
  const search = (qs: string, cookie = user.cookie) => request(app).get(`/api/v1/search?${qs}`).set("Cookie", cookie);
  return { app, github, llm, embedder, user, pid, project, c, insert, ask, search };
}

describe("embeddings at sync time", () => {
  async function sync(s: Awaited<ReturnType<typeof setup>>, embedder: FakeEmbedder | undefined) {
    s.github.addFile("src/login.ts", "export function authenticate() {}");
    s.github.addFile("src/cache.ts", "const lru = new Map();");
    await s.c.projects.updateOne({ _id: s.pid }, { $set: { syncGeneration: 0 } });
    await s.c.syncJobs.updateMany({ projectId: s.pid }, { $set: { status: "succeeded" } });
    await request(s.app).post(`/api/v1/projects/${s.pid.toHexString()}/sync`).set("Cookie", s.user.cookie).send({});
    await createSyncRunner({ db, github: s.github, ...(embedder && { embedder }) }).start(s.pid);
  }

  it("embeds file chunks and reuses the vectors of unchanged text on the next sync", async () => {
    const s = await setup();
    await sync(s, s.embedder);
    const first = await s.c.chunks.find({ projectId: s.pid, type: "file" }).toArray();
    expect(first.length).toBeGreaterThan(0);
    expect(first.every((ch) => ch.embedding?.length === 3)).toBe(true);
    const callsAfterFirst = s.embedder.calls.length;

    await s.c.syncJobs.updateMany({ projectId: s.pid }, { $set: { status: "succeeded" } });
    await request(s.app).post(`/api/v1/projects/${s.pid.toHexString()}/sync`).set("Cookie", s.user.cookie).send({});
    await createSyncRunner({ db, github: s.github, embedder: s.embedder }).start(s.pid);
    const second = await s.c.chunks.find({ projectId: s.pid, type: "file", gen: { $gt: 1 } }).toArray();
    expect(second.length).toBe(first.length);
    expect(second.every((ch) => ch.embedding)).toBe(true);
    expect(s.embedder.calls.length).toBe(callsAfterFirst); // nothing new to embed
  });

  it("an embedder failure does not fail the sync; chunks just have no vector", async () => {
    const s = await setup();
    s.embedder.fail = true;
    await sync(s, s.embedder);
    expect((await s.c.projects.findOne({ _id: s.pid }))?.syncStatus).toBe("succeeded");
    const chunks = await s.c.chunks.find({ projectId: s.pid, type: "file" }).toArray();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((ch) => ch.embedding)).toBe(false);
  });
});

describe("hybrid retrieval", () => {
  it("finds a chunk with no lexical overlap through the embedding", async () => {
    const s = await setup();
    await s.insert(s.pid, "src/login.ts", "export function authenticate() {}");
    s.llm.responses.push({ answer: "In login.ts.", citedEvidence: ["E1"], confidence: "high" });
    const body = askAnswerSchema.parse((await s.ask("how do users sign in")).body);
    expect(s.llm.calls[0]?.user).toContain("authenticate");
    expect(body.sources.map((x) => x.path)).toEqual(["src/login.ts"]);
  });

  it("without an embedder the same question finds nothing and makes no LLM call", async () => {
    const s = await setup();
    await s.insert(s.pid, "src/login.ts", "export function authenticate() {}");
    const lexicalOnly = makeTestApp({ db, github: s.github, llm: s.llm });
    const res = await request(lexicalOnly)
      .post(`/api/v1/projects/${s.pid.toHexString()}/ask`)
      .set("Cookie", s.user.cookie)
      .send({ question: "how do users sign in" });
    expect(askAnswerSchema.parse(res.body).insufficientEvidence).toBe(true);
    expect(s.llm.calls).toHaveLength(0);
  });

  it("falls back to lexical search and records a note when the embedder fails", async () => {
    const s = await setup();
    await s.insert(s.pid, "src/cache.ts", "the lru cache evicts entries");
    s.embedder.fail = true;
    s.llm.responses.push({ answer: "Evicts.", citedEvidence: ["E1"], confidence: "high" });
    const res = await s.ask("how does eviction work in the cache?");
    expect(res.status).toBe(201);
    expect(askAnswerSchema.parse(res.body).sources).toHaveLength(1);
    const run = await s.c.agentRuns.findOne({ projectId: s.pid });
    expect(run?.notes).toEqual(["embedder unavailable: used lexical search only"]);
  });

  it("reranks by source type and caps chunks per file", async () => {
    const s = await setup();
    const a = {
      _id: new ObjectId(), projectId: s.pid, type: "decision", externalId: "decision:1", key: "k1", title: "Pick one",
      path: null, url: null, summary: null, body: "", createdAt: new Date(), updatedAt: new Date(), gen: null,
    };
    await s.c.artifacts.insertOne(a);
    await s.insert(s.pid, "src/a.ts", "latency matters here", { title: "src/a.ts" });
    const decision = await s.insert(s.pid, null, "latency matters here", { type: "decision", artifactId: a._id, gen: null, title: "Pick one" });
    for (let i = 0; i < 4; i++) await s.insert(s.pid, "src/big.ts", `latency matters here part ${i}`, { startLine: i * 60 + 1 });

    const out = await retrieve(db, s.project, "latency");
    expect(out[0]?._id.equals(decision._id)).toBe(true);
    expect(out.filter((c) => c.path === "src/big.ts")).toHaveLength(2);
  });
});

describe("GET /search?mode=semantic", () => {
  it("returns nearest chunks, tagged semantic, scoped to the caller's own projects", async () => {
    const s = await setup();
    await s.insert(s.pid, "src/login.ts", "export function authenticate() {}");
    await s.insert(s.pid, "src/cache.ts", "const lru = new Map();");

    const other = await setup("evil/other");
    await other.insert(other.pid, "src/secret-login.ts", "authenticate everything");

    const res = await s.search("q=how%20do%20users%20sign%20in&mode=semantic");
    const body = searchResultsSchema.parse(res.body);
    expect(res.body.mode).toBe("semantic");
    expect(body.results.map((r) => r.filePath)).toEqual(["src/login.ts"]);
    expect(body.results[0]?.url).toContain("src/login.ts");

    const keyword = await s.search("q=authenticate");
    expect(keyword.body.mode).toBe("keyword");
  });

  it("falls back to keyword mode when the embedder fails or is absent", async () => {
    const s = await setup();
    await s.insert(s.pid, "src/login.ts", "export function authenticate() {}");
    s.embedder.fail = true;
    const res = await s.search("q=authenticate&mode=semantic");
    expect(res.body.mode).toBe("keyword");
    expect(res.body.results.map((r: { filePath: string }) => r.filePath)).toEqual(["src/login.ts"]);
    expect((await s.search("q=x&mode=nope")).status).toBe(422);
  });
});
