import type { Db, ObjectId } from "mongodb";

export interface EncToken {
  iv: string;
  tag: string;
  data: string;
}

export interface UserDoc {
  _id: ObjectId;
  githubId: number;
  githubLogin: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  /** null once the owner revoked their last connection */
  encToken: EncToken | null;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc {
  _id: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

export type SyncStatus = "queued" | "running" | "succeeded" | "failed";

export interface ProjectDoc {
  _id: ObjectId;
  ownerId: ObjectId;
  repoId: number;
  fullName: string;
  name: string;
  owner: string;
  description: string;
  language: string | null;
  defaultBranch: string;
  visibility: string;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  stats: { commits: number; pullRequests: number; issues: number; releases: number; files: number };
  health?: { overall: number; documentation: number; activity: number };
  healthLabel: string;
  syncGeneration: number;
  archivedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberDoc {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  role: "owner";
  createdAt: Date;
}

export interface SyncJobDoc {
  _id: ObjectId;
  projectId: ObjectId;
  status: SyncStatus;
  progress: number;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface RepoFileDoc {
  _id: ObjectId;
  projectId: ObjectId;
  path: string;
  name: string;
  language: string | null;
  size: number;
  sha: string;
  isBinary: boolean;
  isLarge: boolean;
  content: string | null;
  gen: number;
}

export interface ArtifactDoc {
  _id: ObjectId;
  projectId: ObjectId;
  type: string;
  externalId: string;
  /** stable API id: sha256(projectId:externalId), survives re-syncs */
  key: string;
  title: string;
  path: string | null;
  url: string | null;
  summary: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  /** null for decision mirrors; sync cleanup skips them */
  gen: number | null;
}

export interface ChunkDoc {
  _id: ObjectId;
  projectId: ObjectId;
  artifactId: ObjectId | null;
  type: string;
  path: string | null;
  url: string;
  title: string;
  language: string | null;
  startLine: number;
  text: string;
  /** unit-length sentence embedding; absent when no embedder was available at sync time */
  embedding?: number[];
  gen: number | null;
}

export interface SourceValue {
  id: string;
  type: string;
  path: string | null;
  url: string | null;
  snippet: string;
}

export interface DecisionDoc {
  _id: ObjectId;
  projectId: ObjectId;
  title: string;
  summary: string;
  rationale: string;
  sources: SourceValue[];
  createdBy: ObjectId;
  createdAt: Date;
}

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  artifactIds: string[];
}

export interface OnboardingPlanDoc {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  title: string;
  items: OnboardingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectAnalysisDoc {
  _id: ObjectId;
  projectId: ObjectId;
  projectOverview: {
    name: string;
    description: string;
    repository: string;
    primaryLanguage: string | null;
    technologies: string[];
  };
  architecture: { summary: string; mainModules: { name: string; path: string; description: string }[] };
  keyFiles: { id: string; path: string; description: string; category: "readme" | "config" | "entry" | "important" }[];
  gettingStarted: { step: number; title: string; description: string }[];
  generatedAt: Date;
}

export interface HandoffSection {
  id: string;
  heading: string;
  body: string;
  sources: SourceValue[];
  insufficientEvidence?: boolean;
}

export interface HandoffDoc {
  _id: ObjectId;
  projectId: ObjectId;
  version: number;
  title: string;
  summary: string;
  sections: HandoffSection[];
  authorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AskAnswerDoc {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  question: string;
  answer: string;
  sources: SourceValue[];
  confidence: string;
  insufficientEvidence: boolean;
  trace: { retrievedChunkIds: ObjectId[]; model: string; latencyMs: number };
  createdAt: Date;
}

export interface AgentRunDoc {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  question: string;
  toolsUsed: { tool: string; args: string }[];
  sources: SourceValue[];
  intent: string;
  response: string;
  /** degradations worth knowing about, e.g. the embedder being unavailable */
  notes?: string[];
  /** ms */
  latency: number;
  createdAt: Date;
}

export interface ActivityEventDoc {
  _id: ObjectId;
  projectId: ObjectId;
  type: string;
  title: string;
  description: string;
  createdAt: Date;
}

export function getCollections(db: Db) {
  return {
    users: db.collection<UserDoc>("users"),
    sessions: db.collection<SessionDoc>("sessions"),
    projects: db.collection<ProjectDoc>("projects"),
    syncJobs: db.collection<SyncJobDoc>("sync_jobs"),
    repoFiles: db.collection<RepoFileDoc>("repo_files"),
    artifacts: db.collection<ArtifactDoc>("artifacts"),
    chunks: db.collection<ChunkDoc>("chunks"),
    decisions: db.collection<DecisionDoc>("decisions"),
    onboardingPlans: db.collection<OnboardingPlanDoc>("onboarding_plans"),
    projectAnalysis: db.collection<ProjectAnalysisDoc>("project_analysis"),
    handoffs: db.collection<HandoffDoc>("handoffs"),
    askAnswers: db.collection<AskAnswerDoc>("ask_answers"),
    activityEvents: db.collection<ActivityEventDoc>("activity_events"),
    members: db.collection<MemberDoc>("members"),
    webhookDeliveries: db.collection<{ _id: string; createdAt: Date }>("webhook_deliveries"),
    agentRuns: db.collection<AgentRunDoc>("agent_runs"),
  };
}

export type Collections = ReturnType<typeof getCollections>;
