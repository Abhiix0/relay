
# RELAY

## Project Handoff & Engineering Context Platform
### Product Requirements Document
**Version:** 1.0 | October 2026
> **North Star:** Understand any codebase faster.

---

# 1. Executive Summary

Relay is a full-stack engineering context platform that helps developers understand, join, maintain, and hand off software projects. It connects to a GitHub repository, continuously ingests relevant project signals, organizes them into a searchable project context layer, and exposes that context through a focused workspace and evidence-grounded agent.

The product is designed around a specific failure mode in software teams: project knowledge is fragmented across source code, issues, pull requests, documentation, commits, CI activity, and individual memory. Relay turns those fragments into a living project map without pretending that an AI model is the source of truth.

### Product thesis

Relay should feel less like “chat with your repository” and more like “a senior engineer who has actually read the repository, knows where the evidence lives, and can guide a newcomer through it.” The product is therefore evidence-first, project-aware, and workflow-oriented.

| Item | Definition |
|---|---|
| **Product** | Relay |
| **Category** | Developer productivity / engineering knowledge platform |
| **Primary users** | Software developers, technical leads, maintainers, engineering managers |
| **Core problem** | Loss and fragmentation of project context during onboarding, maintenance, and handoffs |
| **Primary value** | Reduce time-to-understanding and make project knowledge easier to transfer |
| **Initial integration** | GitHub |
| **Core stack** | React / Node.js / Express / MongoDB / Redis / AI agent / GitHub API |
| **MVP principle** | Build a narrow, reliable repository context loop before adding broad integrations |

# 2. Product Vision

Relay becomes the context layer that sits between a software team and the history of its codebase. A developer should be able to enter an unfamiliar project, understand the architecture, discover why important decisions exist, locate current risks, and produce a clean handoff without manually excavating months of project history.

### Vision statement

> Make project knowledge durable, navigable, and actionable.

### Long-term product direction

- Repository-aware onboarding for individual developers and teams.
- A continuously updated project memory grounded in source artifacts and project activity.
- Agent workflows that explain, connect, summarize, detect, and generate handoff artifacts.
- Team collaboration around shared context, rather than a separate AI conversation detached from the project.
- Extensible integrations beyond GitHub after the core context pipeline is reliable.

# 3. Problem Definition

## 3.1 Problem statement

When developers inherit an existing codebase, their learning path is rarely explicit. Important information is scattered across README files, directory structure, source code, issues, PR discussions, commits, CI workflows, deployment notes, and tribal knowledge. The cost is not only onboarding time. Context fragmentation also increases duplicated investigations, repeated questions, undocumented decisions, and risky changes to unfamiliar areas.

## 3.2 Jobs to be done

| Job | Current friction | Relay response |
|---|---|---|
| **Understand a repository** | Docs are incomplete and code is large | Generate a project map with links to evidence |
| **Learn an unfamiliar subsystem** | Developer must trace files and history manually | Explain subsystem flow and relevant files |
| **Understand why a decision exists** | Reasoning is buried in old PRs/issues | Extract decision context and link evidence |
| **Catch up after absence** | Need to review many changes | Summarize meaningful project changes |
| **Prepare a handoff** | Context lives in one person’s head | Generate a structured handoff from current state |
| **Find current risks** | Open issues and CI signals are disconnected | Surface notable unfinished or unstable areas |

## 3.3 Goals

- Make a newly connected repository understandable within minutes rather than hours of manual exploration.
- Provide evidence-backed explanations with traceable source references.
- Keep project context fresh through GitHub webhooks and scheduled synchronization.
- Provide a workflow for generating onboarding plans and handoff summaries.
- Demonstrate production-style full-stack engineering: authentication, integrations, persistence, background processing, realtime updates, observability, and deployment.

## 3.4 Non-goals

- Relay is not a GitHub replacement and will not become a source-control host.
- Relay will not autonomously modify production code in the MVP.
- Relay is not a generic chatbot or general-purpose personal knowledge base.
- Relay will not treat model output as authoritative when source evidence is unavailable.
- Relay will not index secrets such as `.env` values or credential files.

# 4. Target Users & Personas

