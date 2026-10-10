import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import type { SyncRunner } from "../jobs/syncRunner";
import type { GithubClient } from "../integrations/github";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { perUserLimit } from "../middleware/rateLimit";
import { requireJson } from "../middleware/requireJson";
import { toProject } from "../lib/serialize";
import { archiveProject, createProject, deleteProject, listProjects, revokeProject, unarchiveProject } from "../services/projectService";

const createSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(140)
    .regex(/^[\w.-]+\/[\w.-]+$/),
  description: z.string().trim().max(500).optional(),
  language: z.string().trim().max(50).optional(),
});

export function projectsRouter(db: Db, github: GithubClient, runner?: SyncRunner): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);
  const createLimit = perUserLimit(5);

  router.get("/projects", auth, async (req, res) => {
    res.json((await listProjects(db, req.user!._id, req.query.archived === "true")).map(toProject));
  });

  router.post("/projects", auth, requireJson, createLimit, async (req, res) => {
    const input = createSchema.parse(req.body);
    res.status(201).json(toProject(await createProject(db, github, req.user!, input, runner)));
  });

  router.get("/projects/:id", auth, owned, (req, res) => {
    res.json(toProject(req.project!));
  });

  router.post("/projects/:id/archive", auth, owned, requireJson, async (req, res) => {
    res.json(toProject(await archiveProject(db, req.project!, runner)));
  });

  router.post("/projects/:id/unarchive", auth, owned, requireJson, async (req, res) => {
    res.json(toProject(await unarchiveProject(db, req.project!)));
  });

  router.post("/projects/:id/revoke", auth, owned, requireJson, async (req, res) => {
    res.json(toProject(await revokeProject(db, req.project!, runner)));
  });

  router.delete("/projects/:id", auth, owned, async (req, res) => {
    await deleteProject(db, req.project!, runner);
    res.status(204).end();
  });

  return router;
}
