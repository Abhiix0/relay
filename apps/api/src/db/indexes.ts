import type { Db } from "mongodb";
import { getCollections } from "./collections";

export async function ensureIndexes(db: Db): Promise<void> {
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
    c.repoFiles.createIndex({ projectId: 1, path: 1 }, { unique: true }),
    c.repoFiles.createIndex({ projectId: 1, gen: 1 }),
    c.artifacts.createIndex({ projectId: 1, externalId: 1 }, { unique: true }),
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
  ]);
}
