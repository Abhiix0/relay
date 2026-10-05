import { authHandlers } from "./auth";
import { projectHandlers } from "./projects";
import { artifactHandlers } from "./artifacts";
import { askHandlers } from "./ask";
import { decisionHandlers } from "./decisions";
import { onboardingHandlers } from "./onboarding";
import { handoffHandlers } from "./handoff";
import { syncHandlers } from "./sync";
import { repositoryHandlers } from "./repository";
import { searchHandlers } from "./search";

export const handlers = [
  ...authHandlers,
  ...projectHandlers,
  ...artifactHandlers,
  ...askHandlers,
  ...decisionHandlers,
  ...onboardingHandlers,
  ...handoffHandlers,
  ...syncHandlers,
  ...repositoryHandlers,
  ...searchHandlers,
];
