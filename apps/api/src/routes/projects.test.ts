import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ObjectId, type Db } from "mongodb";
import { projectSchema, syncJobSchema } from "@web-types/types";
import { getCollections } from "../db/collections";
import { FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

function setup() {
  const github = new FakeGithub();
  github.addRepo("acme/widget");
  return makeTestApp({ db, github });
}

const post = (app: ReturnType<typeof setup>, cookie: string, fullName: string) =>
  request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName });

describe("projects", () => {
  it("creates, lists, gets; parses contract; job created; sync idempotent", async () => {
    const app = setup();
    const { cookie } = await loginAs(db);
    const created = await post(app, cookie, "acme/widget");
    expect(created.status).toBe(201);
    const project = projectSchema.parse(created.body);
    expect(project.syncStatus).toBe("running");
    expect(project.healthLabel).toBe("Indexing in progress");
    expect(project.health).toBeUndefined();

    const list = await request(app).get("/api/v1/projects").set("Cookie", cookie);
    expect(projectSchema.array().parse(list.body).map((p) => p.id)).toEqual([project.id]);
    const one = await request(app).get(`/api/v1/projects/${project.id}`).set("Cookie", cookie);
    projectSchema.parse(one.body);

    const sync = await request(app).get(`/api/v1/projects/${project.id}/sync`).set("Cookie", cookie);
    const job = syncJobSchema.parse(sync.body);
    expect(job).toMatchObject({ status: "running", progress: 0 });
    const again = await request(app)
      .post(`/api/v1/projects/${project.id}/sync`)
      .set("Cookie", cookie)
      .send({});
    expect(again.status).toBe(200);
    expect(syncJobSchema.parse(again.body).id).toBe(job.id);
  });

  it("rejects bad fullName with 422", async () => {
    const app = setup();
    const { cookie } = await loginAs(db);
    expect((await post(app, cookie, "not a repo")).status).toBe(422);
  });

  it("duplicate is 409, unknown repo is 404", async () => {
    const app = setup();
    const { cookie } = await loginAs(db);
    expect((await post(app, cookie, "acme/widget")).status).toBe(201);
    const dup = await post(app, cookie, "acme/widget");
    expect(dup.status).toBe(409);
    expect(dup.body.message).toBe("Repository already connected");
    const missing = await post(app, cookie, "acme/nope");
    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe("Repository not found or not accessible");
  });

  it("requires auth", async () => {
    const app = setup();
    expect((await request(app).get("/api/v1/projects")).status).toBe(401);
  });

  it("delete cascades and returns 204", async () => {
    const app = setup();
    const { cookie } = await loginAs(db);
    const id: string = (await post(app, cookie, "acme/widget")).body.id;
    const projectId = new ObjectId(id);
    const c = getCollections(db);
    await c.activityEvents.insertOne({
      _id: new ObjectId(),
      projectId,
      type: "sync",
      title: "t",
      description: "d",
      createdAt: new Date(),
    });
    const del = await request(app).delete(`/api/v1/projects/${id}`).set("Cookie", cookie);
    expect(del.status).toBe(204);
    expect(await c.projects.countDocuments({ _id: projectId })).toBe(0);
    expect(await c.syncJobs.countDocuments({ projectId })).toBe(0);
    expect(await c.activityEvents.countDocuments({ projectId })).toBe(0);
    expect((await request(app).get(`/api/v1/projects/${id}`).set("Cookie", cookie)).status).toBe(404);
  });

  it("rate limits POST /projects to 5/min per user", async () => {
    const app = setup();
    const { cookie } = await loginAs(db);
    let last = 0;
    for (let i = 0; i < 6; i++) last = (await post(app, cookie, "bad")).status;
    expect(last).toBe(429);
  });
});
