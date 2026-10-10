import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { notFound } from "../lib/errors";
import { toActivity, toArtifact, toArtifactDetail, toFileContent } from "../lib/serialize";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import {
  getArtifact,
  getFile,
  getTree,
  listActivity,
  listArtifacts,
} from "../services/explorerService";

const listQuery = z.object({
  type: z.enum(["all", "file", "issue", "pr", "commit", "readme", "decision"]).optional(),
  q: z.string().trim().max(200).optional(),
  since: z.coerce.date().optional(),
});

export function explorerRouter(db: Db): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);

  router.get("/projects/:id/artifacts", auth, owned, async (req, res) => {
    const { type, q, since } = listQuery.parse(req.query);
    res.json((await listArtifacts(db, req.project!, type, q, since)).map(toArtifact));
  });

  router.get("/projects/:id/artifacts/:artifactId", auth, owned, async (req, res) => {
    const a = await getArtifact(db, req.project!, String(req.params.artifactId));
    if (!a) throw notFound("Artifact not found");
    res.json(toArtifactDetail(a));
  });

  router.get("/projects/:id/activity", auth, owned, async (req, res) => {
    res.json((await listActivity(db, req.project!)).map(toActivity));
  });

  router.get("/projects/:id/repository/tree", auth, owned, async (req, res) => {
    const p = req.project!;
    res.json({ projectId: p._id.toHexString(), repository: p.fullName, tree: await getTree(db, p) });
  });

  router.get("/projects/:id/repository/files/*path", auth, owned, async (req, res) => {
    const f = await getFile(db, req.project!, (req.params.path as unknown as string[]).join("/"));
    if (!f) throw notFound("File not found");
    res.json(toFileContent(f));
  });

  return router;
}
