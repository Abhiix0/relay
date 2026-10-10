import { createHmac, randomUUID } from "node:crypto";
import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resetConfig } from "../config";
import { getCollections } from "../db/collections";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

const SECRET = "whsec_test";
let db: Db;
beforeAll(async () => {
  process.env.GITHUB_WEBHOOK_SECRET = SECRET;
  resetConfig();
  db = await startTestDb();
});
afterAll(async () => {
  delete process.env.GITHUB_WEBHOOK_SECRET;
  resetConfig();
  await stopTestDb();
});

async function setup() {
  const github = new FakeGithub();
  const repo = github.addRepo("acme/widget");
  const app = makeTestApp({ db, github });
  const { cookie } = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName: "acme/widget" });
  const pid = new ObjectId(created.body.id as string);
  const c = getCollections(db);
  const settle = async () => {
    await c.syncJobs.updateMany({ projectId: pid }, { $set: { status: "succeeded" } });
    await c.projects.updateOne({ _id: pid }, { $set: { syncStatus: "succeeded", lastSyncedAt: new Date() } });
  };
  await settle();
  const send = (
    event: string,
    body: object,
    o: { delivery?: string; sign?: boolean; signature?: string } = {},
  ) => {
    const raw = JSON.stringify(body);
    const sig = o.signature ?? `sha256=${createHmac("sha256", SECRET).update(raw).digest("hex")}`;
    return request(app)
      .post("/api/v1/webhooks/github")
      .set("Content-Type", "application/json")
      .set("X-GitHub-Event", event)
      .set("X-GitHub-Delivery", o.delivery ?? randomUUID())
      .set("X-Hub-Signature-256", sig)
      .send(raw);
  };
  const jobs = () => c.syncJobs.countDocuments({ projectId: pid });
  const status = async () => (await c.projects.findOne({ _id: pid }))?.syncStatus;
  return { repo, pid, c, send, settle, jobs, status };
}

describe("POST /webhooks/github", () => {
  it("push to the default branch queues a sync for the matching project", async () => {
    const s = await setup();
    const res = await s.send("push", { ref: "refs/heads/main", repository: { id: s.repo.id } });
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ ok: true, queued: 1 });
    expect(await s.status()).toBe("running");
    expect(await s.jobs()).toBe(2);
  });

  it("issues and pull_request events queue too; other events and branches do not", async () => {
    const s = await setup();
    expect((await s.send("issues", { repository: { id: s.repo.id } })).body.queued).toBe(1);
    await s.settle();
    expect((await s.send("pull_request", { repository: { id: s.repo.id } })).body.queued).toBe(1);
    await s.settle();
    expect((await s.send("push", { ref: "refs/heads/feature", repository: { id: s.repo.id } })).body.queued).toBe(0);
    expect((await s.send("star", { repository: { id: s.repo.id } })).body).toEqual({ ok: true, ignored: true });
    expect(await s.status()).toBe("succeeded");
  });

  it("rejects a bad or missing signature with no side effects", async () => {
    const s = await setup();
    const body = { ref: "refs/heads/main", repository: { id: s.repo.id } };
    const before = await s.jobs();
    const deliveries = await s.c.webhookDeliveries.countDocuments({});
    expect((await s.send("push", body, { signature: "sha256=deadbeef" })).status).toBe(401);
    expect((await s.send("push", body, { signature: "" })).status).toBe(401);
    expect(await s.jobs()).toBe(before);
    expect(await s.status()).toBe("succeeded");
    expect(await s.c.webhookDeliveries.countDocuments({})).toBe(deliveries);
  });

  it("a duplicate delivery id is acknowledged without side effects", async () => {
    const s = await setup();
    const body = { ref: "refs/heads/main", repository: { id: s.repo.id } };
    const delivery = randomUUID();
    expect((await s.send("push", body, { delivery })).status).toBe(202);
    await s.settle();
    const jobs = await s.jobs();
    const again = await s.send("push", body, { delivery });
    expect(again.body).toEqual({ ok: true, duplicate: true });
    expect(await s.jobs()).toBe(jobs);
    expect(await s.status()).toBe("succeeded");
  });

  it("skips archived and revoked projects and unknown repositories", async () => {
    const s = await setup();
    expect((await s.send("issues", { repository: { id: 1 } })).body.queued).toBe(0);
    await s.c.projects.updateOne({ _id: s.pid }, { $set: { archivedAt: new Date() } });
    expect((await s.send("issues", { repository: { id: s.repo.id } })).body.queued).toBe(0);
    await s.c.projects.updateOne({ _id: s.pid }, { $set: { archivedAt: null, revokedAt: new Date() } });
    expect((await s.send("issues", { repository: { id: s.repo.id } })).body.queued).toBe(0);
  });

  it("a malformed payload is 400 and the delivery can be retried", async () => {
    const s = await setup();
    const delivery = randomUUID();
    expect((await s.send("push", { nope: true }, { delivery })).status).toBe(400);
    const ok = await s.send("push", { ref: "refs/heads/main", repository: { id: s.repo.id } }, { delivery });
    expect(ok.status).toBe(202);
  });
});
