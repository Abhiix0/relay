import pino, { type Logger } from "pino";
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
import { artifactKey } from "../lib/ids";
import { detectLanguage } from "../lib/language";
import { redactSecrets } from "../lib/redact";
import { isExcludedPath, isLockfile } from "../lib/secrets";
import { purgeSessions } from "../services/githubErrors";

export const MAX_FILES = 2000;
export const MAX_FILE_BYTES = 256 * 1024;
const MAX_KEY_FILES = 60;
const MAX_GLOBAL = 2;
const BLOB_CONCURRENCY = 8;
const FILE_BATCH = 100;
const MINIFIED = /\.(?:min\.js|min\.css|map|snap)$/i;
const BINARY_EXT = new Set(
  "png jpg jpeg gif webp ico pdf zip gz tar woff woff2 ttf eot mp3 mp4 mov wasm".split(" "),
);

export interface SyncContext {
  projectId: ObjectId;
  generation: number;
  signal: AbortSignal;
}

export interface SyncRunner {
  /** Resolves when the run ends; never rejects. */
  start(projectId: ObjectId): Promise<void>;
  /** Resolves once that project's run (if any) has fully settled. */
  abort(projectId: ObjectId): Promise<void>;
  recoverOrphans(): Promise<void>;
  /** Aborts every run and waits for them to settle, at most 10s. */
  shutdown(): Promise<void>;
}

export interface SyncRunnerDeps {
  db: Db;
  github: GithubClient;
  logger?: Logger;
  /** analysis / onboarding arrive in a later phase */
  afterSync?: (ctx: SyncContext) => Promise<void>;
}

const noopAfterSync = async (): Promise<void> => {};

class Aborted extends Error {}
class RepoNotFound extends Error {}

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

/** README/docs first, then root config, then src, then the rest (stable). */
function priority(path: string): number {
  const lower = path.toLowerCase();
  if (lower.startsWith("docs/") || /^readme/.test(lower)) return 0;
  if (!path.includes("/")) return 1;
  if (lower.startsWith("src/")) return 2;
  return 3;
}

/** Lower is better; null = not a key file. README, docs, root files, then src entry points. */
function keyRank(path: string): number | null {
  const lower = path.toLowerCase();
  if (/^readme/.test(lower)) return 0;
  if (lower.startsWith("docs/")) return 1;
  if (!path.includes("/")) return 2;
  return /^src\/(?:.*\/)?(?:index|main|app|server)\.[a-z]+$/.test(lower) ? 3 : null;
}

