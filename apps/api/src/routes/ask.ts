import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import type { LlmClient } from "../integrations/llm";
import type { Embedder } from "../lib/embedder";
import { toAskAnswer } from "../lib/serialize";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { perUserLimit } from "../middleware/rateLimit";
import { requireJson } from "../middleware/requireJson";
import { ask, listAnswers } from "../services/askService";

const body = z.object({ question: z.string().trim().min(1).max(2000) });

export function askRouter(db: Db, llm: LlmClient, embedder?: Embedder): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);

  router.get("/projects/:id/ask", auth, owned, async (req, res) => {
    res.json((await listAnswers(db, req.project!, req.user!._id)).map(toAskAnswer));
  });

  router.post("/projects/:id/ask", auth, owned, requireJson, perUserLimit(20), async (req, res) => {
    const { question } = body.parse(req.body);
    res.status(201).json(toAskAnswer(await ask(db, llm, req.project!, req.user!._id, question, embedder)));
  });

  return router;
}
