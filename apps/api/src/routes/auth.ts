import { randomBytes, timingSafeEqual } from "node:crypto";
import { Router, type CookieOptions } from "express";
import type { Db } from "mongodb";
import { loadConfig } from "../config";
import type { GithubClient } from "../integrations/github";
import { perIpLimit } from "../middleware/rateLimit";
import { readCookie, requireUser } from "../middleware/auth";
import { requireJson } from "../middleware/requireJson";
import { toUser } from "../lib/serialize";
import {
  SESSION_TTL_MS,
  createSession,
  destroySession,
  upsertUserFromGithub,
} from "../services/authService";

const STATE_PATH = "/api/v1/auth";

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function authRouter(db: Db, github: GithubClient): Router {
  const router = Router();
  const cookieBase = (): CookieOptions => ({
    httpOnly: true,
    sameSite: "lax",
    secure: loadConfig().NODE_ENV === "production",
    path: "/",
  });
  const stateCookie = (): CookieOptions => ({ ...cookieBase(), path: STATE_PATH });
  const oauthLimit = () =>
    perIpLimit(30, () => `${loadConfig().PUBLIC_APP_URL}/sign-in?error=oauth_failed`);

  router.get("/auth/github", oauthLimit(), (_req, res) => {
    const state = randomBytes(16).toString("hex");
    res.cookie("relay_oauth_state", state, { ...stateCookie(), maxAge: 10 * 60 * 1000 });
    res.redirect(302, github.buildAuthorizeUrl(state, loadConfig().GITHUB_CALLBACK_URL));
  });

  router.get("/auth/github/callback", oauthLimit(), async (req, res) => {
    const appUrl = loadConfig().PUBLIC_APP_URL;
    const fail = () => {
      res.clearCookie("relay_oauth_state", stateCookie());
      res.redirect(302, `${appUrl}/sign-in?error=oauth_failed`);
    };
    const { code, state } = req.query;
    const expected = readCookie(req, "relay_oauth_state");
    if (typeof code !== "string" || typeof state !== "string" || !expected || !safeEqual(state, expected)) {
      return fail();
    }
    try {
      const { accessToken: token, scope } = await github.exchangeCode(
        code,
        loadConfig().GITHUB_CALLBACK_URL,
      );
      const profile = await github.getUser(token);
      const email = await github.getPrimaryEmail(token).catch(() => null);
      const user = await upsertUserFromGithub(db, { profile, email, token, scope });
      const oldSid = readCookie(req, "relay_sid");
      if (oldSid) await destroySession(db, oldSid).catch(() => undefined);
      const sid = await createSession(db, user._id);
      res.clearCookie("relay_oauth_state", stateCookie());
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
