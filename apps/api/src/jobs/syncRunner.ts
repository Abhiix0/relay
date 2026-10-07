import { ObjectId, type Db } from "mongodb";
import {
  getCollections,
  type ArtifactDoc,
  type ChunkDoc,
  type ProjectDoc,
  type RepoFileDoc,
} from "../db/collections";
import { GithubAccessError, type GithubClient } from "../integrations/github";
import { decrypt } from "../lib/crypto";
import { chunk } from "../lib/chunker";
import { detectLanguage } from "../lib/language";
import { isExcludedPath, isLockfile } from "../lib/secrets";

export const MAX_FILES = 5000;
export const MAX_FILE_BYTES = 256 * 1024;
const MAX_GLOBAL = 2;
const BLOB_CONCURRENCY = 8;

export interface SyncContext {
  projectId: ObjectId;
  generation: number;
}

export interface SyncRunner {
  /** Resolves when the run ends; never rejects. */
  start(projectId: ObjectId): Promise<void>;
  abort(projectId: ObjectId): void;
  recoverOrphans(): Promise<void>;
}

export interface SyncRunnerDeps {
  db: Db;
  github: GithubClient;
  /** analysis / onboarding arrive in a later phase */
  afterSync?: (ctx: SyncContext) => Promise<void>;
}

const noopAfterSync = async (): Promise<void> => {};

class Aborted extends Error {}

function healthLabel(overall: number): string {
  return overall >= 75 ? "Healthy" : overall >= 50 ? "Needs attention" : "At risk";
}

function computeHealth(paths: string[], recentCommits: number, hasReadme: boolean) {
  const lower = paths.map((p) => p.toLowerCase());
  const names = lower.map((p) => p.split("/").pop() ?? "");
  const documentation =
    (hasReadme ? 40 : 0) +
    (lower.some((p) => p.startsWith("docs/")) ? 30 : 0) +
    (names.some((n) => n.startsWith("license") || n.startsWith("licence")) ? 15 : 0) +
    (names.some((n) => n.startsWith("contributing")) ? 15 : 0);
  const activityScore = recentCommits >= 20 ? 100 : recentCommits >= 5 ? 60 : 20;
  const overall = Math.round(0.6 * documentation + 0.4 * activityScore);
  return { overall, documentation, activity: activityScore };
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++] as T);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

async function insertBatched<T extends object>(
  insert: (docs: T[]) => Promise<unknown>,
  docs: T[],
): Promise<void> {
  for (let i = 0; i < docs.length; i += 500) await insert(docs.slice(i, i + 500));
}

