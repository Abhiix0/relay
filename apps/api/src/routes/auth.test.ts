import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Db } from "mongodb";
import { userSchema } from "@web-types/types";
import { stripQuery } from "../app";
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
  const fail = "http://localhost:5200/sign-in?error=oauth_failed";

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
    expect(res.headers.location).toBe("http://localhost:5200/dashboard");
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
    const out = await request(app()).post("/api/v1/auth/logout").set("Content-Type", "application/json").set("Cookie", cookie);
    expect(out.status).toBe(204);
    expect(
      await getCollections(db).sessions.countDocuments({ _id: cookie.split("=")[1]! }),
    ).toBe(0);
    expect((await request(app()).get("/api/v1/auth/me").set("Cookie", cookie)).status).toBe(401);
  });

  it("authorize URL carries redirect_uri and the same one is used for the exchange", async () => {
    const gh = new FakeGithub();
    const a = makeTestApp({ db, github: gh });
    const res = await request(a).get("/api/v1/auth/github");
    const redirect = new URL(res.headers.location!).searchParams.get("redirect_uri");
    expect(redirect).toBe("http://localhost:5200/api/v1/auth/github/callback");
    await request(a)
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    expect(gh.exchangeRedirectUri).toBe(redirect);
  });

  it("state cookie is scoped to the auth path", async () => {
    const res = await request(app()).get("/api/v1/auth/github");
    expect(pick(res, "relay_oauth_state")).toMatch(/Path=\/api\/v1\/auth/i);
  });

  it("stores the granted scope, not the configured one", async () => {
    const gh = new FakeGithub();
    gh.grantedScope = "read:user";
    await request(makeTestApp({ db, github: gh }))
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    expect((await getCollections(db).users.findOne({ githubId: 4242 }))!.scope).toBe("read:user");
  });

  it("login succeeds with noreply email when getPrimaryEmail throws", async () => {
    const gh = new FakeGithub();
    gh.profile = { id: 8, login: "mailless", name: null, avatarUrl: null };
    gh.emailThrows = true;
    const res = await request(makeTestApp({ db, github: gh }))
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", "relay_oauth_state=abc");
    expect(res.headers.location).toBe("http://localhost:5200/dashboard");
    expect((await getCollections(db).users.findOne({ githubId: 8 }))!.email).toBe(
      "mailless@users.noreply.github.com",
    );
  });

  it("deletes the previous session on login", async () => {
    const { cookie } = await loginAs(db);
    const oldSid = cookie.split("=")[1]!;
    const res = await request(app())
      .get("/api/v1/auth/github/callback?code=good&state=abc")
      .set("Cookie", [cookie, "relay_oauth_state=abc"]);
    expect(res.headers.location).toBe("http://localhost:5200/dashboard");
    expect(await getCollections(db).sessions.countDocuments({ _id: oldSid })).toBe(0);
  });

  it("a state of different length redirects to oauth_failed", async () => {
    const res = await request(app())
      .get("/api/v1/auth/github/callback?code=good&state=abcd")
      .set("Cookie", "relay_oauth_state=abc");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(fail);
  });

  it("rate limits the callback per IP", async () => {
    const a = app();
    const hit = () =>
      request(a)
        .get("/api/v1/auth/github/callback?code=good&state=abc")
        .set("Cookie", "relay_oauth_state=abc");
    for (let i = 0; i < 30; i++) expect((await hit()).headers.location).toContain("/dashboard");
    const limited = await hit();
    expect(limited.status).toBe(302);
    expect(limited.headers.location).toBe(fail);
  });

  it("log serializer strips the query string", () => {
    expect(stripQuery("/api/v1/auth/github/callback?code=secret&state=s")).toBe(
      "/api/v1/auth/github/callback",
    );
    expect(stripQuery("/api/v1/healthz")).toBe("/api/v1/healthz");
  });
});
