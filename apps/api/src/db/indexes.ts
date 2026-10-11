import type { Db } from "mongodb";
import { artifactKey } from "../lib/ids";
import { getCollections } from "./collections";

/** Artifacts stored before stable keys existed get theirs, so the unique key index can be built over old data. */
async function backfillArtifactKeys(db: Db): Promise<void> {
  const { artifacts } = getCollections(db);
  const legacy = await artifacts.find({ key: { $exists: false } },{ projection: { projectId: 1, externalId: 1 } }).toArray();
  for (let i = 0; i < legacy.length; i += 500) {
    await artifacts.bulkWrite(
      legacy.slice(i, i + 500).map((a) => ({
        updateOne: { filter: { _id: a._id }, update: { $set: { key: artifactKey(a.projectId, a.externalId) } } },
      })),
    );
  }
}

export async function ensureIndexes(db: Db): Promise<void> {
  await backfillArtifactKeys(db);
  const c = getCollections(db);
  await Promise.all([
    c.users.createIndex({ githubId: 1 }, { unique: true }),
    c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    c.projects.createIndex({ ownerId: 1, repoId: 1 }, { unique: true }),
    c.projects.createIndex({ ownerId: 1, updatedAt: -1 }),
    c.syncJobs.createIndex({ projectId: 1, startedAt: -1 }),
    c.syncJobs.createIndex(
      { projectId: 1 },
      { unique: true, partialFilterExpression: { status: { $in: ["queued", "running"] } } },
    ),
    // gen is part of the key so a new generation can coexist with the old one during the swap
    c.repoFiles.createIndex({ projectId: 1, gen: 1, path: 1 }, { unique: true }),
    c.repoFiles.createIndex({ projectId: 1, gen: 1 }),
    c.artifacts.createIndex({ projectId: 1, gen: 1, externalId: 1 }, { unique: true }),
    c.artifacts.createIndex({ projectId: 1, gen: 1, key: 1 }, { unique: true }),
    c.artifacts.createIndex({ projectId: 1, type: 1, updatedAt: -1 }),
    c.chunks.createIndex(
      { projectId: 1, text: "text", path: "text", title: "text" },
      // chunks.language holds slugs like "typescript"; keep Mongo from treating it as a stemming language
      { name: "chunks_text", language_override: "_textLanguage" },
    ),
    c.chunks.createIndex({ projectId: 1, language: 1 }),
    c.chunks.createIndex({ projectId: 1, gen: 1 }),
    c.decisions.createIndex({ projectId: 1, createdAt: -1 }),
    c.onboardingPlans.createIndex({ projectId: 1, userId: 1 }, { unique: true }),
    c.projectAnalysis.createIndex({ projectId: 1 }, { unique: true }),
    c.handoffs.createIndex({ projectId: 1, version: 1 }, { unique: true }),
    c.askAnswers.createIndex({ projectId: 1, userId: 1, createdAt: -1 }),
    c.activityEvents.createIndex({ projectId: 1, createdAt: -1 }),
    c.webhookDeliveries.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7 * 86_400 }),
    c.members.createIndex({ projectId: 1, userId: 1 }, { unique: true }),
    c.agentRuns.createIndex({ projectId: 1, createdAt: -1 }),
  ]);
}
