import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Db } from "mongodb";
import { userSchema } from "@web-types/types";
import { getCollections } from "../db/collections";
import { FAKE_TOKEN, FakeGithub } from "../test/fakes";
import { loginAs, makeTestApp, startTestDb, stopTestDb } from "../test/helpers";

let db: Db;
beforeAll(async () => {
  db = await startTestDb();
});
afterAll(stopTestDb);

const pick = (res: request.Response, name: string) =>
  ((res.headers["set-cookie"] as unknown as string[] | undefined) ?? []).find((c) =>
    c.startsWith(`${name}=`),
  );

describe("auth", () => {
  const app = () => makeTestApp({ db, github: new FakeGithub() });
  const fail = "http://localhost:5173/sign-in?error=oauth_failed";

  it("GET /auth/github sets state cookie and redirects", async () => {
    const res = await request(app()).get("/api/v1/auth/github");
    expect(res.status).toBe(302);
    const cookie = pick(res, "relay_oauth_state")!;
    expect(cookie).toMatch(/HttpOnly/i);
    const state = cookie.split(";")[0]!.split("=")[1]!;
    expect(res.headers.location).toContain(`state=${state}`);
  });

  it("full callback flow creates user and session", async () => {
    const res = await request(app())
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:5173/dashboard");
    const sid = pick(res, "relay_sid")!;
    expect(sid).toMatch(/HttpOnly/i);
    expect(sid).toMatch(/SameSite=Lax/i);
    const c = getCollections(db);
    expect(await c.users.countDocuments({ githubId: 4242 })).toBe(1);
    expect(await c.sessions.countDocuments()).toBeGreaterThan(0);

    const me = await request(app()).get("/api/v1/auth/me").set("Cookie", sid.split(";")[0]!);
    expect(me.status).toBe(200);
    expect(userSchema.parse(me.body).githubLogin).toBe("octo");
  });

  it("stores the token encrypted and never returns it", async () => {
    const res = await request(app())
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    const user = await getCollections(db).users.findOne({ githubId: 4242 });
    expect(JSON.stringify(user)).not.toContain(FAKE_TOKEN);
    expect(user!.encToken.data).toBeTruthy();
    const me = await request(app())
      .get("/api/v1/auth/me")
      .set("Cookie", pick(res, "relay_sid")!.split(";")[0]!);
    for (const r of [res, me]) {
      expect(JSON.stringify(r.body) + r.text + JSON.stringify(r.headers)).not.toContain(FAKE_TOKEN);
    }
  });

  it("falls back to noreply email and login as name", async () => {
    const gh = new FakeGithub();
    gh.profile = { id: 7, login: "ghost", name: null, avatarUrl: null };
    gh.email = null;
    await request(makeTestApp({ db, github: gh }))
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    const u = await getCollections(db).users.findOne({ githubId: 7 });
    expect(u!.email).toBe("ghost@users.noreply.github.com");
    expect(u!.name).toBe("ghost");
  });

  it("redirects with error on bad, missing or failed state/exchange", async () => {
    const r1 = await request(app()).get("/api/v1/auth/github/callback?code=good&state=x");
    expect(r1.headers.location).toBe(fail);
    const r2 = await request(app())
      .get("/api/v1/auth/github/callback?code=good&state=x")
      .set("Cookie", "relay_oauth_state=y");
    expect(r2.headers.location).toBe(fail);
    const r3 = await request(app())
      .get("/api/v1/auth/github/callback?code=bad&state=x")
      .set("Cookie", "relay_oauth_state=x");
    expect(r3.status).toBe(302);
    expect(r3.headers.location).toBe(fail);
    expect(pick(r3, "relay_sid")).toBeUndefined();
  });

  it("/auth/me is 401 without cookie", async () => {
    const res = await request(app()).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("unauthorized");
  });

  it("logout deletes the session", async () => {
    const { cookie } = await loginAs(db);
    expect((await request(app()).get("/api/v1/auth/me").set("Cookie", cookie)).status).toBe(200);
    const out = await request(app()).post("/api/v1/auth/logout").set("Cookie", cookie);
    expect(out.status).toBe(204);
    expect(
      await getCollections(db).sessions.countDocuments({ _id: cookie.split("=")[1]! }),
    ).toBe(0);
    expect((await request(app()).get("/api/v1/auth/me").set("Cookie", cookie)).status).toBe(401);
  });
});
