import type { Source } from "./artifact";

export type Confidence = "high" | "medium" | "low" | "insufficient";

export interface AskAnswer {
  id: string;
  projectId: string;
  question: string;
  answer: string;
  sources: Source[];
  confidence: Confidence;
  insufficientEvidence?: boolean;
  createdAt: string;
  isStreaming?: boolean;
}
