import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { getCollections } from "../db/collections";
import type { GithubClient, GithubUserRepo } from "../integrations/github";
import { requireUser } from "../middleware/auth";
import { perUserLimit } from "../middleware/rateLimit";
import { decryptUserToken, mapGithubError } from "../services/githubErrors";

const querySchema = z.object({ q: z.string().trim().max(100).default("") });
const TTL_MS = 60_000;

export function githubReposRouter(db: Db, github: GithubClient): Router {
  const router = Router();
  // shortcut: per-process cache, never evicted; fine for one instance, upgrade if scaled out
  const cache = new Map<string, { at: number; repos: GithubUserRepo[] }>();

  router.get("/github/repos", requireUser(db), perUserLimit(30), async (req, res) => {
    const { q } = querySchema.parse(req.query);
    const user = req.user!;
    const key = user._id.toHexString();
    let hit = cache.get(key);
    if (!hit || Date.now() - hit.at > TTL_MS) {
      const token = await decryptUserToken(db, user);
      try {
        hit = { at: Date.now(), repos: await github.listUserRepos(token) };
      } catch (err) {
        throw await mapGithubError(db, user._id, err);
      }
      cache.set(key, hit);
    }
    const needle = q.toLowerCase();
    const repos = hit.repos.filter((r) => r.full_name.toLowerCase().includes(needle)).slice(0, 100);
    const connected = await getCollections(db)
      .projects.find({ ownerId: user._id, repoId: { $in: repos.map((r) => r.id) } })
      .toArray();
    const byRepo = new Map(connected.map((p) => [p.repoId, p._id.toHexString()]));
    res.json({
      repos: repos.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        owner: r.owner,
        description: r.description,
        language: r.language,
        private: r.private,
        defaultBranch: r.default_branch,
        pushedAt: r.pushedAt ? new Date(r.pushedAt).toISOString() : null,
        connected: byRepo.has(r.id),
        connectedProjectId: byRepo.get(r.id) ?? null,
      })),
      canAccessPrivate: user.scope.split(/[\s,]+/).includes("repo"),
    });
  });

  return router;
}
