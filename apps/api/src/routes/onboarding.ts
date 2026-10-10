import { Router } from "express";
import type { Db } from "mongodb";
import { z } from "zod";
import { toOnboardingData, toOnboardingPlan } from "../lib/serialize";
import { requireUser } from "../middleware/auth";
import { loadOwnedProject } from "../middleware/loadOwnedProject";
import { requireJson } from "../middleware/requireJson";
import { getOnboardingData, getPlan, setItemCompleted } from "../services/onboardingService";

const body = z.object({ completed: z.boolean() });

export function onboardingRouter(db: Db): Router {
  const router = Router();
  const auth = requireUser(db);
  const owned = loadOwnedProject(db);

  router.get("/projects/:id/onboarding/data", auth, owned, async (req, res) => {
    const { analysis, handoffReady } = await getOnboardingData(db, req.project!);
    res.json(toOnboardingData(req.project!, analysis, handoffReady));
  });

  router.get("/projects/:id/onboarding", auth, owned, async (req, res) => {
    const plan = await getPlan(db, req.project!, req.user!._id);
    const now = new Date().toISOString();
    res.json(
      plan
        ? toOnboardingPlan(plan)
        : { id: "pending", projectId: req.project!._id.toHexString(), title: "Onboarding plan", items: [], createdAt: now, updatedAt: now },
    );
  });

  router.patch("/projects/:id/onboarding/items/:itemId", auth, owned, requireJson, async (req, res) => {
    const { completed } = body.parse(req.body);
    const plan = await setItemCompleted(db, req.project!, req.user!._id, String(req.params.itemId), completed);
    res.json(toOnboardingPlan(plan));
  });

  return router;
}
