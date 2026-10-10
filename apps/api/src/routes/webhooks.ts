import { createHmac, timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { loadConfig } from "../config";
import { getCollections } from "../db/collections";
import type { SyncRunner } from "../jobs/syncRunner";
import { AppError } from "../lib/errors";
import { requestSync } from "../services/syncService";

const payload = z.object({
  ref: z.string().optional(),
  repository: z.object({ id: z.number() }),
});

function validSignature(secret: string, body: Buffer, header: string | undefined): boolean {
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Mounted before express.json: the HMAC covers the exact raw bytes. */
export function webhooksRouter(db: Db, runner?: SyncRunner): Router {
  const router = Router();
  const c = getCollections(db);

  router.post("/github", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
    const secret = loadConfig().GITHUB_WEBHOOK_SECRET;
    if (!secret) throw new AppError(503, "webhook_not_configured", "Webhooks are not configured");
    const body: unknown = req.body;
    if (!Buffer.isBuffer(body) || !validSignature(secret, body, req.header("x-hub-signature-256"))) {
      throw new AppError(401, "invalid_signature", "Invalid signature");
    }
    const delivery = req.header("x-github-delivery");
    if (!delivery) throw new AppError(400, "bad_request", "Missing delivery id");

    try {
      await c.webhookDeliveries.insertOne({ _id: delivery, createdAt: new Date() });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        res.json({ ok: true, duplicate: true });
        return;
      }
      throw err;
    }

    const event = req.header("x-github-event");
    if (!["push", "issues", "pull_request"].includes(event ?? "")) {
      res.json({ ok: true, ignored: true });
      return;
    }
    let parsed: z.infer<typeof payload>;
    try {
      parsed = payload.parse(JSON.parse(body.toString("utf8")));
    } catch {
      await c.webhookDeliveries.deleteOne({ _id: delivery });
      throw new AppError(400, "bad_request", "Invalid payload");
    }

    // shortcut: an event that lands during a running sync is coalesced into it; the next event or manual sync catches up
    let queued = 0;
    const projects = await c.projects.find({ repoId: parsed.repository.id, archivedAt: null, revokedAt: null }).toArray();
    for (const project of projects) {
      if (event === "push" && parsed.ref !== `refs/heads/${project.defaultBranch}`) continue;
      await requestSync(db, project, runner && ((id) => void runner.start(id)));
      queued++;
    }
    res.status(202).json({ ok: true, queued });
  });

  return router;
}
