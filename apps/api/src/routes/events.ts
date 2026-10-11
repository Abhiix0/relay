import { Router } from "express";
import type { Db } from "mongodb";
import { getCollections } from "../db/collections";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { iso } from "../lib/serialize";
import { getLatestSyncJob } from "../services/syncService";

export interface SseOptions {
  heartbeatMs?: number;
  pollMs?: number;
}

/** Server-sent sync status for one project: an event whenever status or progress changes, plus a keep-alive comment. */
export function eventsRouter(db: Db, { heartbeatMs = 25_000, pollMs = 1_000 }: SseOptions = {}): Router {
  const router = Router();
  const c = getCollections(db);

  router.get("/projects/:id/events", requireUser(db), loadOwnedProject(db), (req, res) => {
    const projectId = req.project!._id;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    let last = "";
    let busy = false;
    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const [project, job] = await Promise.all([c.projects.findOne({ _id: projectId }), getLatestSyncJob(db, projectId)]);
        if (!project) {
          res.end(); // deleted while connected
          return;
        }
        const data = JSON.stringify({
          syncStatus: project.syncStatus,
          status: job?.status ?? null,
          progress: job?.progress ?? 0,
          error: job?.error ?? null,
          lastSyncedAt: project.lastSyncedAt ? iso(project.lastSyncedAt) : null,
        });
        if (data !== last) {
          last = data;
          res.write(`event: sync\ndata: ${data}\n\n`);
        }
      } catch {
        // transient DB error: the next tick retries, and the client polls as a fallback
      } finally {
        busy = false;
      }
    };

    const pollTimer = setInterval(() => void poll(), pollMs);
    const beat = setInterval(() => res.write(": ping\n\n"), heartbeatMs);
    req.on("close", () => {
      clearInterval(pollTimer);
      clearInterval(beat);
    });
    void poll();
  });

  return router;
}
