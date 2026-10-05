import type { Source } from "./artifact";

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
