import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ObjectId, type Db } from "mongodb";
import { getCollections, type ProjectDoc } from "../db/collections";
import { deleteProject } from "../services/projectService";
import { newJob } from "../services/syncService";
import { GithubAccessError } from "../integrations/github";
import { FakeGithub } from "../test/fakes";
import request from "supertest";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";
import { createSyncRunner } from "./syncRunner";

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
    expect(p).toMatchObject({ syncStatus: "failed", healthLabel: "Sync failed", syncGeneration: 1 });
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
    expect(github.blobCalls).not.toContain("sha:logo.png");
    expect(github.blobCalls).toContain("sha:src/main.rs");
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
});
