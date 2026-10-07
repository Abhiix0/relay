import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb } from "../test/helpers";
import { getCollections } from "./collections";

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
