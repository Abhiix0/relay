import type { Source } from "./artifact";

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  rationale: string;
  sources: Source[];
  createdAt: string;
}
