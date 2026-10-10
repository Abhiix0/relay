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

export async function listProjects(db: Db, ownerId: ObjectId): Promise<ProjectDoc[]> {
  return getCollections(db).projects.find({ ownerId }).sort({ updatedAt: -1 }).toArray();
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
  ]);
  await c.projects.deleteOne({ _id: projectId, ownerId: project.ownerId });
}
