import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { requireUser } from "../middleware/auth";
import { perUserLimit } from "../middleware/rateLimit";
import { searchFiles } from "../services/searchService";

const query = z.object({
  q: z.string().trim().max(200).optional(),
  projectId: z.string().trim().optional(),
  language: z.string().trim().toLowerCase().optional(),
});

export function searchRouter(db: Db): Router {
  const router = Router();

  router.get("/search", requireUser(db), perUserLimit(30), async (req, res) => {
    const { q = "", projectId, language: lang } = query.parse(req.query);
    const language = !lang || lang === "all" ? null : lang;
    const pid = !projectId || projectId === "all" ? null : projectId;
    if (!q) {
      res.json({ query: "", projectId: null, language: null, results: [], totalCount: 0 });
      return;
    }

    const { hits, totalCount } = await searchFiles(db, req.user!._id, pid, q, language);
    res.json({
      query: q,
      projectId: pid,
      language,
      totalCount,
      results: hits.map((h) => {
        const fileName = h.path.split("/").pop() as string;
        return {
          id: `${h.projectId}:${h.path}`,
          projectId: h.projectId,
          type: /^readme(\.|$)/i.test(fileName) ? "readme" : "file",
          filePath: h.path,
          fileName,
          lineNumber: h.lineNumber,
          snippet: h.snippet,
          matchedText: h.matchedText,
          language: h.language,
        };
      }),
    });
  });

  return router;
}
