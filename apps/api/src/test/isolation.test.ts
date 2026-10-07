import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Db } from "mongodb";
import { FakeGithub } from "./fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "./helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

type Method = "get" | "post" | "patch" | "put" | "delete";

/** Later phases append rows. `:id` is replaced with user A's project id. */
const ROUTES: [method: Method, path: string][] = [
  ["get", "/api/v1/projects/:id"],
  ["delete", "/api/v1/projects/:id"],
  ["get", "/api/v1/projects/:id/sync"],
  ["post", "/api/v1/projects/:id/sync"],
];

describe("tenant isolation", () => {
  it.each(ROUTES)("%s %s -> 404 for another user", async (method, path) => {
    const github = new FakeGithub();
    github.addRepo("acme/widget");
    const app = makeTestApp({ db, github });
    const a = await loginAs(db);
    const b = await loginAs(db);
    const created = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", a.cookie)
      .send({ fullName: "acme/widget" });
    const id: string = created.body.id;

    const res = await request(app)[method](path.replace(":id", id)).set("Cookie", b.cookie).send({});
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Project not found");

    const bad = await request(app)[method](path.replace(":id", "nothex")).set("Cookie", b.cookie).send({});
    expect(bad.status).toBe(404);

    const still = await request(app).get(`/api/v1/projects/${id}`).set("Cookie", a.cookie);
    expect(still.status).toBe(200);
  });
});
