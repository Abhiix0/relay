import { ObjectId, type Db } from "mongodb";
import { getCollections, type OnboardingPlanDoc, type ProjectAnalysisDoc, type ProjectDoc } from "../db/collections";
import { notFound } from "../lib/errors";

export async function getOnboardingData(
  db: Db,
  project: ProjectDoc,
): Promise<{ analysis: ProjectAnalysisDoc | null; handoffReady: boolean }> {
  const c = getCollections(db);
  const [analysis, handoff] = await Promise.all([
    c.projectAnalysis.findOne({ projectId: project._id }),
    c.handoffs.findOne({ projectId: project._id }, { projection: { _id: 1 } }),
  ]);
  return { analysis, handoffReady: handoff !== null };
}

export function getPlan(db: Db, project: ProjectDoc, userId: ObjectId): Promise<OnboardingPlanDoc | null> {
  return getCollections(db).onboardingPlans.findOne({ projectId: project._id, userId });
}

export async function setItemCompleted(
  db: Db,
  project: ProjectDoc,
  userId: ObjectId,
  itemId: string,
  completed: boolean,
): Promise<OnboardingPlanDoc> {
  const c = getCollections(db);
  const plan = await getPlan(db, project, userId);
  const item = plan?.items.find((i) => i.id === itemId);
  if (!plan || !item) throw notFound("Onboarding item not found");
  const now = new Date();
  await c.onboardingPlans.updateOne(
    { _id: plan._id, "items.id": itemId },
    { $set: { "items.$.completed": completed, updatedAt: now } },
  );
  if (completed && !item.completed) {
    await c.activityEvents.insertOne({
      _id: new ObjectId(),
      projectId: project._id,
      type: "onboarding",
      title: "Onboarding step completed",
      description: item.title.slice(0, 200),
      createdAt: now,
    });
  }
  return { ...plan, updatedAt: now, items: plan.items.map((i) => (i.id === itemId ? { ...i, completed } : i)) };
}
