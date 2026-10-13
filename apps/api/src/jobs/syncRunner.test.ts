import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Collection, ObjectId, type Db } from "mongodb";
import { getCollections, type ProjectDoc } from "../db/collections";
import { deleteProject } from "../services/projectService";
import { newJob } from "../services/syncService";
import { GithubAccessError, GithubTransientError } from "../integrations/github";
import { FakeEmbedder, FakeGithub } from "../test/fakes";
import request from "supertest";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";
import { createSyncRunner } from "./syncRunner";
import { resetConfig } from "../config";
import { keepTop } from "../lib/embedder";
import { retrieve } from "../services/retrievalService";
import { searchFiles } from "../services/searchService";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

const date = new Date("2026-01-01T00:00:00.000Z");

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  github.addFile("README.md", "# Widget\nhello");
  github.addFile("src/main.rs", Array.from({ length: 130 }, (_, i) => `line ${i}`).join("\n"));
  github.addFile(".env", "TOKEN=abc");
  github.addFile("keys/id_rsa", "private");
  github.addFile("node_modules/x/index.js", "x");
  github.addFile("pnpm-lock.yaml", "lock: true");
  github.addFile("logo.png", null);
  github.addFile("big.json", "{}", 300 * 1024);
  github.readme = { path: "README.md", content: "# Widget\nhello", url: "https://github.com/acme/widget#readme" };
  github.commits = [{ sha: "abc", message: "first\n\nbody", url: "https://github.com/acme/widget/commit/abc", authorName: "o", date: new Date() }];
  github.issues = [{ number: 1, title: "bug", body: "it breaks", url: "https://github.com/acme/widget/issues/1", state: "open", createdAt: date, updatedAt: date }];
  github.counts = { commits: 42, releases: 3, issue: 7, pr: 5 };
  const { user } = await loginAs(db);
  const project: ProjectDoc = {
    _id: new ObjectId(),
    ownerId: user._id,
    repoId: 1,
    fullName: "acme/widget",
    name: "widget",
    owner: "acme",
    description: "",
    language: "Rust",
    defaultBranch: "main",
    visibility: "public",
    syncStatus: "running",
    lastSyncedAt: null,
    stats: { commits: 0, pullRequests: 0, issues: 0, releases: 0, files: 0 },
    healthLabel: "Indexing in progress",
    syncGeneration: 0,
    createdAt: date,
    updatedAt: date,
  };
  const c = getCollections(db);
  await c.projects.insertOne(project);
  const runner = createSyncRunner({ db, github });
  const sync = async () => {
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    await runner.start(project._id);
    return (await c.syncJobs.findOne({ _id: job._id }))!;
  };
  return { github, project, c, runner, sync };
}

