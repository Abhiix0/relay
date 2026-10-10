import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import type { Embedder } from "../lib/embedder";
import { requireUser } from "../middleware/auth";
import { perUserLimit } from "../middleware/rateLimit";
import { searchFiles } from "../services/searchService";

const query = z.object({
  q: z.string().trim().max(200).optional(),
  projectId: z.string().trim().optional(),
  language: z.string().trim().toLowerCase().optional(),
  type: z.enum(["all", "file", "readme", "issue", "pr", "commit", "decision"]).optional(),
  since: z.coerce.date().optional(),
  mode: z.enum(["keyword", "semantic"]).optional(),
});

export function searchRouter(db: Db, embedder?: Embedder): Router {
  const router = Router();

  router.get("/search", requireUser(db), perUserLimit(30), async (req, res) => {
    const { q = "", projectId, language: lang, type, since, mode } = query.parse(req.query);
    const language = !lang || lang === "all" ? null : lang;
    const pid = !projectId || projectId === "all" ? null : projectId;
    if (!q) {
      res.json({ query: "", projectId: null, language: null, results: [], totalCount: 0 });
      return;
    }

    const { hits, totalCount, mode: used } = await searchFiles(
      db,
      req.user!._id,
      pid,
      q,
      language,
      type,
      since,
      mode === "semantic" ? embedder : undefined,
    );
    res.json({
      query: q,
      projectId: pid,
      language,
      totalCount,
      mode: used,
      results: hits,
    });
  });

  return router;
}
