import { Router } from "express";
import type { Db } from "mongodb";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { requireJson } from "../middleware/requireJson";
import { notFound } from "../lib/errors";
import { toSyncJob } from "../lib/serialize";
import { getLatestSyncJob, requestSync } from "../services/syncService";

export function syncRouter(db: Db): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);

  router.get("/projects/:id/sync", auth, owned, async (req, res) => {
    const job = await getLatestSyncJob(db, req.project!._id);
    if (!job) throw notFound("Sync job not found");
    res.json(toSyncJob(job));
  });

  router.post("/projects/:id/sync", auth, requireJson, owned, async (req, res) => {
    res.json(toSyncJob(await requestSync(db, req.project!)));
  });

  return router;
}
