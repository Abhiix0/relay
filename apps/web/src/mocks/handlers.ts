import { http, HttpResponse } from "msw";
import {
  mockActivityEvents,
  mockArtifacts,
  mockAskAnswers,
  mockDecisions,
  mockFileContents,
  mockHandoffs,
  mockOnboardingPlan,
  mockProjects,
  mockRepositoryTree,
  mockSearchResults,
  mockSyncJob,
  mockUser,
} from "./data";
import type {
  AskAnswer,
  Decision,
  Handoff,
  Project,
  SearchResults,
} from "@/lib/api/types";

// In-memory state
const projects = [...mockProjects];
const askAnswers = [...mockAskAnswers];
const decisions = [...mockDecisions];
const onboardingPlan = {
  ...mockOnboardingPlan,
  items: [...mockOnboardingPlan.items],
};
const handoffs = [...mockHandoffs];
let currentSyncJob = { ...mockSyncJob };

export const handlers = [
  // Auth
  http.get("/api/v1/auth/me", () => {
    return HttpResponse.json(mockUser);
  }),

  // Projects
  http.get("/api/v1/projects", () => {
    return HttpResponse.json(projects);
  }),

  http.get("/api/v1/projects/:id", ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return new HttpResponse(JSON.stringify({ message: "Project not found" }), {
        status: 404,
      });
    }
    return HttpResponse.json(project);
  }),

  http.post("/api/v1/projects", async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const fullName = body.fullName || "owner/repo";
    const name = fullName.split("/")[1] || fullName;
    const newProject: Project = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name,
      fullName,
      description: body.description || "Connected GitHub repository.",
      language: body.language || "TypeScript",
      owner: fullName.split("/")[0] || "user",
      syncStatus: "running",
      lastSyncedAt: new Date().toISOString(),
      stats: {
        commits: 120,
        pullRequests: 8,
        issues: 4,
        releases: 1,
        files: 240,
      },
      health: {
        overall: 0,
        documentation: 0,
        activity: "low",
      },
      healthLabel: "Indexing in progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.delete("/api/v1/projects/:id", ({ params }) => {
    const idx = projects.findIndex((p) => p.id === params.id);
    if (idx !== -1) {
      projects.splice(idx, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Artifacts & Files
  http.get("/api/v1/projects/:id/artifacts", ({ request, params }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const query = url.searchParams.get("q")?.toLowerCase();

    let list = mockArtifacts.filter((a) => a.projectId === params.id);
    if (type && type !== "all") {
      list = list.filter((a) => a.type === type);
    }
    if (query) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          (a.summary && a.summary.toLowerCase().includes(query)) ||
          (a.path && a.path.toLowerCase().includes(query))
      );
    }
    return HttpResponse.json(list);
  }),

  // Activity Events
  http.get("/api/v1/projects/:id/activity", ({ params }) => {
    const events = mockActivityEvents.filter((e) => e.projectId === params.id);
    return HttpResponse.json(events);
  }),

  // Ask Relay Agent
  http.get("/api/v1/projects/:id/ask", ({ params }) => {
    const answers = askAnswers.filter((a) => a.projectId === params.id);
    return HttpResponse.json(answers);
  }),

  http.post("/api/v1/projects/:id/ask", async ({ request, params }) => {
    const { question } = (await request.json()) as { question: string };
    const projectId = String(params.id);

    // Simulate delay for streaming
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check for insufficient evidence question
    const insufficientQuestions = [
      "authentication",
      "auth",
      "login",
      "database",
      "db connection",
      "payment",
    ];
    
    const isInsufficientEvidence = insufficientQuestions.some((kw) =>
      question.toLowerCase().includes(kw)
    );

    if (isInsufficientEvidence) {
      const newAnswer: AskAnswer = {
        id: `ask_${Date.now()}`,
        projectId,
        question,
        answer: "I couldn't find enough information in the indexed repository to answer this confidently. The repository focuses on build system functionality and doesn't contain extensive information about this topic.",
        sources: [],
        confidence: "insufficient",
        insufficientEvidence: true,
        createdAt: new Date().toISOString(),
      };
      askAnswers.unshift(newAnswer);
      return HttpResponse.json(newAnswer, { status: 201 });
    }

    // Normal answer with evidence
    const newAnswer: AskAnswer = {
      id: `ask_${Date.now()}`,
      projectId,
      question,
      answer: `Based on codebase indexing for **${projectId}**:\n\nThe requested functionality is implemented across the core modular pipelines. Specifically:\n\n1. Component configurations are validated against schema boundaries during initialization.\n2. In-memory DAG nodes represent dependencies and execute concurrently.\n3. Evidences and cache signatures are recorded in deterministic content-addressable storage.\n\nFor details on exact invocation, inspect the referenced files below.`,
      sources: [
        {
          id: `src_${Date.now()}_1`,
          type: "file",
          path: "crates/turborepo-lib/src/engine/builder.rs",
          url: "https://github.com/vercel/turbo/blob/main/crates/turborepo-lib/src/engine/builder.rs",
          snippet: "pub fn build_execution_graph(&self) -> Result<TaskGraph, EngineError> {",
        },
        {
          id: `src_${Date.now()}_2`,
          type: "decision",
          path: "docs/decisions/001-rust-core.md",
          url: "https://github.com/vercel/turbo/blob/main/docs/decisions/001-rust-core.md",
          snippet: "Deterministic latency guarantees under multi-threaded task dispatching.",
        },
      ],
      confidence: "high",
      insufficientEvidence: false,
      createdAt: new Date().toISOString(),
    };

    askAnswers.unshift(newAnswer);
    return HttpResponse.json(newAnswer, { status: 201 });
  }),

  // Architecture Decisions (ADR)
  http.get("/api/v1/projects/:id/decisions", ({ params }) => {
    const list = decisions.filter((d) => d.projectId === params.id);
    return HttpResponse.json(list);
  }),

  http.post("/api/v1/projects/:id/decisions", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Decision>;
    const newDecision: Decision = {
      id: `dec_${Date.now()}`,
      projectId: String(params.id),
      title: body.title || "Untitled Decision",
      summary: body.summary || "No summary provided.",
      rationale: body.rationale || "No rationale provided.",
      sources: body.sources || [],
      createdAt: new Date().toISOString(),
    };
    decisions.unshift(newDecision);
    return HttpResponse.json(newDecision, { status: 201 });
  }),

  // Onboarding Plan
  http.get("/api/v1/projects/:id/onboarding", ({ params }) => {
    if (onboardingPlan.projectId === params.id) {
      return HttpResponse.json(onboardingPlan);
    }
    return HttpResponse.json({
      ...onboardingPlan,
      projectId: String(params.id),
    });
  }),

  http.patch(
    "/api/v1/projects/:id/onboarding/items/:itemId",
    async ({ request, params }) => {
      const { completed } = (await request.json()) as { completed: boolean };
      const item = onboardingPlan.items.find((i) => i.id === params.itemId);
      if (item) {
        item.completed = completed;
      }
      return HttpResponse.json(onboardingPlan);
    }
  ),

  // Handoff Briefings
  http.get("/api/v1/projects/:id/handoffs", ({ params }) => {
    const list = handoffs.filter((h) => h.projectId === params.id);
    return HttpResponse.json(list);
  }),

  http.post("/api/v1/projects/:id/handoffs", async ({ request, params }) => {
    const body = (await request.json()) as Partial<Handoff>;
    const newHandoff: Handoff = {
      id: `handoff_${Date.now()}`,
      projectId: String(params.id),
      title: body.title || "Architecture & System Handoff",
      summary: body.summary || "Summary of recent architectural evolution.",
      version: (handoffs[0]?.version ?? 0) + 1,
      sections: body.sections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handoffs.unshift(newHandoff);
    return HttpResponse.json(newHandoff, { status: 201 });
  }),

  // Sync Jobs
  http.get("/api/v1/projects/:id/sync", () => {
    return HttpResponse.json(currentSyncJob);
  }),

  http.post("/api/v1/projects/:id/sync", ({ params }) => {
    const projectId = String(params.id);
    currentSyncJob = {
      id: `sync_${Date.now()}`,
      projectId,
      status: "queued",
      progress: 0,
      error: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    // Simulate sync progression
    setTimeout(() => {
      currentSyncJob.status = "running";
      currentSyncJob.progress = 25;
    }, 500);

    setTimeout(() => {
      currentSyncJob.progress = 50;
    }, 1500);

    setTimeout(() => {
      currentSyncJob.progress = 75;
    }, 2500);

    setTimeout(() => {
      currentSyncJob.status = "succeeded";
      currentSyncJob.progress = 100;
      currentSyncJob.completedAt = new Date().toISOString();
      
      // Update project status and lastSyncedAt
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        project.syncStatus = "succeeded";
        project.lastSyncedAt = new Date().toISOString();
        if (project.health) {
          project.health.overall = Math.min(100, (project.health.overall || 0) + 10);
          project.health.documentation = Math.min(100, (project.health.documentation || 0) + 5);
        }
      }
    }, 3500);

    return HttpResponse.json(currentSyncJob);
  }),

  // Repository Tree
  http.get("/api/v1/projects/:id/repository/tree", () => {
    return HttpResponse.json(mockRepositoryTree);
  }),

  // File Content
  http.get("/api/v1/projects/:id/repository/files/*", ({ params }) => {
    const filePath = String(params["*"]);
    const fileContent = mockFileContents[filePath];
    
    if (!fileContent) {
      return new HttpResponse(
        JSON.stringify({ message: "File not found" }),
        { status: 404 }
      );
    }
    
    return HttpResponse.json(fileContent);
  }),

  // Global Search
  http.get("/api/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const projectId = url.searchParams.get("projectId");
    const language = url.searchParams.get("language");

    // Filter results based on query params
    let results = mockSearchResults.results;

    if (projectId && projectId !== "all") {
      results = results.filter((r) => r.projectId === projectId);
    }

    if (language && language !== "all") {
      results = results.filter((r) => r.language === language);
    }

    if (query) {
      results = results.filter(
        (r) =>
          r.snippet.toLowerCase().includes(query.toLowerCase()) ||
          r.filePath.toLowerCase().includes(query.toLowerCase()) ||
          (r.matchedText && r.matchedText.toLowerCase().includes(query.toLowerCase()))
      );
    }

    const searchResults: SearchResults = {
      query,
      projectId,
      language,
      results,
      totalCount: results.length,
    };

    return HttpResponse.json(searchResults);
  }),
];
