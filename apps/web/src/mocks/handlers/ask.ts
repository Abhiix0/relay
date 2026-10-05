import { http, HttpResponse } from "msw";
import { mockAskAnswers } from "../data/ask";
import type { AskAnswer } from "@/lib/api/types";

const askAnswers = [...mockAskAnswers];

const INSUFFICIENT_KEYWORDS = [
  "authentication",
  "auth",
  "login",
  "database",
  "db connection",
  "payment",
];

export const askHandlers = [
  http.get("/api/v1/projects/:id/ask", ({ params }) => {
    return HttpResponse.json(
      askAnswers.filter((a) => a.projectId === params.id)
    );
  }),

  http.post("/api/v1/projects/:id/ask", async ({ request, params }) => {
    const { question } = (await request.json()) as { question: string };
    const projectId = String(params.id);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const isInsufficient = INSUFFICIENT_KEYWORDS.some((kw) =>
      question.toLowerCase().includes(kw)
    );

    const newAnswer: AskAnswer = isInsufficient
      ? {
          id: `ask_${Date.now()}`,
          projectId,
          question,
          answer:
            "I couldn't find enough information in the indexed repository to answer this confidently.",
          sources: [],
          confidence: "insufficient",
          insufficientEvidence: true,
          createdAt: new Date().toISOString(),
        }
      : {
          id: `ask_${Date.now()}`,
          projectId,
          question,
          answer: `Based on codebase indexing for **${projectId}**: the requested functionality is implemented across the core modular pipelines.`,
          sources: [
            {
              id: `src_${Date.now()}_1`,
              type: "file",
              path: "crates/turborepo-lib/src/engine/builder.rs",
              url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
              snippet:
                "pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {",
            },
          ],
          confidence: "high",
          insufficientEvidence: false,
          createdAt: new Date().toISOString(),
        };

    askAnswers.unshift(newAnswer);
    return HttpResponse.json(newAnswer, { status: 201 });
  }),
];
