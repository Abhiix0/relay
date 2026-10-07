import { randomBytes } from "node:crypto";
import { Router, type CookieOptions } from "express";
import type { Db } from "mongodb";
import { loadConfig } from "../config";
import type { GithubClient } from "../integrations/github";
import { readCookie, requireUser } from "../middleware/auth";
import { requireJson } from "../middleware/requireJson";
import { toUser } from "../lib/serialize";
import {
  SESSION_TTL_MS,
  createSession,
  destroySession,
  upsertUserFromGithub,
} from "../services/authService";

export function authRouter(db: Db, github: GithubClient): Router {
  const router = Router();
  const cookieBase = (): CookieOptions => ({
    httpOnly: true,
    sameSite: "lax",
    secure: loadConfig().NODE_ENV === "production",
    path: "/",
  });

  router.get("/auth/github", (_req, res) => {
    const state = randomBytes(16).toString("hex");
    res.cookie("relay_oauth_state", state, { ...cookieBase(), maxAge: 10 * 60 * 1000 });
    res.redirect(302, github.buildAuthorizeUrl(state));
  });

  router.get("/auth/github/callback", async (req, res) => {
    const appUrl = loadConfig().PUBLIC_APP_URL;
    const fail = () => {
      res.clearCookie("relay_oauth_state", cookieBase());
      res.redirect(302, `${appUrl}/sign-in?error=oauth_failed`);
    };
    const { code, state } = req.query;
    const expected = readCookie(req, "relay_oauth_state");
    if (typeof code !== "string" || typeof state !== "string" || !expected || state !== expected) {
      return fail();
    }
    try {
      const token = await github.exchangeCode(code);
      const profile = await github.getUser(token);
      const email = await github.getPrimaryEmail(token);
      const user = await upsertUserFromGithub(db, { profile, email, token });
      const sid = await createSession(db, user._id);
      res.clearCookie("relay_oauth_state", cookieBase());
      res.cookie("relay_sid", sid, { ...cookieBase(), maxAge: SESSION_TTL_MS });
      res.redirect(302, `${appUrl}/dashboard`);
    } catch (err) {
      req.log?.error({ err: err instanceof Error ? err.message : "unknown" }, "oauth callback failed");
      fail();
    }
  });

  router.get("/auth/me", requireUser(db), (req, res) => {
    res.json(toUser(req.user!));
  });

  router.post("/auth/logout", requireJson, async (req, res) => {
    const sid = readCookie(req, "relay_sid");
    if (sid) await destroySession(db, sid);
    res.clearCookie("relay_sid", cookieBase());
    res.status(204).end();
  });

  return router;
}
