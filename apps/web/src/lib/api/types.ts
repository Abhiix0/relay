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

export const artifactDetailSchema = artifactSchema.extend({ body: z.string() });
export type ArtifactDetail = z.infer<typeof artifactDetailSchema>;

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
  insufficientEvidence: z.boolean().optional(),
  createdAt: z.string().datetime(),
  isStreaming: z.boolean().optional(),
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

export const onboardingDataSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  projectOverview: z.object({
    name: z.string(),
    description: z.string(),
    repository: z.string(),
    primaryLanguage: z.string().nullable(),
    technologies: z.array(z.string()),
  }),
  architecture: z.object({
    summary: z.string(),
    mainModules: z.array(z.object({
      name: z.string(),
      path: z.string(),
      description: z.string(),
    })),
  }),
  keyFiles: z.array(z.object({
    id: z.string(),
    path: z.string(),
    description: z.string(),
    category: z.enum(["readme", "config", "entry", "important"]),
  })),
  gettingStarted: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
  })),
  progress: z.object({
    repositoryConnected: z.boolean(),
    repositoryIndexed: z.boolean(),
    structureAnalyzed: z.boolean(),
    handoffReady: z.boolean(),
  }),
});
export type OnboardingData = z.infer<typeof onboardingDataSchema>;

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
export const handoffSectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  body: z.string(),
  sources: z.array(sourceSchema),
  insufficientEvidence: z.boolean().optional(),
});
export type HandoffSection = z.infer<typeof handoffSectionSchema>;

export const handoffVersionMetadataSchema = z.object({
  version: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string().optional(),
});
export type HandoffVersionMetadata = z.infer<typeof handoffVersionMetadataSchema>;

export const handoffSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  summary: z.string(),
  sections: z.array(handoffSectionSchema),
  version: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Handoff = z.infer<typeof handoffSchema>;

export const handoffGenerateRequestSchema = z.object({
  projectId: z.string(),
  regenerate: z.boolean().optional(),
});
export type HandoffGenerateRequest = z.infer<typeof handoffGenerateRequestSchema>;

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

/* ── Repository Tree ──────────────────────────────────────── */
export const repositoryFileTypeSchema = z.enum(["file", "folder"]);
export type RepositoryFileType = z.infer<typeof repositoryFileTypeSchema>;

export interface RepositoryTreeItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: RepositoryTreeItem[];
  language?: string | null;
  size?: number;
}

export const repositoryTreeItemSchema: z.ZodType<RepositoryTreeItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    path: z.string(),
    type: repositoryFileTypeSchema,
    children: z.array(repositoryTreeItemSchema).optional(),
    language: z.string().nullable().optional(),
    size: z.number().optional(),
  })
);

export const repositoryTreeSchema = z.object({
  projectId: z.string(),
  repository: z.string(),
  tree: z.array(repositoryTreeItemSchema),
});
export type RepositoryTree = z.infer<typeof repositoryTreeSchema>;

/* ── File Content ─────────────────────────────────────────── */
export const fileContentSchema = z.object({
  projectId: z.string(),
  path: z.string(),
  name: z.string(),
  language: z.string().nullable(),
  content: z.string(),
  size: z.number(),
  isBinary: z.boolean().optional(),
  isLarge: z.boolean().optional(),
});
export type FileContent = z.infer<typeof fileContentSchema>;

/* ── Search Result ────────────────────────────────────────── */
export const searchResultItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: artifactTypeSchema,
  filePath: z.string(),
  fileName: z.string(),
  lineNumber: z.number().nullable(),
  snippet: z.string(),
  matchedText: z.string().optional(),
  language: z.string().nullable(),
});
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;

export const searchResultsSchema = z.object({
  query: z.string(),
  projectId: z.string().nullable(),
  language: z.string().nullable(),
  results: z.array(searchResultItemSchema),
  totalCount: z.number(),
});
export type SearchResults = z.infer<typeof searchResultsSchema>;

/* ── GitHub Repo Picker ───────────────────────────────────── */
export const githubRepoOptionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  name: z.string(),
  owner: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  private: z.boolean(),
  defaultBranch: z.string(),
  pushedAt: z.string().nullable(),
  connected: z.boolean(),
  connectedProjectId: z.string().nullable(),
});
export type GithubRepoOption = z.infer<typeof githubRepoOptionSchema>;

export const githubReposResponseSchema = z.object({
  repos: z.array(githubRepoOptionSchema),
  canAccessPrivate: z.boolean(),
});
export type GithubReposResponse = z.infer<typeof githubReposResponseSchema>;
