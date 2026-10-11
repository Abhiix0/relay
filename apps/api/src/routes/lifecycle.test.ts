import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ObjectId, type Db } from "mongodb";
import { projectSchema, userSchema } from "@web-types/types";
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
  const app = makeTestApp({ db, github });
  const { cookie, user } = await loginAs(db);
  const created = await request(app).post("/api/v1/projects").set("Cookie", cookie).send({ fullName: "acme/widget" });
  return { app, cookie, user, id: created.body.id as string };
}

describe("project lifecycle", () => {
  it("GET /me aliases /auth/me", async () => {
    const { app, cookie } = await setup();
    const res = await request(app).get("/api/v1/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    userSchema.parse(res.body);
  });

  it("creates an owner member row; delete removes it", async () => {
    const { app, cookie, user, id } = await setup();
    const c = getCollections(db);
    expect(await c.members.findOne({ projectId: new ObjectId(id), userId: user._id })).toMatchObject({ role: "owner" });
    await request(app).delete(`/api/v1/projects/${id}`).set("Cookie", cookie).expect(204);
    expect(await c.members.countDocuments({ projectId: new ObjectId(id) })).toBe(0);
  });

  it("archive hides from the active list, stops the sync and refuses new ones; unarchive restores", async () => {
    const { app, cookie, id } = await setup();
    const url = `/api/v1/projects/${id}`;
    const res = await request(app).post(`${url}/archive`).set("Cookie", cookie).send({});
    expect(res.status).toBe(200);
    expect(projectSchema.parse(res.body).syncStatus).toBe("failed");
    const active = await request(app).get("/api/v1/projects").set("Cookie", cookie);
    expect(active.body.map((p: { id: string }) => p.id)).not.toContain(id);
    const archived = await request(app).get("/api/v1/projects?archived=true").set("Cookie", cookie);
    expect(archived.body.map((p: { id: string }) => p.id)).toEqual([id]);
    expect((await request(app).post(`${url}/sync`).set("Cookie", cookie).send({})).status).toBe(409);

    await request(app).post(`${url}/unarchive`).set("Cookie", cookie).send({}).expect(200);
    const back = await request(app).get("/api/v1/projects").set("Cookie", cookie);
    expect(back.body.map((p: { id: string }) => p.id)).toContain(id);
    expect((await request(app).post(`${url}/sync`).set("Cookie", cookie).send({})).status).toBe(200);
  });

  it("revoke drops the token with the last live connection and refuses sync, keeping data readable", async () => {
    const { app, cookie, user, id } = await setup();
    const url = `/api/v1/projects/${id}`;
    await request(app).post(`${url}/revoke`).set("Cookie", cookie).send({}).expect(200);
    expect((await getCollections(db).users.findOne({ _id: user._id }))?.encToken).toBeNull();
    expect((await request(app).post(`${url}/sync`).set("Cookie", cookie).send({})).status).toBe(409);
    expect((await request(app).get(url).set("Cookie", cookie)).status).toBe(200);
  });

  it("other users get 404 on archive, unarchive and revoke", async () => {
    const { app, id } = await setup();
    const other = await loginAs(db);
    for (const action of ["archive", "unarchive", "revoke"]) {
      const res = await request(app).post(`/api/v1/projects/${id}/${action}`).set("Cookie", other.cookie).send({});
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Project not found");
    }
  });
});