describe("sync runner", () => {
  it("populates data, stats, health; never stores secrets or vendor files", async () => {
    const { project, c, sync } = await setup();
    const job = await sync();
    expect(job).toMatchObject({ status: "succeeded", progress: 100, error: null });
    const files = await c.repoFiles.find({ projectId: project._id }).toArray();
    const paths = files.map((f) => f.path).sort();
    expect(paths).toEqual(["README.md", "big.json", "logo.png", "pnpm-lock.yaml", "src/main.rs"]);
    expect(files.find((f) => f.path === "logo.png")).toMatchObject({ isBinary: true, content: null });
    expect(files.find((f) => f.path === "big.json")).toMatchObject({ isLarge: true, content: null });
    expect(files.find((f) => f.path === "src/main.rs")?.language).toBe("rust");
    const chunks = await c.chunks.find({ projectId: project._id }).toArray();
    expect(chunks.filter((x) => x.path === "src/main.rs").map((x) => x.startLine)).toEqual([1, 61, 121]);
    expect(chunks.some((x) => x.path === "pnpm-lock.yaml")).toBe(false);
    expect(JSON.stringify(chunks)).not.toContain("TOKEN=abc");
    const types = (await c.artifacts.find({ projectId: project._id }).toArray()).map((a) => a.type).sort();
    expect(types).toEqual(["commit", "file", "file", "issue", "readme"]);
    const p = (await c.projects.findOne({ _id: project._id }))!;
    expect(p).toMatchObject({ syncStatus: "succeeded", syncGeneration: 1 });
    expect(p.stats).toEqual({ commits: 42, releases: 3, issues: 7, pullRequests: 5, files: 5 });
    // README 40, no docs/license/contributing; 1 recent commit => low
    expect(p.health).toEqual({ overall: 32, documentation: 40, activity: 20 });
    expect(p.healthLabel).toBe("At risk");
    expect(p.lastSyncedAt).toBeInstanceOf(Date);
    expect(await c.activityEvents.countDocuments({ projectId: project._id, type: "sync" })).toBe(1);
  });

  it("reuses unchanged blobs, refetches changed ones, skips minified files", async () => {
    const { github, project, c, sync } = await setup();
    github.addFile("app.min.js", "x=1");
    await sync();
    expect(github.streamed).not.toContain("app.min.js");
    const min = await c.repoFiles.findOne({ projectId: project._id, path: "app.min.js" });
    expect(min).toMatchObject({ isLarge: true, content: null });
    expect(await c.chunks.countDocuments({ projectId: project._id, path: "app.min.js" })).toBe(0);
    await sync();
    expect(github.blobCalls).toEqual([]);
    const readme = () => c.repoFiles.findOne({ projectId: project._id, path: "README.md", gen: 3 });
    expect(await c.chunks.countDocuments({ projectId: project._id, path: "src/main.rs" })).toBe(3);
    github.addFile("README.md", "# changed");
    await sync();
    expect(github.blobCalls).toEqual([]);
    expect(await readme()).toMatchObject({ content: "# changed" });
  });

  it("mid-run failure keeps the previous generation and marks failed", async () => {
    const { github, project, c, sync } = await setup();
    await sync();
    const before = await c.chunks.countDocuments({ projectId: project._id, gen: 1 });
    github.failOn = "listIssues";
    github.failWith = new Error("secret gho_leak");
    const job = await sync();
    expect(job.status).toBe("failed");
    expect(job.error).not.toContain("gho_");
    const p = (await c.projects.findOne({ _id: project._id }))!;
    expect(p).toMatchObject({ syncStatus: "failed", healthLabel: "Last sync failed", syncGeneration: 1 });
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 1 })).toBe(before);
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 2 })).toBe(0);
    expect(await c.repoFiles.countDocuments({ projectId: project._id, gen: 1 })).toBe(5);
  });

  it("second sync swaps generations and keeps gen:null artifacts", async () => {
    const { project, c, sync } = await setup();
    await sync();
    await c.artifacts.insertOne({
      _id: new ObjectId(), projectId: project._id, type: "decision", externalId: "decision:1", key: "k".repeat(24),
      title: "d", path: null, url: null, summary: null, body: "b", createdAt: date, updatedAt: date, gen: null,
    });
    await sync();
    expect(await c.repoFiles.countDocuments({ projectId: project._id, gen: 1 })).toBe(0);
    expect(await c.repoFiles.countDocuments({ projectId: project._id, gen: 2 })).toBe(5);
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 1 })).toBe(0);
    expect(await c.artifacts.countDocuments({ projectId: project._id, gen: null })).toBe(1);
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(2);
  });

  it("boot recovery fails orphaned running jobs and projects", async () => {
    const { project, c, runner } = await setup();
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    await runner.recoverOrphans();
    expect(await c.syncJobs.findOne({ _id: job._id })).toMatchObject({
      status: "failed",
      error: "Interrupted by restart",
    });
    expect((await c.projects.findOne({ _id: project._id }))?.syncStatus).toBe("failed");
  });

  it("deleting the project mid-sync waits for the run and leaves no rows", async () => {
    const { github, project, c, runner } = await setup();
    let open!: () => void;
    github.gate = new Promise<void>((r) => (open = r));
    await c.syncJobs.insertOne(newJob(project._id));
    const done = runner.start(project._id);
    await new Promise((r) => setTimeout(r, 50));
    // abort() resolves only once the run settles, so release the gate while deleting
    const deleting = deleteProject(db, project, runner);
    open();
    await deleting;
    await done;
    for (const col of [c.repoFiles, c.chunks, c.artifacts, c.syncJobs, c.activityEvents] as const) {
      expect(await (col as typeof c.chunks).countDocuments({ projectId: project._id })).toBe(0);
    }
    expect(await c.projects.findOne({ _id: project._id })).toBeNull();
  });

  it("failure in counts keeps the previous generation fully intact", async () => {
    const { github, project, c, sync } = await setup();
    await sync();
    const chunksBefore = await c.chunks.countDocuments({ projectId: project._id, gen: 1 });
    github.failOn = "countCommits";
    const job = await sync();
    expect(job.status).toBe("failed");
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 1 })).toBe(chunksBefore);
    expect(await c.repoFiles.countDocuments({ projectId: project._id, gen: 1 })).toBe(5);
    for (const col of [c.chunks, c.repoFiles, c.artifacts] as const) {
      expect(await (col as typeof c.chunks).countDocuments({ projectId: project._id, gen: 2 })).toBe(0);
    }
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(1);
  });

  it("failed re-sync leaves files, artifacts and stats identical", async () => {
    const { github, project, c, sync } = await setup();
    await sync();
    const snap = async () => ({
      files: await c.repoFiles.find({ projectId: project._id }).sort({ path: 1 }).toArray(),
      artifacts: await c.artifacts.find({ projectId: project._id }).sort({ key: 1 }).toArray(),
      p: (await c.projects.findOne({ _id: project._id }))!,
    });
    const before = await snap();
    github.failOn = "listPulls";
    expect((await sync()).status).toBe("failed");
    const after = await snap();
    expect(after.files).toEqual(before.files);
    expect(after.artifacts).toEqual(before.artifacts);
    expect(after.p).toMatchObject({
      syncStatus: "failed",
      healthLabel: "Last sync failed",
      stats: before.p.stats,
      health: before.p.health,
      lastSyncedAt: before.p.lastSyncedAt,
    });
  });

  it("first-ever failure gives 'Sync failed'", async () => {
    const { github, project, c, sync } = await setup();
    github.failOn = "listPulls";
    await sync();
    expect(await c.projects.findOne({ _id: project._id })).toMatchObject({
      syncStatus: "failed",
      healthLabel: "Sync failed",
      lastSyncedAt: null,
    });
  });

  it("leftover next-generation rows don't break the next sync", async () => {
    const { project, c, sync } = await setup();
    await c.repoFiles.insertOne({
      _id: new ObjectId(), projectId: project._id, path: "stale.txt", name: "stale.txt", language: null,
      size: 1, sha: "x", isBinary: false, isLarge: false, content: "stale", gen: 1,
    });
    expect((await sync()).status).toBe("succeeded");
    const paths = (await c.repoFiles.find({ projectId: project._id, gen: 1 }).toArray()).map((f) => f.path);
    expect(paths).not.toContain("stale.txt");
    expect(paths).toHaveLength(5);
  });

  it("project stays running until afterSync finishes", async () => {
    const { github, project, c } = await setup();
    let open!: () => void;
    const gate = new Promise<void>((r) => (open = r));
    let entered!: () => void;
    const inHook = new Promise<void>((r) => (entered = r));
    const runner = createSyncRunner({
      db,
      github,
      afterSync: async () => {
        entered();
        await gate;
      },
    });
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    const done = runner.start(project._id);
    await inHook;
    expect(await c.projects.findOne({ _id: project._id })).toMatchObject({ syncStatus: "running", syncGeneration: 1 });
    expect((await c.syncJobs.findOne({ _id: job._id }))?.status).toBe("running");
    open();
    await done;
    expect((await c.projects.findOne({ _id: project._id }))?.syncStatus).toBe("succeeded");
    expect((await c.syncJobs.findOne({ _id: job._id }))?.status).toBe("succeeded");
  });

  it("shutdown aborts runs and writes no status", async () => {
    const { github, project, c, runner } = await setup();
    let open!: () => void;
    github.gate = new Promise<void>((r) => (open = r));
    await c.syncJobs.insertOne(newJob(project._id));
    void runner.start(project._id);
    await new Promise((r) => setTimeout(r, 50));
    const stopping = runner.shutdown();
    open();
    await stopping;
    expect((await c.projects.findOne({ _id: project._id }))?.syncStatus).toBe("running");
  });

  it("listPulls failure also leaves no new-generation rows", async () => {
    const { github, project, c, sync } = await setup();
    github.failOn = "listPulls";
    expect((await sync()).status).toBe("failed");
    expect(await c.chunks.countDocuments({ projectId: project._id })).toBe(0);
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(0);
  });

  it("afterSync throwing does not fail the job or drop data", async () => {
    const { github, project, c } = await setup();
    const runner = createSyncRunner({
      db,
      github,
      afterSync: async () => {
        throw new Error("hook boom");
      },
    });
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    await runner.start(project._id);
    expect((await c.syncJobs.findOne({ _id: job._id }))?.status).toBe("succeeded");
    expect(await c.repoFiles.countDocuments({ projectId: project._id, gen: 1 })).toBe(5);
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 1 })).toBeGreaterThan(0);
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(1);
  });

  it("readme yields only file chunks, no readme-type chunks", async () => {
    const { project, c, sync } = await setup();
    await sync();
    const chunks = await c.chunks.find({ projectId: project._id }).toArray();
    expect(chunks.some((x) => x.type === ("readme" as string))).toBe(false);
    expect(chunks.some((x) => x.type === "file" && x.path === "README.md")).toBe(true);
    expect(await c.artifacts.countDocuments({ projectId: project._id, type: "readme" })).toBe(1);
  });

  it("does not fetch blobs for binary extensions", async () => {
    const { github, sync } = await setup();
    await sync();
    expect(github.streamed).not.toContain("logo.png");
    expect(github.streamed).toContain("src/main.rs");
    expect(github.blobCalls).toEqual([]);
  });

  it("refreshes description and default branch from the repository", async () => {
    const { github, project, c, sync } = await setup();
    github.addRepo("acme/widget", { description: "Fresh description", default_branch: "trunk" });
    await sync();
    expect(await c.projects.findOne({ _id: project._id })).toMatchObject({
      description: "Fresh description",
      defaultBranch: "trunk",
    });
  });

  it("returns 413 for a JSON body over 1MB", async () => {
    const { cookie } = await loginAs(db);
    const app = makeTestApp({ db, github: new FakeGithub() });
    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ fullName: "a/b", description: "x".repeat(1_100_000) }));
    expect(res.status).toBe(413);
    expect(res.body.message).toBe("Request body too large");
  });
});

