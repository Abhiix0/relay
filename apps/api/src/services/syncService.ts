import { ObjectId, type Db } from "mongodb";
import { getCollections, type ProjectDoc, type SyncJobDoc } from "../db/collections";

export type StartSync = (projectId: ObjectId) => void;
const noop: StartSync = () => {};

const ACTIVE: SyncJobDoc["status"][] = ["queued", "running"];

export async function getLatestSyncJob(db: Db, projectId: ObjectId): Promise<SyncJobDoc | null> {
  return getCollections(db).syncJobs.find({ projectId }).sort({ startedAt: -1 }).limit(1).next();
}

export function newJob(projectId: ObjectId): SyncJobDoc {
  return {
    _id: new ObjectId(),
    projectId,
    status: "running",
    progress: 0,
    error: null,
    startedAt: new Date(),
    completedAt: null,
  };
}

/** Idempotent: returns the active job if one exists, else creates a running job. */
export async function requestSync(db: Db, project: ProjectDoc,
  start: StartSync = noop,
): Promise<SyncJobDoc> {
  const { syncJobs, projects } = getCollections(db);
  const activeQuery = { projectId: project._id, status: { $in: ACTIVE } };
  const active = await syncJobs.findOne(activeQuery);
  if (active) return active;
  const job = newJob(project._id);
  try {
    await syncJobs.insertOne(job);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      const raced = await syncJobs.findOne(activeQuery);
      if (raced) return raced;
    }
    throw err;
  }
  await projects.updateOne(
    { _id: project._id },
    { $set: { syncStatus: "running", healthLabel: "Indexing in progress", updatedAt: new Date() } },
  );
  start(project._id);
  return job;
}
