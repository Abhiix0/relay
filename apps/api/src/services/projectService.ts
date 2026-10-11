import { ObjectId, type Db } from "mongodb";
import { getCollections, type ProjectDoc, type UserDoc } from "../db/collections";
import type { GithubClient, GithubRepo } from "../integrations/github";
import { AppError, conflict, notFound } from "../lib/errors";
import { loadConfig } from "../config";
import { decryptUserToken, mapGithubError } from "./githubErrors";
import type { SyncRunner } from "../jobs/syncRunner";
import { newJob } from "./syncService";

export interface CreateProjectInput {
  fullName: string;
  description?: string | undefined;
  language?: string | undefined;
}

export async function listProjects(db: Db, ownerId: ObjectId, archived = false): Promise<ProjectDoc[]> {
  // `archivedAt: null` also matches projects that never had the field
  const filter = archived ? { ownerId, archivedAt: { $type: "date" as const } } : { ownerId, archivedAt: null };
  return getCollections(db).projects.find(filter).sort({ updatedAt: -1 }).toArray();
}

export async function createProject(
  db: Db,
  github: GithubClient,
  user: UserDoc,
  input: CreateProjectInput,
  runner?: SyncRunner,
): Promise<ProjectDoc> {
  const c = getCollections(db);
  const max = loadConfig().MAX_PROJECTS_PER_USER;
  if ((await c.projects.countDocuments({ ownerId: user._id })) >= max) {
    throw new AppError(409, "project_limit", `Project limit reached (${max}). Delete a project to connect another.`);
  }
  let repo: GithubRepo | null;
  const token = await decryptUserToken(db, user);
  try {
    repo = await github.getRepo(token, input.fullName);
  } catch (err) {
    throw await mapGithubError(db, user._id, err);
  }
  if (!repo) throw notFound("Repository not found or not accessible");
  if (await c.projects.findOne({ ownerId: user._id, repoId: repo.id })) {
    throw conflict("Repository already connected");
  }
  const now = new Date();
  const project: ProjectDoc = {
    _id: new ObjectId(),
    ownerId: user._id,
    repoId: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    owner: repo.owner,
    description: repo.description ?? input.description ?? "",
    language: repo.language ?? input.language ?? null,
    defaultBranch: repo.default_branch,
    visibility: repo.private ? "private" : "public",
    syncStatus: "running",
    lastSyncedAt: null,
    stats: { commits: 0, pullRequests: 0, issues: 0, releases: 0, files: 0 },
    healthLabel: "Indexing in progress",
    syncGeneration: 0,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await c.projects.insertOne(project);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw conflict("Repository already connected");
    throw err;
  }
  await c.members.insertOne({ _id: new ObjectId(), projectId: project._id, userId: user._id, role: "owner", createdAt: now });
  await c.syncJobs.insertOne(newJob(project._id));
  if (runner) void runner.start(project._id);
  return project;
}

export async function deleteProject(db: Db, project: ProjectDoc, runner?: SyncRunner): Promise<void> {
  await runner?.abort(project._id);
  const c = getCollections(db);
  const projectId = project._id;
  await Promise.all([
    c.syncJobs.deleteMany({ projectId }),
    c.repoFiles.deleteMany({ projectId }),
    c.artifacts.deleteMany({ projectId }),
    c.chunks.deleteMany({ projectId }),
    c.decisions.deleteMany({ projectId }),
    c.onboardingPlans.deleteMany({ projectId }),
    c.projectAnalysis.deleteMany({ projectId }),
    c.handoffs.deleteMany({ projectId }),
    c.askAnswers.deleteMany({ projectId }),
    c.activityEvents.deleteMany({ projectId }),
    c.members.deleteMany({ projectId }),
    c.agentRuns.deleteMany({ projectId }),
  ]);
  await c.projects.deleteOne({ _id: projectId, ownerId: project.ownerId });
}

/** Aborts the run and settles any active job so the UI stops polling. */
async function stopSync(db: Db, project: ProjectDoc, runner: SyncRunner | undefined, reason: string): Promise<void> {
  await runner?.abort(project._id);
  const c = getCollections(db);
  await c.syncJobs.updateMany(
    { projectId: project._id, status: { $in: ["queued", "running"] } },
    { $set: { status: "failed", error: reason, completedAt: new Date() } },
  );
  await c.projects.updateOne(
    { _id: project._id, syncStatus: "running" },
    { $set: { syncStatus: "failed", healthLabel: project.lastSyncedAt ? "Last sync failed" : "Sync failed" } },
  );
}

async function setFlag(db: Db, project: ProjectDoc, flag: "archivedAt" | "revokedAt", on: boolean): Promise<ProjectDoc> {
  const now = new Date();
  const updated = await getCollections(db).projects.findOneAndUpdate(
    { _id: project._id },
    { $set: { [flag]: on ? now : null, updatedAt: now } },
    { returnDocument: "after" },
  );
  return updated ?? project;
}

export async function archiveProject(db: Db, project: ProjectDoc, runner?: SyncRunner): Promise<ProjectDoc> {
  await stopSync(db, project, runner, "Project archived");
  return setFlag(db, project, "archivedAt", true);
}

export const unarchiveProject = (db: Db, project: ProjectDoc) => setFlag(db, project, "archivedAt", false);

/** Stops sync for good (until the project is reconnected) and drops the owner's token when no live connection is left. */
export async function revokeProject(db: Db, project: ProjectDoc, runner?: SyncRunner): Promise<ProjectDoc> {
  await stopSync(db, project, runner, "Connection revoked");
  const updated = await setFlag(db, project, "revokedAt", true);
  const c = getCollections(db);
  if ((await c.projects.countDocuments({ ownerId: project.ownerId, revokedAt: null })) === 0) {
    await c.users.updateOne({ _id: project.ownerId }, { $set: { encToken: null } });
  }
  return updated;
}
