import http from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { ObjectId, type Db } from "mongodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getCollections } from "../db/collections";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

async function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  const app = makeTestApp({ db, github, sse: { heartbeatMs: 40, pollMs: 20 } });
  const { cookie } = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName: "acme/widget" });
  const id: string = created.body.id;
  return { app, cookie, id, pid: new ObjectId(id) };
}

/** Opens the stream on a real socket and exposes everything received so far. */
function open(app: ReturnType<typeof makeTestApp>, id: string, cookie: string) {
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  let text = "";
  let contentType = "";
  const req = http.get({ port, path: `/api/v1/projects/${id}/events`, headers: { Cookie: cookie } }, (res) => {
    contentType = String(res.headers["content-type"]);
    res.setEncoding("utf8");
    res.on("data", (d: string) => (text += d));
  });
  req.on("error", () => undefined);
  const until = async (pred: (t: string) => boolean) => {
    for (let i = 0; i < 100 && !pred(text); i++) await new Promise((r) => setTimeout(r, 25));
    return text;
  };
  const close = () => {
    req.destroy();
    server.closeAllConnections();
    server.close();
  };
  return { until, close, type: () => contentType };
}

describe("GET /projects/:id/events", () => {
  it("streams status changes, progress and completion, with a heartbeat", async () => {
    const s = await setup();
    const c = getCollections(db);
    const stream = open(s.app, s.id, s.cookie);
    try {
      let t = await stream.until((x) => x.includes("event: sync"));
      expect(stream.type()).toContain("text/event-stream");
      expect(t).toContain('"syncStatus":"running"');
      expect(t).toContain('"progress":0');

      await c.syncJobs.updateOne({ projectId: s.pid }, { $set: { progress: 55 } });
      t = await stream.until((x) => x.includes('"progress":55'));
      expect(t).toContain('"progress":55');

      await c.syncJobs.updateOne({ projectId: s.pid }, { $set: { status: "succeeded", progress: 100 } });
      await c.projects.updateOne({ _id: s.pid }, { $set: { syncStatus: "succeeded", lastSyncedAt: new Date() } });
      t = await stream.until((x) => x.includes('"syncStatus":"succeeded"'));
      expect(t).toContain('"status":"succeeded"');

      t = await stream.until((x) => x.includes(": ping"));
      expect(t).toContain(": ping");
    } finally {
      stream.close();
    }
  });

  it("requires auth and hides other users' projects behind 404", async () => {
    const s = await setup();
    expect((await request(s.app).get(`/api/v1/projects/${s.id}/events`)).status).toBe(401);
    const other = await loginAs(db);
    const res = await request(s.app).get(`/api/v1/projects/${s.id}/events`).set("Cookie", other.cookie);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");
  });
});
