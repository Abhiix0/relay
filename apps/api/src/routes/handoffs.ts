import { Router } from "express";
import { ObjectId, type Db } from "mongodb";
import { z } from "zod";
import type { LlmClient } from "../integrations/llm";
import { toHandoff } from "../lib/serialize";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { perUserLimit } from "../middleware/rateLimit";
import { requireJson } from "../middleware/requireJson";
import {
  cloneCurrent,
  createManual,
  generate,
  getCurrent,
  getVersion,
  listHandoffs,
  patchCurrent,
} from "../services/handoffService";

const title = z.string().trim().min(1).max(200);
const summary = z.string().trim().min(1).max(2000);
const source = z.object({
  id: z.string().trim().min(1),
  type: z.enum(["file", "issue", "pr", "commit", "readme", "decision"]),
  path: z.string().nullable(),
  url: z.string().url().nullable(),
  snippet: z.string(),
});
const section = z.object({
  id: z.string().trim().min(1).optional(),
  heading: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  sources: z.array(source).default([]),
  insufficientEvidence: z.boolean().optional(),
});
const sections = z.array(section).max(30);

const query = z.object({ version: z.string().regex(/^[1-9]\d*$/).optional() });
const generateBody = z.object({ regenerate: z.boolean().optional() });
const createBody = z.object({ title, summary, sections: sections.optional() });
const patchBody = z
  .object({ title: title.optional(), summary: summary.optional(), sections: sections.optional() })
  .refine((b) => Object.values(b).some((v) => v !== undefined), { message: "At least one field is required" });
const versionBody = z.object({ description: z.string().max(200).optional() });

const withIds = (s: z.infer<typeof sections> = []) =>
  s.map((x) => ({ ...x, id: x.id ?? `sec_${new ObjectId().toHexString()}` }));

export function handoffsRouter(db: Db, llm: LlmClient): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);
  const base = "/projects/:id/handoffs";

  router.get(base, auth, owned, async (req, res) => {
    const { version } = query.parse(req.query);
    if (version) return void res.json(toHandoff(await getVersion(db, req.project!, Number(version))));
    res.json((await listHandoffs(db, req.project!)).map(toHandoff));
  });

  router.get(`${base}/current`, auth, owned, async (req, res) => {
    res.json(toHandoff(await getCurrent(db, req.project!)));
  });

  router.post(`${base}/generate`, auth, owned, requireJson, perUserLimit(20), async (req, res) => {
    const { regenerate } = generateBody.parse(req.body);
    res.json(toHandoff(await generate(db, llm, req.project!, req.user!._id, regenerate ?? false)));
  });

  router.patch(`${base}/current`, auth, owned, requireJson, async (req, res) => {
    const { sections: s, ...rest } = patchBody.parse(req.body);
    res.json(toHandoff(await patchCurrent(db, req.project!, { ...rest, ...(s && { sections: withIds(s) }) })));
  });

  router.post(`${base}/versions`, auth, owned, requireJson, async (req, res) => {
    versionBody.parse(req.body);
    res.status(201).json(toHandoff(await cloneCurrent(db, req.project!, req.user!._id)));
  });

  router.post(base, auth, owned, requireJson, async (req, res) => {
    const b = createBody.parse(req.body);
    res.status(201).json(toHandoff(await createManual(db, req.project!, req.user!._id, { ...b, sections: withIds(b.sections) })));
  });

  return router;
}