| Persona | Context | Primary needs | Success signal |
|---|---|---|---|
| **New contributor** | Joining an unfamiliar repository | Fast architecture understanding, setup path, key files | Can explain the project and make a safe first change |
| **Maintainer** | Owns a project over months/years | Project memory, history, issue/PR context | Can answer “why?” questions with evidence |
| **Developer handoff owner** | Leaving or transitioning a project | Current state and open risks | Produces a useful handoff in one session |
| **Tech lead** | Oversees multiple contributors | Project visibility and knowledge continuity | Sees major changes, stale areas, and context gaps |
| **Student developer** | Building portfolio/college systems | Readable project map and learning aid | Uses Relay to understand a new open-source repo |

# 5. Core User Journeys

## 5.1 First-time repository connection

1. User signs in with GitHub OAuth.
2. User selects an accessible repository.
3. Relay creates a project record and enqueues an initial sync job.
4. The worker fetches repository metadata, README, file tree, issues, pull requests, commits, releases, and selected CI metadata.
5. Relay normalizes and stores source artifacts; code and documents are chunked for retrieval.
6. The dashboard transitions from “Indexing” to “Ready” when the core sync pipeline completes.
7. User sees project overview, activity snapshot, architecture/context hints, and recommended first actions.

## 5.2 Ask Relay

1. User submits a project-scoped question.
2. A planner classifies the question and determines needed context.
3. Retriever fetches relevant code/document chunks plus structured GitHub records.
4. Agent synthesizes an answer and attaches source references.
5. The UI shows the answer with expandable evidence and a clear uncertainty state when evidence is weak.

## 5.3 Onboarding mode

1. User clicks “I’m new here.”
2. Relay inspects repository structure, documentation, recent activity, and dependency/context clues.
3. Agent creates a staged learning path from fundamentals to deeper subsystems.
4. User opens a task such as “Understand authentication.”
5. Relay explains the flow, lists relevant files, links to changes, and records completion.

## 5.4 Handoff generation

1. User opens “Generate Handoff.”
2. Relay gathers project state: active PRs, open issues, recent changes, notable decisions, CI state, and documented caveats.
3. Agent produces a structured handoff draft with evidence links.
4. User edits and approves the draft.
5. The final handoff is saved as a versioned project artifact and can be copied/exported.

# 6. Product Scope

## 6.1 MVP feature set

| Area | MVP requirement | Priority |
|---|---|---|
| **Authentication** | GitHub OAuth; session management; logout | P0 |
| **Projects** | Create, view, archive, delete project connections | P0 |
| **GitHub ingestion** | Repository metadata, README, files/tree, issues, PRs, commits | P0 |
| **Sync engine** | Initial sync + incremental sync + job status | P0 |
| **Dashboard** | Project summary, recent activity, sync state, context highlights | P0 |
| **Search** | Keyword and semantic search across indexed project context | P0 |
| **Ask Relay** | Grounded Q&A with evidence | P0 |
| **Onboarding** | Generated learning path + subsystem explainers | P1 |
| **Handoff** | Generated handoff report + editable saved artifact | P1 |
| **Realtime** | Live sync/job/request status updates | P1 |
| **Webhook sync** | GitHub repository event ingestion | P1 |
| **Team sharing** | Invite collaborators and shared project access | P2 |

## 6.2 Post-MVP candidates

- Slack/Discord context ingestion with explicit workspace consent.
- Jira/Linear integration for broader issue context.
- Deployment provider and CI integrations.
- Architecture diagram generation from code and configuration.
- Automatic decision extraction and “why does this exist?” index.
- Context-gap detection, such as important subsystems with weak documentation.
- Team analytics focused on knowledge continuity rather than productivity scoring.

# 7. Functional Requirements

## 7.1 Authentication & accounts

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **AUTH-01** | User can sign in using GitHub OAuth. | OAuth flow succeeds; user identity is stored; session established. |
| **AUTH-02** | User can log out. | Session invalidated server-side; protected routes return unauthorized. |
| **AUTH-03** | Access tokens are stored securely. | Tokens are encrypted/secured; never exposed to client-side logs. |
| **AUTH-04** | User can revoke a repository connection. | Relay removes access credentials and stops future sync jobs. |

## 7.2 Project management

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **PROJ-01** | Create project from a GitHub repository. | Repository connection record exists and sync job starts. |
| **PROJ-02** | Show project sync state. | UI shows queued/running/succeeded/failed with timestamp and error state. |
| **PROJ-03** | Archive a project. | Archived project is hidden from active dashboard and background sync pauses. |
| **PROJ-04** | Delete project data. | Project-specific stored artifacts are deleted according to retention rules. |