describe("small-instance memory behavior", () => {
  /** a runner whose config was read with `env` applied; the env is restored right after */
  const runnerWith = (github: FakeGithub, env: Record<string, string>, embedder?: FakeEmbedder) => {
    const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
    Object.assign(process.env, env);
    resetConfig();
    const runner = createSyncRunner({ db, github, embedder });
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
    resetConfig();
    return runner;
  };
  const runWith = async (env: Record<string, string>, embedder?: FakeEmbedder) => {
    const ctx = await setup();
    const runner = runnerWith(ctx.github, env, embedder);
    const sync = async () => {
      const job = newJob(ctx.project._id);
      await ctx.c.syncJobs.insertOne(job);
      await runner.start(ctx.project._id);
      return (await ctx.c.syncJobs.findOne({ _id: job._id }))!;
    };
    return { ...ctx, sync, runnerWith: (e: Record<string, string>) => runnerWith(ctx.github, e) };
  };

  it("re-sync queries previous rows per batch and always with a path filter", async () => {
    const { project, c, sync } = await runWith({ SYNC_FILE_BATCH: "2" }, new FakeEmbedder());
    await sync();
    const spy = vi.spyOn(Collection.prototype, "find");
    try {
      await sync();
      const prevQueries = spy.mock.calls
        .map(([f]) => f as Record<string, unknown>)
        .filter((f) => f?.gen === 1 && String(f.projectId) === String(project._id));
      expect(prevQueries.length).toBeGreaterThanOrEqual(6); // 5 files / batch of 2 = 3 batches, files + chunks each
      for (const f of prevQueries) expect(f.path).toEqual({ $in: expect.any(Array) });
      for (const f of prevQueries) expect((f.path as { $in: string[] }).$in.length).toBeLessThanOrEqual(2);
    } finally {
      spy.mockRestore();
    }
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 2, embedding: { $exists: true } })).toBeGreaterThan(0);
  });

  it("reuses embeddings of unchanged chunks across batches", async () => {
    const embedder = new FakeEmbedder();
    const { sync } = await runWith({ SYNC_FILE_BATCH: "2" }, embedder);
    await sync();
    embedder.calls.length = 0;
    await sync();
    expect(embedder.calls.flat().filter((t) => t.includes("line 5"))).toEqual([]);
  });

  it("without an embedder a full sync completes with lexical-only chunks", async () => {
    const { project, c, sync } = await runWith({});
    expect((await sync()).status).toBe("succeeded");
    expect(await c.chunks.countDocuments({ projectId: project._id, embedding: { $exists: true } })).toBe(0);
    const p = (await c.projects.findOne({ _id: project._id }))!;
    expect((await retrieve(db, p, "widget hello")).length).toBeGreaterThan(0);
    const res = await searchFiles(db, p.ownerId, project._id.toHexString(), "line 5", null);
    expect(res).toMatchObject({ mode: "keyword" });
    expect(res.hits.some((h) => h.filePath === "src/main.rs")).toBe(true);
  });

  it("RSS limit fails the sync with a safe message and leaves the live generation intact", async () => {
    const { project, c, sync, runnerWith: limitedRunner } = await runWith({});
    await sync();
    const snap = async () => ({
      files: await c.repoFiles.find({ projectId: project._id }).sort({ path: 1 }).toArray(),
      chunks: await c.chunks.find({ projectId: project._id }).sort({ path: 1, startLine: 1 }).toArray(),
      p: (await c.projects.findOne({ _id: project._id }))!,
    });
    const before = await snap();
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    await limitedRunner({ SYNC_RSS_LIMIT_MB: "1", LOG_MEMORY: "true" }).start(project._id);
    const failed = (await c.syncJobs.findOne({ _id: job._id }))!;
    expect(failed).toMatchObject({ status: "failed", error: "Repository is too large for this server's memory limit" });
    const after = await snap();
    expect(after.files).toEqual(before.files);
    expect(after.chunks).toEqual(before.chunks);
    expect(after.p).toMatchObject({ syncStatus: "failed", syncGeneration: 1 });
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 2 })).toBe(0);
  });

  it("size gate fails before downloading and leaves the live generation untouched", async () => {
    const { github, project, c, sync } = await runWith({});
    await sync();
    const before = await c.repoFiles.find({ projectId: project._id }).sort({ path: 1 }).toArray();
    github.streamed.length = 0;
    github.addRepo("acme/widget", { sizeKb: 3 * 1024 });
    const gated = runnerWith(github, { SYNC_MAX_REPO_KB: "2048" });
    const job = newJob(project._id);
    await c.syncJobs.insertOne(job);
    await gated.start(project._id);
    expect(await c.syncJobs.findOne({ _id: job._id })).toMatchObject({ status: "failed", error: "Repository is too large for this server (limit 2 MB)" });
    expect(github.streamed).toEqual([]);
    expect(await c.repoFiles.find({ projectId: project._id }).sort({ path: 1 }).toArray()).toEqual(before);
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(1);
  });

  it("abort mid-stream leaves only the old generation", async () => {
    const { github, project, c, runner, sync } = await runWith({ SYNC_FILE_BATCH: "1" });
    await sync();
    const before = await c.chunks.countDocuments({ projectId: project._id, gen: 1 });
    github.afterYield = () => void runner.abort(project._id);
    await c.syncJobs.insertOne(newJob(project._id));
    await runner.start(project._id);
    expect(github.streamed.length).toBeLessThan(5 * 2);
    expect(await c.chunks.countDocuments({ projectId: project._id, gen: 1 })).toBe(before);
    for (const col of [c.chunks, c.repoFiles, c.artifacts] as const) {
      expect(await (col as typeof c.chunks).countDocuments({ projectId: project._id, gen: 2 })).toBe(0);
    }
    expect((await c.projects.findOne({ _id: project._id }))?.syncGeneration).toBe(1);
  });

  it("cursor retrieval and search rank seeded vectors like the full scan", async () => {
    const { project, c } = await setup();
    const base = { projectId: project._id, artifactId: null, type: "file" as const, url: "https://github.com/acme/widget", language: null, startLine: 1, gen: 0 };
    const seed = [
      ["a.ts", "alpha one", [1, 0, 0]],
      ["b.ts", "beta two", [0, 1, 0]],
      ["c.ts", "gamma three", [0.8, 0.6, 0]],
      ["d.ts", "delta four", [0.6, 0.8, 0]],
    ] as const;
    await c.chunks.insertMany(seed.map(([path, text, embedding]) => ({ ...base, _id: new ObjectId(), path, title: path, text, embedding: [...embedding] })));
    const p = (await c.projects.findOne({ _id: project._id }))!;
    const embedder = new FakeEmbedder();
    const got = await retrieve(db, p, "authenticate", { embedder, k: 1 }); // cos: a 1, c .8, d .6, b 0
    expect(got.map((x) => x.path)).toEqual(["a.ts", "c.ts"]);
    const res = await searchFiles(db, p.ownerId, project._id.toHexString(), "authenticate", null, undefined, undefined, embedder);
    expect(res.mode).toBe("semantic");
    expect(res.hits.map((h) => h.filePath)).toEqual(["a.ts", "c.ts", "d.ts"]);
  });

  it("keepTop keeps the best n, earliest first on ties", () => {
    const list: { cos: number; i: number }[] = [];
    for (let i = 0; i < 20; i++) keepTop(list, { cos: i % 2 ? 0.9 : 0.5, i }, 3);
    expect(list.sort((a, b) => b.cos - a.cos).slice(0, 3).map((x) => x.i)).toEqual([1, 3, 5]);
  });
});

