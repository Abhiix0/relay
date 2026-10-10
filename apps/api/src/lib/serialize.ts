import type {
  ActivityEventDoc,
  ArtifactDoc,
  AskAnswerDoc,
  DecisionDoc,
  OnboardingPlanDoc,
  ProjectAnalysisDoc,
  ProjectDoc,
  RepoFileDoc,
  SyncJobDoc,
  UserDoc,
} from "../db/collections";

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

export const toArtifact = (a: ArtifactDoc) => ({
  id: a._id.toHexString(),
  projectId: a.projectId.toHexString(),
  type: a.type,
  title: a.title,
  path: a.path,
  url: a.url,
  summary: a.summary,
  createdAt: iso(a.createdAt),
});

export const toArtifactDetail = (a: ArtifactDoc) => ({ ...toArtifact(a), body: a.body.slice(0, 20000) });

export const toActivity = (e: ActivityEventDoc) => ({
  id: e._id.toHexString(),
  projectId: e.projectId.toHexString(),
  type: e.type,
  title: e.title,
  description: e.description,
  createdAt: iso(e.createdAt),
});

export const toFileContent = (f: RepoFileDoc) => ({
  projectId: f.projectId.toHexString(),
  path: f.path,
  name: f.name,
  language: f.language,
  content: f.isBinary || f.isLarge ? "" : (f.content ?? ""),
  size: f.size,
  isBinary: f.isBinary,
  isLarge: f.isLarge,
});

export const toDecision = (d: DecisionDoc) => ({
  id: d._id.toHexString(),
  projectId: d.projectId.toHexString(),
  title: d.title,
  summary: d.summary,
  rationale: d.rationale,
  sources: d.sources,
  createdAt: iso(d.createdAt),
});

export const toOnboardingPlan = (p: OnboardingPlanDoc) => ({
  id: p._id.toHexString(),
  projectId: p.projectId.toHexString(),
  title: p.title,
  items: p.items,
  createdAt: iso(p.createdAt),
  updatedAt: iso(p.updatedAt),
});

export const toOnboardingData = (p: ProjectDoc, a: ProjectAnalysisDoc | null, handoffReady: boolean) => ({
  id: a ? a._id.toHexString() : "pending",
  projectId: p._id.toHexString(),
  projectOverview: a?.projectOverview ?? {
    name: p.name,
    description: p.description,
    repository: p.fullName,
    primaryLanguage: p.language,
    technologies: [],
  },
  architecture: a?.architecture ?? { summary: "", mainModules: [] },
  keyFiles: a?.keyFiles ?? [],
  gettingStarted: a?.gettingStarted ?? [],
  progress: {
    repositoryConnected: true,
    repositoryIndexed: p.syncStatus === "succeeded",
    structureAnalyzed: a !== null,
    handoffReady,
  },
});

export const toAskAnswer =(a: AskAnswerDoc) => ({
  id: a._id.toHexString(),
  projectId: a.projectId.toHexString(),
  question: a.question,
  answer: a.answer,
  sources: a.sources,
  confidence: a.confidence,
  insufficientEvidence: a.insufficientEvidence,
  createdAt: iso(a.createdAt),
});