## 7.3 Repository ingestion

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **ING-01** | Import repository metadata. | Name, owner, default branch, visibility, URL, language stats and timestamps stored. |
| **ING-02** | Import readable documentation and code. | Supported files are normalized, chunked, and indexed. |
| **ING-03** | Import issues and pull requests. | Title, body, labels, author, status, timestamps, comments summary and URL stored where permitted. |
| **ING-04** | Import commit history. | Commit metadata and changed-file references available for retrieval. |
| **ING-05** | Handle partial sync failure. | Failed sub-jobs are retried or surfaced independently without corrupting completed data. |
| **ING-06** | Ignore secrets. | Known secret/config patterns are excluded from indexing and logs. |

## 7.4 Search & project context

- Global project search must support exact keywords and semantic queries.
- Search results must identify artifact type: file, issue, pull request, commit, README, or project decision.
- Every retrieval item must carry a stable source identifier and source URL/path when available.
- Search results should be filterable by artifact type and recency.
- The system must support repository-scoped retrieval so one project’s context cannot leak into another project.

## 7.5 Agent requirements

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **AGT-01** | Agent answers using retrieved project context. | Prompt includes project-scoped evidence; answer cites sources. |
| **AGT-02** | Agent signals insufficient evidence. | When retrieval confidence is low, agent states that evidence is insufficient instead of inventing project facts. |
| **AGT-03** | Agent can explain a file/subsystem. | Response includes purpose, dependencies, callers/related artifacts when evidence supports them. |
| **AGT-04** | Agent can generate onboarding plans. | Plan is ordered, bounded, and linked to repository artifacts. |
| **AGT-05** | Agent can generate handoffs. | Handoff contains current state, active work, known risks, recent changes, and evidence links. |
| **AGT-06** | Agent actions are read-only in MVP. | Agent cannot merge PRs, commit code, modify issues, or deploy. |
| **AGT-07** | Agent traces tool calls. | Internal execution log records which retrieval/tools were used for each answer. |

# 8. Information Architecture & UX

## 8.1 Primary navigation

```text
RELAY
├── Dashboard
├── Projects
│   └── Project Workspace
│       ├── Overview
│       ├── Activity
│       ├── Files & Docs
│       ├── Issues
│       ├── Pull Requests
│       ├── Decisions
│       ├── Onboarding
│       ├── Ask Relay
│       └── Handoffs
├── Search
└── Settings
```

## 8.2 Project dashboard

- **Project identity:** repository name, owner, branch, last sync, sync health.
- **Current state:** open issues, active PRs, recent release/commit activity, CI signals where available.
- **Context highlights:** key subsystems, important docs, recently changed areas.
- **Suggested actions:** “Start onboarding,” “Ask about authentication,” “Generate handoff.”
- Search field that is project-scoped by default.

## 8.3 Answer UX

The answer surface is intentionally compact. The primary answer should be readable first, while evidence remains one click away. Each claim should be backed by one or more sources when possible.

### ANSWER

> Redis is used for background job processing. [1][2]

**Flow:**

```text
API request -> queue -> worker -> result
```

### Sources

```text
[1] docker-compose.yml
[2] src/workers/queue.ts
```

**Confidence:** High

## 8.4 Handoff artifact structure

1. Project summary
2. Architecture and important subsystems
3. Current state and recent changes
4. Active PRs and unresolved issues
5. Known operational caveats
6. Important engineering decisions
7. Recommended next actions
8. Evidence and source links

# 9. Technical Architecture

## 9.1 System overview

```text
                       ┌─────────────────────┐
                       │   React Web Client   │
                       └──────────┬──────────┘
                                  │ HTTPS / SSE
                                  ▼
                       ┌─────────────────────┐
                       │   Node + Express    │
                       │       API           │
                       └──────┬──────┬──────┘
                              │      │
                    ┌─────────┘      └──────────┐
                    ▼                            ▼
             ┌─────────────┐              ┌─────────────┐
             │  MongoDB    │              │    Redis    │
             │ app data    │              │ queue/cache │
             └─────────────┘              └──────┬──────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │ Worker       │
                                           │ sync/index   │
                                           └───┬──────┬───┘
                                               │      │
                                ┌──────────────┘      └──────────────┐
                                ▼                                   ▼
                         ┌─────────────┐                    ┌─────────────┐
                         │ GitHub API  │                    │ LLM / Agent │
                         └─────────────┘                    └──────┬──────┘
                                                                   │
                                                                   ▼
                                                             ┌─────────────┐
                                                             │ Vector Store│
                                                             └─────────────┘
```