export function createSyncRunner({ db, github, afterSync = noopAfterSync }: SyncRunnerDeps): SyncRunner {
  const c = getCollections(db);
  const controllers = new Map<string, AbortController>();
  const waiting: (() => void)[] = [];
  let active = 0;

  const acquire = async (): Promise<void> => {
    if (active < MAX_GLOBAL) {
      active++;
      return;
    }
    await new Promise<void>((resolve) => waiting.push(resolve));
  };
  const release = (): void => {
    const next = waiting.shift();
    if (next) next();
    else active--;
  };

  async function run(project: ProjectDoc, jobId: ObjectId, signal: AbortSignal): Promise<void> {
    const projectId = project._id;
    const newGen = project.syncGeneration + 1;
    const check = () => {
      if (signal.aborted) throw new Aborted();
    };
    const progress = async (n: number) => {
      check();
      await c.syncJobs.updateOne({ _id: jobId }, { $set: { progress: n } });
    };

    const user = await c.users.findOne({ _id: project.ownerId });
    if (!user) throw new GithubAccessError(401);
    const token = decrypt(user.encToken);
    const full = project.fullName;

    // 0-10 metadata
    const repo = await github.getRepo(token, full);
    if (!repo) throw new GithubAccessError(404);
    const branch = repo.default_branch;
    await progress(10);

    // 10-35 tree + blobs
    const tree = (await github.getTree(token, full, branch))
      .filter((e) => !isExcludedPath(e.path))
      .slice(0, MAX_FILES);
    await progress(15);
    const files: RepoFileDoc[] = tree.map((e) => ({
      _id: new ObjectId(),
      projectId,
      path: e.path,
      name: e.path.split("/").pop() ?? e.path,
      language: detectLanguage(e.path),
      size: e.size,
      sha: e.sha,
      isBinary: false,
      isLarge: e.size > MAX_FILE_BYTES,
      content: null,
      gen: newGen,
    }));
    await pool(
      files.filter((f) => !f.isLarge && !isLockfile(f.path)),
      BLOB_CONCURRENCY,
      async (f) => {
        check();
        const text = await github.getBlob(token, full, f.sha);
        if (text === null) f.isBinary = true;
        else f.content = text;
      },
    );
    await progress(35);

    // 35-50 readme, 50-65 commits, 65-80 issues + PRs
    const now = new Date();
    const artifacts: ArtifactDoc[] = [];
    const add = (a: Omit<ArtifactDoc, "_id" | "projectId" | "gen">) =>
      artifacts.push({ _id: new ObjectId(), projectId, gen: newGen, ...a });
    const readme = await github.getReadme(token, full);
    if (readme) {
      add({
        type: "readme",
        externalId: "readme",
        title: readme.path,
        path: readme.path,
        url: readme.url,
        summary: null,
        body: readme.content,
        createdAt: now,
        updatedAt: now,
      });
    }
    await progress(50);
    const commits = await github.listCommits(token, full, 100);
    for (const cm of commits) {
      add({
        type: "commit",
        externalId: `commit:${cm.sha}`,
        title: cm.message.split("\n")[0] ?? cm.sha,
        path: null,
        url: cm.url,
        summary: `by ${cm.authorName}`,
        body: cm.message,
        createdAt: cm.date,
        updatedAt: cm.date,
      });
    }
    await progress(65);
    const [issues, pulls] = [
      await github.listIssues(token, full, 100),
      await github.listPulls(token, full, 100),
    ];
    for (const [type, list] of [
      ["issue", issues],
      ["pr", pulls],
    ] as const) {
      for (const t of list) {
        add({
          type,
          externalId: `${type}:${t.number}`,
          title: t.title,
          path: null,
          url: t.url,
          summary: t.state,
          body: t.body,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
    }
    await progress(80);

    // 80-90 chunk + write new generation
    const repoUrl = `https://github.com/${full}`;
    const chunks: ChunkDoc[] = [];
    for (const f of files) {
      if (f.content === null || isLockfile(f.path)) continue;
      for (const ch of chunk(f.content)) {
        chunks.push({
          _id: new ObjectId(),
          projectId,
          artifactId: null,
          type: "file",
          path: f.path,
          url: `${repoUrl}/blob/${branch}/${f.path}`,
          title: f.path,
          language: f.language,
          startLine: ch.startLine,
          text: ch.text,
          gen: newGen,
        });
      }
    }
    for (const a of artifacts) {
      for (const ch of chunk(a.body || a.title)) {
        chunks.push({
          _id: new ObjectId(),
          projectId,
          artifactId: a._id,
          type: a.type,
          path: a.path,
          url: a.url ?? repoUrl,
          title: a.title,
          language: a.path ? detectLanguage(a.path) : null,
          startLine: ch.startLine,
          text: ch.text,
          gen: newGen,
        });
      }
    }
    check();
    await insertBatched((d) => c.repoFiles.insertMany(d), files);
    await insertBatched((d) => c.artifacts.insertMany(d), artifacts);
    await insertBatched((d) => c.chunks.insertMany(d), chunks);
    check();
    // gen:null rows (decision mirrors) never match $lt
    await Promise.all([
      c.repoFiles.deleteMany({ projectId, gen: { $lt: newGen } }),
      c.artifacts.deleteMany({ projectId, gen: { $lt: newGen } }),
      c.chunks.deleteMany({ projectId, gen: { $lt: newGen } }),
    ]);
    await progress(90);

    // 90-100 stats, health, hook, finalize
    const [commitCount, releases, issueCount, prCount] = await Promise.all([
      github.countCommits(token, full),
      github.countReleases(token, full),
      github.searchCount(token, full, "issue"),
      github.searchCount(token, full, "pr"),
    ]);
    const thirtyDays = Date.now() - 30 * 86_400_000;
    const recent = commits.filter((cm) => cm.date.getTime() >= thirtyDays).length;
    const health = computeHealth(
      files.map((f) => f.path),
      recent,
      readme !== null,
    );
    check();
    await c.projects.updateOne(
      { _id: projectId },
      {
        $set: {
          syncGeneration: newGen,
          stats: {
            commits: commitCount,
            pullRequests: prCount,
            issues: issueCount,
            releases,
            files: files.length,
          },
          health,
          healthLabel: healthLabel(health.overall),
          syncStatus: "succeeded",
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );
    await afterSync({ projectId, generation: newGen });
    await c.syncJobs.updateOne(
      { _id: jobId },
      { $set: { status: "succeeded", progress: 100, error: null, completedAt: new Date() } },
    );
    await c.activityEvents.insertOne({
      _id: new ObjectId(),
      projectId,
      type: "sync",
      title: "Repository synced",
      description: `Indexed ${files.length} files, ${commits.length} commits, ${issues.length + pulls.length} issues and pull requests.`,
      createdAt: new Date(),
    });
  }

  async function execute(projectId: ObjectId): Promise<void> {
    const project = await c.projects.findOne({ _id: projectId });
    const job = await c.syncJobs.findOne({ projectId, status: { $in: ["queued", "running"] } });
    if (!project || !job) return;
    const ctrl = new AbortController();
    controllers.set(projectId.toHexString(), ctrl);
    const newGen = project.syncGeneration + 1;
    try {
      await acquire();
      try {
        if (ctrl.signal.aborted) throw new Aborted();
        await run(project, job._id, ctrl.signal);
      } finally {
        release();
      }
    } catch (err) {
      // drop any partially written new generation; old data stays untouched
      await Promise.all([
        c.repoFiles.deleteMany({ projectId, gen: newGen }),
        c.artifacts.deleteMany({ projectId, gen: newGen }),
        c.chunks.deleteMany({ projectId, gen: newGen }),
      ]).catch(() => undefined);
      if (err instanceof Aborted) return;
      const message =
        err instanceof GithubAccessError
          ? "GitHub access revoked or rate limited"
          : "Sync failed due to an unexpected error";
      await c.syncJobs
        .updateOne(
          { _id: job._id },
          { $set: { status: "failed", error: message, completedAt: new Date() } },
        )
        .catch(() => undefined);
      await c.projects
        .updateOne(
          { _id: projectId },
          { $set: { syncStatus: "failed", healthLabel: "Sync failed", updatedAt: new Date() } },
        )
        .catch(() => undefined);
    } finally {
      controllers.delete(projectId.toHexString());
    }
  }

  return {
    start: (projectId) => execute(projectId).catch(() => undefined),
    abort(projectId) {
      controllers.get(projectId.toHexString())?.abort();
    },
    async recoverOrphans() {
      const orphans = await c.syncJobs.find({ status: { $in: ["queued", "running"] } }).toArray();
      if (orphans.length === 0) return;
      const ids = orphans.map((j) => j.projectId);
      await c.syncJobs.updateMany(
        { _id: { $in: orphans.map((j) => j._id) } },
        { $set: { status: "failed", error: "Interrupted by restart", completedAt: new Date() } },
      );
      await c.projects.updateMany(
        { _id: { $in: ids } },
        { $set: { syncStatus: "failed", healthLabel: "Sync failed", updatedAt: new Date() } },
      );
    },
  };
}
