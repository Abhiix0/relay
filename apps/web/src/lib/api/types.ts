import { z } from "zod";

/* ── User ─────────────────────────────────────────────────── */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  githubLogin: z.string(),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof userSchema>;

/* ── Project ──────────────────────────────────────────────── */
export const projectSyncStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
]);
export type ProjectSyncStatus = z.infer<typeof projectSyncStatusSchema>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  description: z.string(),
  language: z.string().nullable(),
  owner: z.string(),
  syncStatus: projectSyncStatusSchema,
  lastSyncedAt: z.string().datetime().nullable(),
  stats: z.object({
    commits: z.number(),
    pullRequests: z.number(),
    issues: z.number(),
    releases: z.number(),
    files: z.number(),
  }),
  health: z
    .object({
      overall: z.number().min(0).max(100),
      documentation: z.number().min(0).max(100),
      activity: z.enum(["high", "medium", "low"]),
    })
    .optional(),
  healthLabel: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Project = z.infer<typeof projectSchema>;

/* ── Artifact ─────────────────────────────────────────────── */
export const artifactTypeSchema = z.enum([
  "file",
  "issue",
  "pr",
  "commit",
  "readme",
  "decision",
]);
export type ArtifactType = z.infer<typeof artifactTypeSchema>;

export const artifactSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: artifactTypeSchema,
  title: z.string(),
  path: z.string().nullable(),
  url: z.string().url().nullable(),
  summary: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type Artifact = z.infer<typeof artifactSchema>;

/* ── Source / Evidence ────────────────────────────────────── */
export const sourceSchema = z.object({
  id: z.string(),
  type: artifactTypeSchema,
  path: z.string().nullable(),
  url: z.string().url().nullable(),
  snippet: z.string(),
});
export type Source = z.infer<typeof sourceSchema>;

/* ── Ask / Answer ─────────────────────────────────────────── */
export const confidenceSchema = z.enum([
  "high",
  "medium",
  "low",
  "insufficient",
]);
export type Confidence = z.infer<typeof confidenceSchema>;

export const askAnswerSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  question: z.string(),
  answer: z.string(),
  sources: z.array(sourceSchema),
  confidence: confidenceSchema,
  createdAt: z.string().datetime(),
});
export type AskAnswer = z.infer<typeof askAnswerSchema>;

/* ── Decision ─────────────────────────────────────────────── */
export const decisionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  summary: z.string(),
  rationale: z.string(),
  sources: z.array(sourceSchema),
  createdAt: z.string().datetime(),
});
export type Decision = z.infer<typeof decisionSchema>;

/* ── Onboarding Plan ──────────────────────────────────────── */
export const onboardingItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  artifactIds: z.array(z.string()),
});
export type OnboardingItem = z.infer<typeof onboardingItemSchema>;

export const onboardingPlanSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  items: z.array(onboardingItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type OnboardingPlan = z.infer<typeof onboardingPlanSchema>;

/* ── Handoff ──────────────────────────────────────────────── */
export const handoffSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  summary: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
      sources: z.array(sourceSchema),
    })
  ),
  version: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Handoff = z.infer<typeof handoffSchema>;

/* ── SyncJob ──────────────────────────────────────────────── */
export const syncJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: projectSyncStatusSchema,
  progress: z.number().min(0).max(100),
  error: z.string().nullable(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});
export type SyncJob = z.infer<typeof syncJobSchema>;

/* ── Activity ─────────────────────────────────────────────── */
export const activityEventSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(["sync", "ask", "decision", "onboarding", "handoff"]),
  title: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;