## 9.2 Frontend

| Concern | Choice | Reason |
|---|---|---|
| **Framework** | React (Vite or Next.js client app) | Fast iteration; component-based product UI |
| **Language** | TypeScript | Type safety across API models and UI |
| **UI** | Tailwind + component library | Consistent developer-tool interface |
| **Data fetching** | TanStack Query | Caching, retries, invalidation, mutation handling |
| **Realtime** | SSE initially | Simple one-way project/job updates; WebSockets only where bidirectional needs emerge |

## 9.3 Backend

| Layer | Responsibility |
|---|---|
| **Routes/controllers** | HTTP contract, auth checks, validation |
| **Services** | Project/business logic and orchestration |
| **Integrations** | GitHub API client, webhook verification, external model clients |
| **Repositories** | MongoDB access and query encapsulation |
| **Jobs** | Background sync, indexing, cleanup, report generation |
| **Agent layer** | Planner, retrieval, tools, synthesis, citations |
| **Observability** | Structured logs, metrics, request/job tracing |

## 9.4 Why MongoDB

MongoDB fits the project because repository artifacts have different shapes and evolve over time. A normalized relational schema is possible, but MongoDB keeps heterogeneous artifact payloads practical while still allowing references and indexed metadata. The design must still use explicit ownership fields and stable IDs to support strong project isolation.

## 9.5 Why Redis

Redis is used for job queues, short-lived cache data, sync locks, rate limiting, and event fan-out. Long-lived source-of-truth data remains in MongoDB.

# 10. Data Model

The model below describes the MVP conceptual schema. Actual collection shape may evolve during implementation, but ownership and project isolation are mandatory constraints.

| Collection | Key fields | Notes |
|---|---|---|
| **users** | `_id, githubId, email, name, avatarUrl, createdAt` | One record per Relay user |
| **projects** | `_id, ownerId, repositoryId, fullName, defaultBranch, status, lastSyncedAt` | Project root and tenant boundary |
| **members** | `projectId, userId, role, createdAt` | MVP may be owner-only; prepared for team access |
| **artifacts** | `_id, projectId, type, externalId, title, body, path, url, updatedAt` | Issues, PRs, commits, docs, metadata |
| **chunks** | `_id, projectId, artifactId, text, embeddingRef, tokenCount, metadata` | Retrieval units |
| **decisions** | `_id, projectId, title, rationale, evidenceRefs, confidence, updatedAt` | Extracted/curated engineering decisions |
| **onboardingPlans** | `_id, projectId, userId, items, status, createdAt` | Generated personalized path |
| **handoffs** | `_id, projectId, authorId, version, content, evidenceRefs, createdAt` | Versioned handoff artifacts |
| **syncJobs** | `_id, projectId, type, status, progress, attempt, error, createdAt` | Background job state |
| **agentRuns** | `_id, projectId, userId, question, toolsUsed, sources, response, latency, createdAt` | Auditable agent execution record |

## 10.1 Index strategy

- `projects`: `ownerId + status`; `repositoryId` unique per connection.
- `artifacts`: `projectId + type + updatedAt`; `projectId + externalId` unique.
- `chunks`: `projectId + artifactId`.
- `syncJobs`: `projectId + status + createdAt`.
- `agentRuns`: `projectId + createdAt`.
- Text/vector indexes must be scoped by `projectId` to prevent cross-project retrieval.

