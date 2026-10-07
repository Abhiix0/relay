import type { ProjectDoc, SyncJobDoc, UserDoc } from "../db/collections";

export const iso = (d: Date): string => d.toISOString();

export const toUser = (u: UserDoc) => ({
  id: u._id.toHexString(),
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  githubLogin: u.githubLogin,
  createdAt: iso(u.createdAt),
});

const activityLevel = (n: number): "high" | "medium" | "low" =>
  n >= 66 ? "high" : n >= 33 ? "medium" : "low";

export const toProject = (p: ProjectDoc) => ({
  id: p._id.toHexString(),
  name: p.name,
  fullName: p.fullName,
  description: p.description,
  language: p.language,
  owner: p.owner,
  syncStatus: p.syncStatus === "queued" ? ("running" as const) : p.syncStatus,
  lastSyncedAt: p.lastSyncedAt ? iso(p.lastSyncedAt) : null,
  stats: p.stats,
  ...(p.health && {
    health: {
      overall: p.health.overall,
      documentation: p.health.documentation,
      activity: activityLevel(p.health.activity),
    },
  }),
  healthLabel: p.healthLabel,
  createdAt: iso(p.createdAt),
  updatedAt: iso(p.updatedAt),
});

export const toSyncJob = (j: SyncJobDoc) => ({
  id: j._id.toHexString(),
  projectId: j.projectId.toHexString(),
  status: j.status === "queued" ? ("running" as const) : j.status,
  progress: j.progress,
  error: j.error,
  startedAt: iso(j.startedAt),
  completedAt: j.completedAt ? iso(j.completedAt) : null,
});