describe("sync github token failures", () => {
  it("revoked: job failed with revoked message, sessions purged", async () => {
    const { github, project, c, sync } = await setup();
    github.failOn = "getRepo";
    github.failWith = new GithubAccessError(401, "revoked");
    const job = await sync();
    expect(job).toMatchObject({
      status: "failed",
      error: "GitHub access revoked. Sign in again to resync.",
    });
    expect(await c.sessions.countDocuments({ userId: project.ownerId })).toBe(0);
  });

  it("rate limited: job failed with rate-limit message, sessions untouched", async () => {
    const { github, project, c, sync } = await setup();
    github.failOn = "getRepo";
    github.failWith = new GithubAccessError(403, "rate_limited");
    const job = await sync();
    expect(job).toMatchObject({
      status: "failed",
      error: "GitHub rate limit reached. Try again later.",
    });
    expect(await c.sessions.countDocuments({ userId: project.ownerId })).toBeGreaterThan(0);
  });
  it("retries transient GitHub errors with backoff, then succeeds", async () => {
    const { github, project, c } = await setup();
    github.failOn = "listCommits";
    github.failWith = new GithubTransientError(503);
    github.failCount = 2;
    const runner = createSyncRunner({ db, github, retryDelayMs: 1 });
    await c.syncJobs.insertOne(newJob(project._id));
    await runner.start(project._id);
    expect((await c.projects.findOne({ _id: project._id }))?.syncStatus).toBe("succeeded");
  });

  it("gives up after 3 retries on persistent 5xx and keeps the failed state", async () => {
    const { github, project, c } = await setup();
    github.failOn = "listCommits";
    github.failWith = new GithubTransientError(502);
    const runner = createSyncRunner({ db, github, retryDelayMs: 1 });
    await c.syncJobs.insertOne(newJob(project._id));
    await runner.start(project._id);
    expect((await c.projects.findOne({ _id: project._id }))?.syncStatus).toBe("failed");
  });
});
