import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/helpers";
import { artifactKey } from "../lib/ids";
import { getCollections } from "./collections";
import { ensureIndexes } from "./indexes";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

const job = (projectId: ObjectId, status: "running" | "succeeded") => ({
  _id: new ObjectId(),
  projectId,
  status,
  progress: 0,
  error: null,
  startedAt: new Date(),
  completedAt: null,
});

describe("indexes", () => {
  it("rejects a second active sync job but allows one after the first succeeded", async () => {
    const { syncJobs } = getCollections(db);
    const projectId = new ObjectId();
    const first = job(projectId, "running");
    await syncJobs.insertOne(first);
    await expect(syncJobs.insertOne(job(projectId, "running"))).rejects.toThrow(/E11000/);
    await syncJobs.updateOne({ _id: first._id }, { $set: { status: "succeeded" } });
    await expect(syncJobs.insertOne(job(projectId, "running"))).resolves.toBeDefined();
  });

  it("backfills keys on legacy artifacts so the unique key index can be built", async () => {
    const { artifacts } = getCollections(db);
    const projectId = new ObjectId();
    await artifacts.dropIndex("projectId_1_gen_1_key_1");
    const legacy = (externalId: string) =>
      ({
        _id: new ObjectId(), projectId, type: "issue", externalId, title: "t", path: null, url: null,
        summary: null, body: "", createdAt: new Date(), updatedAt: new Date(), gen: 1,
      }) as unknown as Parameters<typeof artifacts.insertOne>[0];
    await artifacts.insertMany([legacy("issue:1"), legacy("issue:2")]);
    await ensureIndexes(db);
    const keys = (await artifacts.find({ projectId }).toArray()).map((a) => a.key).sort();
    expect(keys).toEqual([artifactKey(projectId, "issue:1"), artifactKey(projectId, "issue:2")].sort());
    await expect(
      artifacts.insertOne({ ...legacy("issue:1"), key: artifactKey(projectId, "issue:1") }),
    ).rejects.toThrow(/E11000/);
  });

  it("requires projectId for $text queries on chunks", async () => {
    const { chunks } = getCollections(db);
    const projectId = new ObjectId();
    await chunks.insertOne({
      _id: new ObjectId(),
      projectId,
      artifactId: null,
      type: "file",
      path: "a.ts",
      url: "https://github.com/a/b/blob/main/a.ts",
      title: "a.ts",
      language: "typescript",
      startLine: 1,
      text: "hello caching world",
      gen: 1,
    });
    await expect(chunks.find({ $text: { $search: "caching" } }).toArray()).rejects.toThrow();
    const hits = await chunks.find({ projectId, $text: { $search: "caching" } }).toArray();
    expect(hits).toHaveLength(1);
  });
});
