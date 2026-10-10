import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { toDecision } from "../lib/serialize";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { requireJson } from "../middleware/requireJson";
import { createDecision, listDecisions } from "../services/decisionService";

const source = z.object({
  type: z.enum(["file", "issue", "pr", "commit", "readme", "decision"]),
  path: z.string().trim().max(1000).nullish().transform((v) => v ?? null),
  url: z.string().trim().url().nullish().transform((v) => v ?? null),
  snippet: z.string().trim().max(1000).default(""),
});

const body = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2000),
  rationale: z.string().trim().max(10000).default(""),
  sources: z.array(source).max(20).default([]),
});

export function decisionsRouter(db: Db): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);

  router.get("/projects/:id/decisions", auth, owned, async (req, res) => {
    res.json((await listDecisions(db, req.project!)).map(toDecision));
  });

  router.post("/projects/:id/decisions", auth, owned, requireJson, async (req, res) => {
    const input = body.parse(req.body);
    res.status(201).json(toDecision(await createDecision(db, req.project!, req.user!._id, input)));
  });

  return router;
}
