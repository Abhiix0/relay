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
