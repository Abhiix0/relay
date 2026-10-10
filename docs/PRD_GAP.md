# PRD gap check

Stage 0 snapshot, taken before the audit fixes and the P0/P1 work. Everything marked PARTIAL or MISSING here was built in Stages 1-5; see `docs/MVP_ACCEPTANCE.md` for the final evidence.

Baseline: `pnpm --filter api check && test` green (141 tests) before Stage 1 edits.

| PRD ID | Status | Where / what is missing |
|---|---|---|
| AUTH-01 GitHub OAuth | DONE (live check needed) | `routes/auth.ts`, `services/authService.ts` |
| AUTH-02 Logout | DONE | `routes/auth.ts` (server-side session delete) |
| AUTH-03 Token storage | DONE | `lib/crypto.ts` AES-256-GCM; never serialized |
| AUTH-04 Revoke connection | MISSING | needs route + service: drop token, stop sync, read-only |
| PROJ-01 Create project | DONE | `services/projectService.ts`, project cap |
| PROJ-02 Sync state | DONE | `jobs/syncRunner.ts`, `routes/sync.ts` |
| PROJ-03 Archive | MISSING | no archive field/route; list and sync must honor it |
| PROJ-04 Delete data | PARTIAL | `deleteProject` cascades; add members/agentRuns |
| ING-01 Metadata | DONE | `syncRunner.ts` |
| ING-02 Files chunked | DONE | `lib/chunker.ts`, `lib/language.ts` |
| ING-03 Issues/PRs | DONE | `integrations/github.ts` (3-page issues) |
| ING-04 Commits | DONE | `syncRunner.ts` (no changed-file refs) |
| ING-05 Partial failure | PARTIAL | generation swap OK; no 5xx/network retry, no "rate limited" state |
| ING-06 Ignore secrets | DONE | `lib/secrets.ts`, `lib/redact.ts` |
| 7.4 keyword search | DONE | `services/searchService.ts` |
| 7.4 semantic search | MISSING | Stage 4 |
| 7.4 type/recency filters | PARTIAL | no `type`/`since` filters; results lack type/URL in some paths |
| 7.4 project scoping | DONE | `loadOwnedProject`, `projectId` + `gen` filters, isolation tests |
| AGT-01/02 grounded + insufficient | DONE | `services/askService.ts` (forced insufficient now) |
| AGT-03 explain file/subsystem | PARTIAL | no planner / file-context retrieval |
| AGT-04 onboarding | DONE | `services/onboardingService.ts`; no `POST /onboarding/generate` |
| AGT-05 handoff | DONE | `services/handoffService.ts`; no evidence-links section 8 |
| AGT-06 read-only | DONE | no tools, no GitHub writes |
| AGT-07 trace | PARTIAL | `trace` on answers; no tool-call log / `agentRuns` |
| API `GET /me` | MISSING | only `/auth/me` |
| API webhooks | MISSING | Stage 3 |
| SSE events | MISSING | Stage 3 |
| 17.1 Auth + connect | PARTIAL | code DONE; needs live verification |
| 17.2 Non-blocking sync | DONE | in-process runner |
| 17.3 Dashboard | DONE | web + `projects` routes |
| 17.4 Search | PARTIAL | keyword only |
| 17.5 Ask with sources | DONE | needs live Groq check |
| 17.6 Read-only agent | DONE | |
| 17.7 Failure paths | PARTIAL | GitHub revoked/not-found/denied tested; rate limit/5xx and LLM failures need tests |
| 17.8 Isolation | DONE | `test/isolation.test.ts` |
| 17.9 Local + Docker | PARTIAL | Dockerfiles, nginx exist; README/env docs and SSE-safe nginx to verify |
| 17.10 Demo flow | PARTIAL | needs README demo + webhook/SSE |
