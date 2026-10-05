/* ── User ─────────────────────────────────────────────────── */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  githubLogin: string;
  createdAt: string;
}

/* ── Project ──────────────────────────────────────────────── */
export interface Project {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string | null;
  owner: string;
  syncStatus: "queued" | "running" | "succeeded" | "failed";
  lastSyncedAt: string | null;
  stats: {
    commits: number;
    pullRequests: number;
    issues: number;
    releases: number;
    files: number;
  };
  health?: {
    overall: number;
    documentation: number;
    activity: "high" | "medium" | "low";
  };
  healthLabel: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Artifact ─────────────────────────────────────────────── */
export interface Artifact {
  id: string;
  projectId: string;
  type: "file" | "issue" | "pr" | "commit" | "readme" | "decision";
  title: string;
  path: string | null;
  url: string | null;
  summary: string | null;
  createdAt: string;
}

/* ── Source / Evidence ────────────────────────────────────── */
export interface Source {
  id: string;
  type: Artifact["type"];
  path: string | null;
  url: string | null;
  snippet: string;
}

/* ── Ask / Answer ─────────────────────────────────────────── */
export interface AskAnswer {
  id: string;
  projectId: string;
  question: string;
  answer: string;
  sources: Source[];
  confidence: "high" | "medium" | "low" | "insufficient";
  insufficientEvidence?: boolean;
  createdAt: string;
  isStreaming?: boolean;
}

/* ── Decision ─────────────────────────────────────────────── */
export interface Decision {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  rationale: string;
  sources: Source[];
  createdAt: string;
}

/* ── Onboarding Plan ──────────────────────────────────────── */
export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  artifactIds: string[];
}

export interface OnboardingData {
  id: string;
  projectId: string;
  projectOverview: {
    name: string;
    description: string;
    repository: string;
    primaryLanguage: string | null;
    technologies: string[];
  };
  architecture: {
    summary: string;
    mainModules: Array<{
      name: string;
      path: string;
      description: string;
    }>;
  };
  keyFiles: Array<{
    id: string;
    path: string;
    description: string;
    category: "readme" | "config" | "entry" | "important";
  }>;
  gettingStarted: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  progress: {
    repositoryConnected: boolean;
    repositoryIndexed: boolean;
    structureAnalyzed: boolean;
    handoffReady: boolean;
  };
}

export interface OnboardingPlan {
  id: string;
  projectId: string;
  title: string;
  items: OnboardingItem[];
  createdAt: string;
  updatedAt: string;
}

/* ── Handoff ──────────────────────────────────────────────── */
export interface HandoffSection {
  id: string;
  heading: string;
  body: string;
  sources: Source[];
  insufficientEvidence?: boolean;
}

export interface Handoff {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  sections: HandoffSection[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

/* ── SyncJob ──────────────────────────────────────────────── */
export interface SyncJob {
  id: string;
  projectId: string;
  status: Project["syncStatus"];
  progress: number;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

/* ── Activity ─────────────────────────────────────────────── */
export interface ActivityEvent {
  id: string;
  projectId: string;
  type: "sync" | "ask" | "decision" | "onboarding" | "handoff";
  title: string;
  description: string;
  createdAt: string;
}

/* ── Repository Tree ──────────────────────────────────────── */
export interface RepositoryTreeItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: RepositoryTreeItem[];
  language?: string | null;
  size?: number;
}

export interface RepositoryTree {
  projectId: string;
  repository: string;
  tree: RepositoryTreeItem[];
}

/* ── File Content ─────────────────────────────────────────── */
export interface FileContent {
  projectId: string;
  path: string;
  name: string;
  language: string | null;
  content: string;
  size: number;
  isBinary?: boolean;
  isLarge?: boolean;
}

/* ── Search Result ────────────────────────────────────────── */
export interface SearchResultItem {
  id: string;
  projectId: string;
  type: Artifact["type"];
  filePath: string;
  fileName: string;
  lineNumber: number | null;
  snippet: string;
  matchedText?: string;
  language: string | null;
}

export interface SearchResults {
  query: string;
  projectId: string | null;
  language: string | null;
  results: SearchResultItem[];
  totalCount: number;
}