function isBinaryPath(path: string): boolean {
  const dot = path.lastIndexOf(".");
  return dot !== -1 && BINARY_EXT.has(path.slice(dot + 1).toLowerCase());
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

export function createSyncRunner({
  db,
  github,
  logger = pino({ level: "silent" }),
  afterSync = noopAfterSync,
}: SyncRunnerDeps): SyncRunner {
  const c = getCollections(db);
  const controllers = new Map<string, AbortController>();
  const running = new Map<string, Promise<void>>();
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

  const dropGen = (projectId: ObjectId, gen: number) =>
    Promise.all([
      c.repoFiles.deleteMany({ projectId, gen }),
      c.artifacts.deleteMany({ projectId, gen }),
      c.chunks.deleteMany({ projectId, gen }),
    ]);

  async function run(
    project: ProjectDoc,
    jobId: ObjectId,
    signal: AbortSignal,
    state: { committed: boolean },
  ): Promise<void> {
    const projectId = project._id;
    const pid = projectId.toHexString();
    const newGen = project.syncGeneration + 1;
    const check = () => {
      if (signal.aborted) throw new Aborted();
    };
    const progress = async (n: number) => {
      check();
      await c.syncJobs.updateOne({ _id: jobId }, { $set: { progress: n } });
    };

    await dropGen(projectId, newGen); // leftovers from a crashed run would collide with this one
    const user = await c.users.findOne({ _id: project.ownerId });
    if (!user) throw new GithubAccessError(401, "revoked");
    let token: string;
    try {
      token = decrypt(user.encToken);
    } catch {
      throw new GithubAccessError(401, "revoked");
    }
    const full = project.fullName;

    // 0-10 metadata
    const repo = await github.getRepo(token, full);
    if (!repo) throw new RepoNotFound();
    const branch = repo.default_branch;
    await progress(10);

    // 10-40 fetch everything (tree listing, text sources, stats) before writing anything
    const { entries, truncated } = await github.getTree(token, full, branch);
    const eligible = entries.filter((e) => !isExcludedPath(e.path));
    if (truncated || eligible.length > MAX_FILES) {
      logger.warn({ projectId: pid }, "file cap hit; indexing a prioritized subset");
    }
    const tree = eligible
      .map((e, i) => ({ e, i, p: priority(e.path) }))
      .sort((a, b) => a.p - b.p || a.i - b.i)
      .slice(0, MAX_FILES)
      .map((x) => x.e);
    await progress(15);

    const now = new Date();
    const artifacts: ArtifactDoc[] = [];
    const add = (a: Omit<ArtifactDoc, "_id" | "projectId" | "gen" | "key">) =>
      artifacts.push({ _id: new ObjectId(), projectId, gen: newGen, key: artifactKey(projectId, a.externalId), ...a });
    const readme = await github.getReadme(token, full);
    if (readme) {
      add({
        type: "readme",
        externalId: "readme",
        title: readme.path,
        path: readme.path,
        url: readme.url,
        summary: null,
        body: redactSecrets(readme.content),
        createdAt: now,
        updatedAt: now,
      });
    }
    await progress(20);
    const commits = await github.listCommits(token, full, 100);
    for (const cm of commits) {
      add({
        type: "commit",
        externalId: `commit:${cm.sha}`,
        title: redactSecrets(cm.message.split("\n")[0] ?? cm.sha),
        path: null,
        url: cm.url,
        summary: `by ${cm.authorName}`,
        body: redactSecrets(cm.message),
        createdAt: cm.date,
        updatedAt: cm.date,
      });
    }
    await progress(25);
    const issues = await github.listIssues(token, full, 100);
    const pulls = await github.listPulls(token, full, 100);
    for (const [type, list] of [
      ["issue", issues],
      ["pr", pulls],
    ] as const) {
      for (const t of list) {
        add({
          type,
          externalId: `${type}:${t.number}`,
          title: redactSecrets(t.title),
          path: null,
          url: t.url,
          summary: t.state,
          body: redactSecrets(t.body),
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
    }
    await progress(30);
    const [commitCount, releases, issueCount, prCount] = await Promise.all([
      github.countCommits(token, full),
      github.countReleases(token, full),
      github.searchCount(token, full, "issue"),
      github.searchCount(token, full, "pr"),
    ]);
    await progress(40);

    // 40-90 write the new generation: files + chunks per batch, then artifacts
    const repoUrl = `https://github.com/${full}`;
    const keyPaths = new Set(
      tree
        .filter((e) => !isBinaryPath(e.path) && e.size <= MAX_FILE_BYTES && !isLockfile(e.path))
        .flatMap((e) => {
          const rank = keyRank(e.path);
          return rank === null ? [] : [{ path: e.path, rank }];
        })
        .sort((a, b) => a.rank - b.rank || (a.path < b.path ? -1 : 1))
        .slice(0, MAX_KEY_FILES)
        .map((k) => k.path),
    );
    const keyFiles: RepoFileDoc[] = [];
    // unchanged sha => reuse last generation's content instead of refetching the blob
    const prev = new Map(
      (
        await c.repoFiles
          .find(
            { projectId, gen: project.syncGeneration },
            { projection: { path: 1, sha: 1, content: 1, isBinary: 1 } },
          )
          .toArray()
      ).map((f) => [f.path, f]),
    );
    let reused = 0;
    let fetched = 0;
    for (let i = 0; i < tree.length; i += FILE_BATCH) {
      const batch: RepoFileDoc[] = tree.slice(i, i + FILE_BATCH).map((e) => ({
        _id: new ObjectId(),
        projectId,
        path: e.path,
        name: e.path.split("/").pop() ?? e.path,
        language: detectLanguage(e.path),
        size: e.size,
        sha: e.sha,
        isBinary: isBinaryPath(e.path),
        isLarge: e.size > MAX_FILE_BYTES || MINIFIED.test(e.path),
        content: null,
        gen: newGen,
      }));
      await pool(
        batch.filter((f) => !f.isBinary && !f.isLarge && !isLockfile(f.path)),
        BLOB_CONCURRENCY,
        async (f) => {
          check();
          const old = prev.get(f.path);
          if (old && old.sha === f.sha) {
            f.content = old.content;
            f.isBinary = old.isBinary;
            reused++;
            return;
          }
          fetched++;
          const text = await github.getBlob(token, full, f.sha);
          if (text === null) f.isBinary = true;
          else f.content = redactSecrets(text);
        },
      );
      const chunks: ChunkDoc[] = [];
      for (const f of batch) {
        if (f.content !== null && keyPaths.has(f.path)) keyFiles.push(f);
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
      check();
      await insertBatched((d) => c.repoFiles.insertMany(d), batch);
      await insertBatched((d) => c.chunks.insertMany(d), chunks);
      await progress(40 + Math.floor((45 * Math.min(i + FILE_BATCH, tree.length)) / tree.length));
    }

    logger.info({ projectId: pid, reused, fetched }, "blobs reused vs fetched");
    for (const f of keyFiles) {
      add({
        type: "file",
        externalId: `file:${f.path}`,
        title: f.path,
        path: f.path,
        url: `${repoUrl}/blob/${branch}/${f.path.split("/").map(encodeURIComponent).join("/")}`,
        summary: `${f.language ?? "text"} - ${(f.size / 1024).toFixed(1)} KB`,
        body: (f.content ?? "").slice(0, 20000),
        createdAt: now,
        updatedAt: now,
      });
    }

    const artifactChunks: ChunkDoc[] = [];
    for (const a of artifacts) {
      if (a.type === "readme" || a.type === "file") continue; // already chunked as files
      for (const ch of chunk(a.body || a.title)) {
        artifactChunks.push({
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
    await insertBatched((d) => c.artifacts.insertMany(d), artifacts);
    await insertBatched((d) => c.chunks.insertMany(d), artifactChunks);
    await progress(90);

    // single flip: generation pointer + stats + refreshed repo metadata
    const thirtyDays = Date.now() - 30 * 86_400_000;
    const recent = commits.filter((cm) => cm.date.getTime() >= thirtyDays).length;
    const health = computeHealth(
      tree.map((e) => e.path),
      recent,
      readme !== null,
    );
    check();
    await c.projects.updateOne(
      { _id: projectId },
      {
        $set: {
          syncGeneration: newGen,
          name: repo.name,
          description: repo.description ?? project.description,
          language: repo.language ?? project.language,
          defaultBranch: repo.default_branch,
          stats: {
            commits: commitCount,
            pullRequests: prCount,
            issues: issueCount,
            releases,
            files: tree.length,
          },
          health,
          healthLabel: healthLabel(health.overall),
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );
    state.committed = true;

    // post-commit cleanup; gen:null rows (decision mirrors) never match $lt
    try {
      await Promise.all([
        c.repoFiles.deleteMany({ projectId, gen: { $lt: newGen } }),
        c.artifacts.deleteMany({ projectId, gen: { $lt: newGen } }),
        c.chunks.deleteMany({ projectId, gen: { $lt: newGen } }),
      ]);
    } catch (err) {
      logger.error({ projectId: pid, err: (err as Error).message }, "old generation cleanup failed");
    }
    try {
      await afterSync({ projectId, generation: newGen, signal });
    } catch (err) {
      logger.error({ projectId: pid, err: (err as Error).message }, "afterSync failed");
    }
    if (signal.aborted) return;
    await c.syncJobs.updateOne(
      { _id: jobId },
      { $set: { status: "succeeded", progress: 100, error: null, completedAt: new Date() } },
    );
    await c.projects.updateOne({ _id: projectId }, { $set: { syncStatus: "succeeded", updatedAt: new Date() } });
    if (signal.aborted) return;
    await c.activityEvents.insertOne({
      _id: new ObjectId(),
      projectId,
      type: "sync",
      title: "Repository synced",
      description: `Indexed ${tree.length} files, ${commits.length} commits, ${issues.length + pulls.length} issues and pull requests.`,
      createdAt: new Date(),
    });
  }

  async function execute(projectId: ObjectId, ctrl: AbortController): Promise<void> {
    const project = await c.projects.findOne({ _id: projectId });
    const job = await c.syncJobs.findOne({ projectId, status: { $in: ["queued", "running"] } });
    if (!project || !job) return;
    const newGen = project.syncGeneration + 1;
    const state = { committed: false };
    try {
      await acquire();
      try {
        if (ctrl.signal.aborted) throw new Aborted();
        await run(project, job._id, ctrl.signal, state);
      } finally {
        release();
      }
    } catch (err) {
      // drop a partially written new generation; old data stays untouched
      if (!state.committed) {
        await dropGen(projectId, newGen).catch(() => undefined);
      }
      if (err instanceof Aborted) return;
      logger.error(
        { projectId: projectId.toHexString(), err: err instanceof Error ? err.message : "unknown" },
        "sync failed",
      );
      let message = "Sync failed due to an unexpected error";
      if (err instanceof RepoNotFound) message = "Repository not found or not accessible";
      else if (err instanceof GithubAccessError) {
        if (err.kind === "revoked") {
          message = "GitHub access revoked. Sign in again to resync.";
          await purgeSessions(db, project.ownerId).catch(() => undefined);
        } else if (err.kind === "rate_limited") {
          message = "GitHub rate limit reached. Try again later.";
        } else message = "GitHub denied access to this repository";
      }
      await c.syncJobs
        .updateOne(
          { _id: job._id },
          { $set: { status: "failed", error: message, completedAt: new Date() } },
        )
        .catch(() => undefined);
      if (!state.committed) {
        await c.projects
          .updateOne(
            { _id: projectId },
            {
              $set: {
                syncStatus: "failed",
                healthLabel: project.lastSyncedAt ? "Last sync failed" : "Sync failed",
                updatedAt: new Date(),
              },
            },
          )
          .catch(() => undefined);
      }
    }
  }

  return {
    start(projectId) {
      const key = projectId.toHexString();
      const ctrl = new AbortController();
      controllers.set(key, ctrl);
      const done: Promise<void> = execute(projectId, ctrl)
        .catch(() => undefined)
        .finally(() => {
          if (controllers.get(key) === ctrl) controllers.delete(key);
          if (running.get(key) === done) running.delete(key);
        });
      running.set(key, done);
      return done;
    },
    async abort(projectId) {
      const key = projectId.toHexString();
      controllers.get(key)?.abort();
      await running.get(key);
    },
    async shutdown() {
      for (const ctrl of controllers.values()) ctrl.abort();
      let timer: NodeJS.Timeout | undefined;
      const timeout = new Promise<void>((resolve) => (timer = setTimeout(resolve, 10_000)));
      await Promise.race([Promise.all(running.values()), timeout]);
      clearTimeout(timer);
    },
    async recoverOrphans() {
      const orphans = await c.syncJobs.find({ status: { $in: ["queued", "running"] } }).toArray();
      if (orphans.length === 0) return;
      const ids = orphans.map((j) => j.projectId);
      for (const p of await c.projects.find({ _id: { $in: ids } }).toArray()) {
        await dropGen(p._id, p.syncGeneration + 1);
      }
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