# 11. API Surface

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/me` | Current authenticated user |
| `GET` | `/api/v1/projects` | List user projects |
| `POST` | `/api/v1/projects` | Create repository-backed project |
| `GET` | `/api/v1/projects/:id` | Project overview |
| `POST` | `/api/v1/projects/:id/sync` | Trigger sync |
| `GET` | `/api/v1/projects/:id/artifacts` | List/search project artifacts |
| `GET` | `/api/v1/projects/:id/activity` | Project activity feed |
| `POST` | `/api/v1/projects/:id/ask` | Run grounded agent query |
| `GET` | `/api/v1/projects/:id/onboarding` | Get onboarding plan |
| `POST` | `/api/v1/projects/:id/onboarding/generate` | Generate onboarding plan |
| `POST` | `/api/v1/projects/:id/handoffs/generate` | Generate handoff |
| `GET` | `/api/v1/projects/:id/handoffs` | List saved handoffs |
| `POST` | `/api/v1/webhooks/github` | Receive verified GitHub webhook events |

# 12. Agent System Design

## 12.1 Agent principle

The agent is a controlled reasoning layer over verified project context. It should never have a larger authority than the data and tools exposed to it. In the MVP, agent tools are read-only.

## 12.2 Tool set

| Tool | Input | Output |
|---|---|---|
| `search_project` | `query, filters` | Ranked project artifacts/chunks |
| `get_file_context` | `path, line range` | Relevant file excerpts + metadata |
| `get_issue` | `issueId` | Issue details + related artifacts |
| `get_pull_request` | `prId` | PR details + changed files + discussion metadata |
| `get_commit` | `commitId` | Commit metadata + changed files |
| `get_recent_activity` | `time window, filters` | Recent meaningful project events |
| `get_project_summary` | `projectId` | Cached structured summary |
| `get_decisions` | `query or subsystem` | Known decisions + evidence |

## 12.3 Retrieval pipeline

1. Normalize user query and identify project scope.
2. Run hybrid retrieval: lexical search for exact symbols/paths plus semantic retrieval for concepts.
3. Merge and rerank results using relevance, source type, recency, and directness.
4. Apply token budget and diversity rules so one noisy artifact does not dominate context.
5. Construct a source manifest for the agent.
6. Generate response with explicit evidence references.
7. Persist agent run metadata for debugging and product analytics.

## 12.4 Hallucination controls

- Every project-specific factual claim should map to retrieved evidence.
- System prompt instructs the agent to distinguish evidence, inference, and uncertainty.
- If retrieval returns weak evidence, the answer should say what is unknown and suggest where to inspect next.
- The UI exposes sources rather than hiding provenance behind a generic confidence score.
- Generated summaries are stored as derived artifacts and must retain the underlying evidence references.

## 12.5 Agent workflows

| Workflow | Trigger | Steps |
|---|---|---|
| **Explain** | User asks a project question | Retrieve → reason → answer → cite |
| **Onboard** | User requests onboarding | Inspect structure → identify concepts → order learning path → cite |
| **Handoff** | User requests handoff | Collect state → synthesize → flag unknowns → cite → save draft |
| **Summarize** | User requests time-window summary | Fetch meaningful events → cluster changes → summarize → cite |
| **Investigate** | User asks “what is related?” | Retrieve entity → traverse links → summarize relationship chain |

# 13. Security, Privacy & Trust

## 13.1 Security requirements

- Use OAuth authorization code flow with server-side token handling.
- Encrypt sensitive provider credentials at rest and never render access tokens in the UI.
- Verify GitHub webhook signatures before processing payloads.
- Apply project-level authorization checks to every project resource and agent request.
- Rate-limit authentication, webhook, search, and agent endpoints.
- Sanitize and constrain file ingestion to prevent prompt-injection payloads from becoming trusted instructions.
- Exclude common secret files, private keys, credential stores, and environment files from indexing by default.
- Log security-relevant events without storing secret values.

## 13.2 Prompt injection threat model

Repository content is untrusted input. A README, issue, source file, or PR body may contain text that attempts to manipulate the agent. Relay must treat retrieved content as data, not instructions. Tool permissions are constrained, and the agent cannot execute shell commands or make repository mutations in the MVP.

## 13.3 Trust UX

Relay should make it easy to see why an answer was produced, not merely make the answer sound convincing.

# 14. Non-Functional Requirements

| Area | Target |
|---|---|
| **Availability** | 99%+ for a portfolio-scale deployment; graceful degradation when external providers fail |
| **API latency** | p95 under 500 ms for typical non-agent reads from warm cache |
| **Agent latency** | Display progress state; target first response under 10 s for normal questions |
| **Sync reliability** | Retry transient GitHub/API failures with exponential backoff |
| **Scalability** | Design for thousands of artifacts per project without loading full repositories into API memory |
| **Observability** | Structured logs, job traces, error monitoring, basic metrics dashboard |
| **Accessibility** | Keyboard navigable core flows, visible focus, semantic labels, readable contrast |
| **Data durability** | MongoDB backups appropriate to deployment tier; project deletion must be explicit |
| **Maintainability** | TypeScript strict mode, linting, tests for core services and agent retrieval pipeline |

# 15. Error States & Recovery

| Scenario | User experience | System behavior |
|---|---|---|
| **GitHub authorization denied** | Explain required permission and allow retry | No project created until authorization succeeds |
| **Repository too large for initial indexing** | Show bounded indexing scope and progress | Queue chunked jobs; do not block entire API process |
| **GitHub rate limit** | Show sync paused/rate-limited state | Persist checkpoint; retry after provider reset |
| **Embedding/model failure** | Project remains usable for normal browsing | Retry indexing; search falls back to lexical mode if possible |
| **Agent retrieval finds weak evidence** | Answer states uncertainty and shows available sources | Do not fabricate facts; record low-evidence run |
| **Webhook duplicated** | No duplicate user-visible activity | Use event IDs/idempotency keys |
| **Worker crash** | User sees sync failure/retry state | Job becomes retryable after lease/visibility timeout |

# 16. Delivery Plan

| Milestone | Scope | Definition of done |
|---|---|---|
| **M0** | Foundation | Monorepo, CI, environment config, local MongoDB/Redis, base API/client |
| **M1** | Auth + projects | GitHub OAuth, sessions, project CRUD, repository connection |
| **M2** | Ingestion | Initial sync pipeline, artifacts, job state, basic project dashboard |
| **M3** | Search | Lexical search, semantic indexing, project-scoped retrieval |
| **M4** | Ask Relay | Grounded Q&A, sources, agent-run logging, failure handling |
| **M5** | Onboarding + handoff | Generated learning path and editable handoff artifacts |
| **M6** | Realtime + webhooks | Incremental updates, webhook verification, live UI state |
| **M7** | Production hardening | Tests, observability, security review, Docker deployment, README/demo |

# 17. MVP Acceptance Criteria

1. A new user can authenticate with GitHub and connect one accessible repository.
2. The repository can be synchronized without blocking the API process.
3. The project dashboard displays stored repository context and synchronization status.
4. Users can search the project and retrieve relevant files/issues/PRs/commits.
5. Ask Relay answers repository-scoped questions using retrieved evidence and displays source references.
6. Agent behavior remains read-only and cannot mutate the repository.
7. At least one failure path per integration/job type is tested and surfaced in the UI.
8. Project data is isolated by authorization checks and retrieval scope.
9. The complete application runs locally with documented setup and deploys through Docker.
10. A five-minute demo can show connect → sync → explore → ask → onboarding/handoff.

# 18. Product Metrics

Metrics are intended to evaluate whether Relay reduces understanding friction, not to measure developer worth or productivity.

| Metric | Definition | Why it matters |
|---|---|---|
| **Time to first useful answer** | Time from project connection to first accepted useful project answer | Measures onboarding friction |
| **Evidence click-through** | Share of agent answers where users open a cited source | Tests usefulness of provenance |
| **Onboarding completion** | Share of generated onboarding plans completed or meaningfully progressed | Tests workflow value |
| **Handoff edit rate** | How much users edit generated handoffs before saving | Signals quality and control |
| **Sync success rate** | Successful incremental sync jobs / attempted jobs | Measures integration reliability |
| **Answer correction rate** | Answers explicitly marked incorrect by users | Primary agent quality signal |
| **Weekly active projects** | Projects with meaningful activity each week | Measures retained product usage |

# 19. Testing Strategy

| Layer | Coverage |
|---|---|
| **Unit tests** | Services, permission checks, GitHub payload normalization, chunking, ranking helpers |
| **Integration tests** | MongoDB repositories, Redis queue flows, OAuth callbacks, webhook verification |
| **Agent tests** | Retrieval quality fixtures, citation presence, insufficient-evidence behavior, prompt injection cases |
| **End-to-end** | Login → connect repo → sync → search → ask → onboarding/handoff |
| **Load tests** | Webhook burst handling, artifact pagination, concurrent agent requests |
| **Security tests** | Authorization boundaries, token exposure, webhook spoofing, secret ingestion patterns |

# 20. Observability

- Every API request gets a correlation/request ID.
- Every background job records job ID, project ID, attempt, duration, status, and error category.
- Agent runs record model latency, retrieval count, tool usage, source IDs, and token/usage metadata where available.
- Dashboards should expose sync failure rate, average indexing time, agent latency, and error rate.
- No raw OAuth tokens, secrets, or unredacted sensitive repository content should enter application logs.

# 21. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Repository ingestion becomes too broad** | High | Start with allowlisted file types and bounded history; make indexing progress visible |
| **Agent sounds confident while being wrong** | High | Evidence-first answers, source links, insufficient-evidence state, evaluation fixtures |
| **Prompt injection in repository content** | High | Treat content as untrusted data; separate system/tool instructions; read-only tools |
| **GitHub API limits** | Medium | Incremental sync, checkpoints, caching, retry/backoff |
| **Vector retrieval quality is poor** | Medium | Hybrid lexical + semantic search and retrieval evaluation dataset |
| **Scope creep into “AI developer IDE”** | High | Keep MVP centered on context, onboarding, history, and handoff |
| **Too much UI before product value** | Medium | Build connect → index → ask → evidence path first |

# 22. Demo Narrative

The strongest product demo should tell one coherent story rather than presenting isolated features.

1. Start with a repository the viewer does not know.
2. Connect it to Relay and show the initial indexing state.
3. Open the project dashboard and show the living project snapshot.
4. Ask: “How does authentication work?” Show a concise explanation with file/PR evidence.
5. Ask: “Why is Redis here?” Show decision/history evidence rather than a generic definition of Redis.
6. Open Onboarding and show the generated learning order for a new developer.
7. Generate a handoff and show how current project state becomes a structured artifact.
8. Trigger a repository change and show incremental sync/realtime update.

# 23. Portfolio & Resume Positioning

Relay should be presented as a full-stack developer platform, with AI described as one subsystem rather than the entire product identity.

| Resume area | Suggested framing |
|---|---|
| **Project title** | Relay \| Engineering Project Handoff & Context Platform |
| **One-line summary** | Full-stack platform that turns GitHub repositories and project history into searchable, evidence-backed engineering context. |
| **Core technologies** | React, TypeScript, Node.js, Express, MongoDB, Redis, GitHub API, background workers, agent/RAG pipeline, Docker |
| **Engineering highlights** | OAuth, webhook ingestion, asynchronous sync, project-scoped retrieval, realtime updates, agent tool orchestration, authorization boundaries |

# 24. Definition of “Done”

Relay is done when a developer can connect an unfamiliar GitHub repository, understand its important systems and current state, ask grounded questions with evidence, follow a guided onboarding path, and generate a useful project handoff from one coherent workspace.

The MVP should resist feature gravity. A narrow product that works reliably, proves provenance, handles failures cleanly, and looks polished is more valuable than a giant feature list that cannot be trusted.

# Appendix A: Suggested Repository Structure

```text
relay/
├── apps/
│   ├── web/                 # React frontend
│   └── api/                 # Node + Express API
├── packages/
│   ├── shared/              # Types / schemas / constants
│   └── ui/                  # Shared components
├── services/
│   ├── worker/              # Background jobs
│   ├── ingestion/           # GitHub sync + normalization
│   └── agent/               # Retrieval + tools + orchestration
├── infra/
│   ├── docker/
│   └── nginx/
├── tests/
│   ├── integration/
│   └── e2e/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

# Appendix B: Initial Environment Variables

| Variable | Purpose | Client visible? |
|---|---|---|
| `MONGODB_URI` | MongoDB connection | No |
| `REDIS_URL` | Redis connection | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `GITHUB_WEBHOOK_SECRET` | Webhook signature verification | No |
| `SESSION_SECRET` | Session signing/encryption secret | No |
| `LLM_API_KEY` | Model provider credential | No |
| `VECTOR_DB_URL / credentials` | Vector store connection | No |
| `PUBLIC_APP_URL` | Application callback/base URL | No |

---

**Document status:** Product definition / implementation-ready draft. Technical choices are intentional defaults for the first build and may be revised after implementation spikes.
```