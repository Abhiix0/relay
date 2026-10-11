# MVP acceptance (PRD section 17)

Automated evidence lives in `apps/api/src/**/*.test.ts` and `apps/web/src/**/*.test.tsx`. Run `pnpm test`.
"Live" means it needs real credentials and cannot be proven by the fakes-only suite.

| # | Criterion | Evidence | Status |
| --- | --- | --- | --- |
| 1 | Authenticate with GitHub and connect a repository | `routes/auth.test.ts` ("full callback flow creates user and session", "stores the token encrypted and never returns it"); `routes/projects.test.ts` ("creates, lists, gets; parses contract; job created; sync idempotent"). Manual: README demo steps 1, with a real OAuth app | Needs live verification (GitHub OAuth) |
| 2 | Sync does not block the API process | `POST /projects` and `POST /sync` return while the job is `running`; the runner is fire-and-forget (`jobs/syncRunner.ts`). `jobs/syncRunner.test.ts` ("populates data, stats, health..."), `routes/events.test.ts` (status and progress stream while a sync runs), `jobs/syncRunner.test.ts` ("shutdown aborts runs and writes no status") | Automated |
| 3 | Dashboard shows stored context and sync status | `routes/events.test.ts`; `features/projects/ProjectOverviewPage.test.tsx`; `features/projects/ProjectHero.test.tsx` (live updates, polling fallback) | Automated |
| 4 | Search retrieves files, issues, PRs, commits | `routes/search.test.ts` ("type and since filter artifacts; results carry type and source url..."); `routes/semantic.test.ts` (`GET /search?mode=semantic`, hybrid retrieval); `routes/explorer.test.ts` ("filters by since...") | Automated |
| 5 | Ask answers from retrieved evidence with sources | `routes/ask.test.ts` ("answers with mapped sources and parses the web schema", "drops fabricated labels..."); `routes/agent.test.ts` ("pulls decision evidence by tool and persists the run trace"). Manual: README demo steps 3-4 with a real Groq key | Automated; answer quality needs live verification (Groq) |
| 6 | Agent is read-only | The only tools are the retrieval functions in `services/agentTools.ts` over the caller's project; there is no GitHub write path. `routes/agent.test.ts` ("treats injected instructions as data and never leaks another project's chunks"); `routes/ask.test.ts` ("keeps injection text inside the evidence block...") | Automated |
| 7 | One failure path per integration/job type, tested and surfaced | GitHub revoked / rate limited / forbidden / 5xx retry: `jobs/syncRunner.test.ts`, `routes/githubRepos.test.ts`. LLM: `integrations/llm.test.ts`, `routes/ask.test.ts` ("maps missing key to 503 and Groq 429 to 429"), `routes/handoffs.test.ts` ("LLM failure -> 502 and no row written"), `routes/onboarding.test.ts` ("falls back to deterministic data when the LLM fails"). Embedder: `routes/semantic.test.ts` (sync keeps going, search falls back, run trace note). Webhook: `routes/webhooks.test.ts` (bad signature, duplicate, malformed). UI: web `HandoffPage` "shows a failed generate message in the empty state"; `ProjectHero` renders a failed job's error as an alert (no dedicated test) | Automated |
| 8 | Data isolated by authorization and retrieval scope | `test/isolation.test.ts` (every `/projects/:id/*` route returns 404 for another user); `routes/lifecycle.test.ts` (archive/unarchive/revoke); `routes/onboardingGenerate.test.ts`; `routes/events.test.ts`; `routes/semantic.test.ts` (semantic search never returns another user's project); `routes/agent.test.ts` | Automated |
| 9 | Runs locally with documented setup and deploys through Docker | README "Run it locally" and "Deploy with Docker". `docker compose build` builds mongo, api and web. Smoke test done by hand: `docker compose up -d`, `GET :3000/api/v1/healthz` returns `{"ok":true}` through nginx, `/api/v1/projects/:id/events` reaches the API (401 unauthenticated), the embedding model loads inside the API image | Automated build; runtime smoke done manually |
| 10 | Five-minute demo: connect, sync, explore, ask, onboarding/handoff | README "Demo flow". Automated pieces: sync, explore, ask, `routes/onboardingGenerate.test.ts`, `routes/handoffs.test.ts` (section 8 evidence links), `routes/webhooks.test.ts` + `routes/events.test.ts` (repository change triggers a live update) | Needs live verification (end-to-end with GitHub and Groq) |

## Manual verification checklist

1. `docker compose up -d --build` with a real `apps/api/.env` (GitHub OAuth app, `GROQ_API_KEY`, `GITHUB_WEBHOOK_SECRET`).
2. Sign in at `http://localhost:3000`, connect a repository you do not know, watch indexing complete.
3. Ask "How does authentication work?" and "Why is Redis here?"; confirm cited sources open the right file or PR.
4. Open Onboarding, tick an item, regenerate (`POST .../onboarding/generate`), confirm the ticked item stays ticked.
5. Generate a handoff; confirm section 8 lists every source cited above it.
6. Add the webhook in GitHub (push, issues, pull requests), push a commit, confirm the dashboard flips to indexing and back without a manual refresh.
7. Archive the project and confirm it leaves the active list and refuses sync.
