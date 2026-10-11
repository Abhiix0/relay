# Relay Backend Plan

Source of truth for building `apps/api`. The React frontend in `apps/web` is finished and is the contract. Do not re-explore the frontend; use the contract files listed below.

## BACKEND ARCHITECTURE

**Current state (verified in repo):**
- Frontend only: pnpm monorepo, `apps/web` (React 19, Vite 7, TS strict, TanStack Query 5, React Router 7, zod 4, Tailwind 3, Radix).
- No backend, no `apps/api`, no `.env`. `pnpm-workspace.yaml` already globs `apps/*` and `packages/*`.
- All HTTP goes through `apps/web/src/lib/api/{client,hooks,types,query-keys}.ts`. No stray `fetch`.
- The base URL is `/api/v1`, same-origin. `apiFetch` sends no auth header and no `credentials` option, so cookie auth works unchanged. It reads only `body.message` from errors and treats 204 as `undefined`.
- `main.tsx` always starts MSW (`mocks/handlers.ts`, `mocks/data.ts`). The mocks are the de-facto API spec, and `lib/api/types.ts` (zod) is the schema spec.
- Auth is a stub (`features/auth/api.ts`: email+password and GitHub buttons, fake token). There is no route guard and no 401 handling.
- Settings pages (`SettingsPage`, `ProjectSettingsPage` autoSync/branch) are local `useState` only. Handoff Markdown export is client-side (`HandoffActions.tsx`). Ask "streaming" is a client-side typewriter (`StreamingText`) over a complete response.

**Stack (reason for each):**

| Choice | Reason |
|---|---|
| Node 22 + Express 5 + TypeScript strict, in `apps/api` | Matches PRD §9 and the workspace. Express 5 handles async errors natively. |
| zod 4 (same version as web) | Request validation. The API imports the web's response schemas in tests as a contract check. |
| MongoDB 7 via the native `mongodb` driver (no ODM) | PRD §9.4. Heterogeneous artifacts. Fewer layers means fewer tokens. |
| Server-side sessions in Mongo, httpOnly cookie | AUTH-02 requires server-side invalidation. Same-origin cookies need zero client changes. No JWT. |
| GitHub OAuth only | Ingestion needs the GitHub token. The email form has no register flow (see Risks). |
| In-process sync runner, job state persisted in `sync_jobs` | The UI only needs `GET /sync` polling. Redis/queue is **NOT REQUIRED**. |
| Groq SDK (`groq-sdk`), model from `LLM_MODEL` | Ask, handoff, onboarding generation. One call per generation, JSON output validated by zod. |
| Mongo `$text` for Ask retrieval, regex for Search | Search UI shows substring, line number and matched text, which regex satisfies. Vector store/embeddings are **NOT REQUIRED** for the current UI. |
| tsup to bundle the API, tsx for dev | The API imports `apps/web/src/lib/api/types.ts` (zod only, no React) via a path alias, so a bundler is needed. |
| vitest + supertest + mongodb-memory-server | Same runner as web, no external services in tests. |

**Explicitly NOT REQUIRED (no UI/consumer exists):**
- Redis, queues, SSE/WebSocket
- GitHub webhooks, and the `autoSync`/`branch` settings backend
- Vector store
- Teams/members/roles (owner-only)
- Project archive
- Profile/notification/appearance/privacy persistence
- `POST /onboarding/generate`
- Email/password auth
- File upload
- Pagination (every list endpoint returns a bare array)
- Auto-extracted decisions (decisions are manual via `NewDecisionModal`)

**Layout:**

```text
apps/api/
  package.json  tsconfig.json  tsup.config.ts  vitest.config.ts  .env.example
  src/
    server.ts            # boot: config, db, indexes, listen, recover stuck jobs
    app.ts               # createApp({db, github, llm}) – DI for tests
    config.ts            # zod-validated env
    db/{client,collections,indexes}.ts
    middleware/{requestId,auth,error,rateLimit}.ts
    routes/{auth,projects,sync,artifacts,activity,ask,decisions,onboarding,handoffs,repository,search}.ts
    services/{auth,project,sync,artifact,ask,decision,onboarding,handoff,repository,search,activity}Service.ts
    integrations/{github,llm}.ts
    jobs/syncRunner.ts
    lib/{errors,crypto,serialize,ids,language,chunker,secrets}.ts
    test/{helpers,fakes}.ts  *.test.ts next to sources
```

**Layering rule:** route (zod parse + `requireUser` + `loadOwnedProject`, then call a service and send) → service (logic) → `db/collections` (typed collection handles). Routes never touch collections.

**Cross-cutting decisions:**
- **Tenancy.** The only tenant boundary is `projects.ownerId`.
  - Every `/projects/:id/*` route first runs `loadOwnedProject(id, userId)`.
  - A non-24-hex id, a missing project, and another user's project all return **404** `{message:"Project not found"}`. `ProjectGuard` depends on a 404 for this.
  - Every child query includes `projectId`.
- **Serialization.** All ids go out as hex strings. All dates go out via `toISOString()`, because zod `.datetime()` rejects offsets. Every `url` is an absolute URL or `null`. Every response goes through `serialize.ts`, and tests `schema.parse` each response with the web zod schema.
- **Errors.** Envelope `{message, code, details?}`.
  - 401 unauthenticated.
  - 404 missing or not owned.
  - 409 conflict.
  - 422 zod failure (`details` = issues).
  - 429 rate limit.
  - 502 GitHub/LLM upstream failure.
  - 500 generic (message sanitized, never leaks tokens or stack).
  - 204 on delete/logout.
- **CSRF.** Cookie is `SameSite=Lax`. State-changing routes require `Content-Type: application/json` (the client always sends it). Same-origin deployment, no CORS middleware.
- **Body parsing.** Use `express.json()`. The client sends an empty body for `POST /sync`, so `req.body` may be `{}`/undefined.
- **Token at rest.** The GitHub token is encrypted with AES-256-GCM (`TOKEN_ENCRYPTION_KEY`). It is never serialized or logged (pino redact).
- **Secret exclusion (ING-06).**
  - Never index `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*secret*`, or `*.p12`.
  - Never index `node_modules/`, `dist/`, `build/`, `vendor/`, `.git/`, or lockfiles. Lockfiles are listed in the tree but not chunked.
  - Excluded names are not stored at all.
- **Rate limits.** `express-rate-limit` at 20/min/user on `POST /ask` and `POST /handoffs/generate`, 5/min/user on `POST /projects` and `POST /sync`. Reason: LLM and GitHub cost.
- **LLM safety.**
  - Evidence goes in a delimited `<evidence>` block with a system instruction to treat it as data.
  - The model has no tools (read-only).
  - Output is strict JSON validated with zod, with one retry.
  - Cited source ids must be a subset of the retrieved chunk ids; unknown ids are dropped.

**Sync pipeline (`jobs/syncRunner.ts`).** One active job per project (partial unique index). At most 2 concurrent jobs globally. Progress is written at each step boundary.

| % | Step |
|---|---|
| 0–10 | `GET /repos/{full}` metadata, default branch. |
| 10–35 | `git/trees?recursive=1`. Filter by the exclusion rules. Cap 5000 files. Fetch text blobs ≤256 KB with concurrency 8. Larger files: `isLarge`. Binary: `isBinary`. Neither stores content. |
| 35–50 | README → artifact `readme`. |
| 50–65 | Latest 100 commits → artifacts `commit`. |
| 65–80 | Latest 100 issues and 100 PRs (`state=all`) → artifacts `issue`/`pr`. |
| 80–90 | Chunk file text (60 lines per chunk, with `startLine`) and artifact bodies. Write everything with `syncGeneration = N+1`, then delete rows with the old generation. A mid-run failure leaves old data intact (ING-05). |
| 90–100 | Stats, health, analysis (LLM), onboarding plan (first successful sync only), activity event, project `syncStatus`/`lastSyncedAt`/`healthLabel`. |

- Stats: commits and releases via the Link-header `per_page=1` last-page count; issues and PRs via the search API `total_count`; files from `repo_files`.
- Health: `documentation` = README 40 + `docs/` dir 30 + LICENSE 15 + CONTRIBUTING 15. `activity` = high if ≥20 commits in 30d, medium if ≥5, else low. `overall` = round(0.6·doc + 0.4·{high 100, med 60, low 20}).
- `healthLabel`: failed → "Sync failed"; running → "Indexing in progress"; overall ≥75 "Healthy"; ≥50 "Needs attention"; else "At risk".
- On boot, mark orphaned `running` jobs `failed` with error "Interrupted by restart" and set the project `syncStatus` to `failed`.
- GitHub 401/403 → job error "GitHub access revoked or rate limited". The error text is user-safe.

**Ask retrieval.**
1. Query `chunks` with `$text` and `projectId` equality (compound text index with `projectId` prefix, so a query without `projectId` is impossible).
2. Take the top 8 by `textScore`.
3. Zero hits → insufficient-evidence answer with **no LLM call**.
4. Otherwise one LLM call returns `{answer, citedChunkIds[], confidence}`.
5. No valid citations → `confidence:"insufficient"`, `insufficientEvidence:true`, `sources:[]`.

**Search.** Regex (escaped, case-insensitive) over `chunks` where `path != null`, scoped by `projectId` (and `language` if given). Aggregation groups by `path` to get the first match per file, limit 50. Per-project queries run in parallel and merge, with explicit owned-project scoping.

**Environment variables (`apps/api/.env.example`):**
`PORT=4000`, `NODE_ENV`, `MONGODB_URI`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_SCOPE` (default `read:user user:email public_repo`), `TOKEN_ENCRYPTION_KEY` (32 bytes, base64), `PUBLIC_APP_URL` (e.g. `http://localhost:5173`), `GROQ_API_KEY`, `LLM_MODEL` (default `llama-3.3-70b-versatile`). Web: `VITE_USE_MOCKS`. **NOT REQUIRED:** `REDIS_URL`, `GITHUB_WEBHOOK_SECRET`, vector store vars, `SESSION_SECRET` (sessions use random server-side ids).

## DATA MODEL

All `_id` are `ObjectId` unless stated. API id = `_id.toHexString()`.

| Collection | Fields | Indexes |
|---|---|---|
| `users` | githubId (number), githubLogin, email, name, avatarUrl\|null, encToken {iv,tag,data}, scope, createdAt, updatedAt | unique `githubId` |
| `sessions` | `_id` (random 32-byte hex string), userId, createdAt, expiresAt | TTL on `expiresAt` (0s) |
| `projects` | ownerId, repoId (number), fullName, name, owner, description, language\|null, defaultBranch, visibility, syncStatus, lastSyncedAt\|null, stats{commits,pullRequests,issues,releases,files}, health?{overall,documentation,activity}, healthLabel, syncGeneration (int), createdAt, updatedAt | unique `{ownerId, repoId}`; `{ownerId, updatedAt:-1}` |
| `sync_jobs` | projectId, status, progress, error\|null, startedAt, completedAt\|null | `{projectId, startedAt:-1}`; unique `{projectId}` partial `{status in [queued,running]}` |
| `repo_files` | projectId, path, name, language (lowercase slug)\|null, size, sha, isBinary, isLarge, content\|null, gen | unique `{projectId, path}`; `{projectId, gen}` |
| `artifacts` | projectId, type, externalId, title, path\|null, url\|null, summary\|null, body, createdAt (source time), updatedAt, gen | unique `{projectId, externalId}`; `{projectId, type, updatedAt:-1}` |
| `chunks` | projectId, artifactId\|null, type, path\|null, url, title, language\|null, startLine, text, gen | text `{projectId:1, text:"text", path:"text", title:"text"}`; `{projectId, language}`; `{projectId, gen}` |
| `decisions` | projectId, title, summary, rationale, sources[], createdBy, createdAt | `{projectId, createdAt:-1}` |
| `onboarding_plans` | projectId, userId, title, items[{id,title,description,completed,artifactIds}], createdAt, updatedAt | unique `{projectId, userId}` |
| `project_analysis` | projectId, overview, architecture, keyFiles[], gettingStarted[], generatedAt | unique `projectId` |
| `handoffs` | projectId, version (int), title, summary, sections[{id,heading,body,sources[],insufficientEvidence?}], authorId, createdAt, updatedAt | unique `{projectId, version}` |
| `ask_answers` | projectId, userId, question, answer, sources[], confidence, insufficientEvidence, trace{retrievedChunkIds, model, latencyMs}, createdAt | `{projectId, userId, createdAt:-1}` |
| `activity_events` | projectId, type, title, description, createdAt | `{projectId, createdAt:-1}` |

**Relationships.**
- `users 1─* projects` (ownerId), and `projects 1─*` every other collection by `projectId`.
- Project delete cascades to all child collections (PROJ-04) and aborts any in-flight job.
- `handoffs` are versions of one logical handoff per project. Current = max `version`.
- `artifacts` of type `decision` mirror manual `decisions` (upserted with `externalId: decision:<id>`) so `ExplorerPage`'s decision filter works. Their `gen` is `null`, and sync cleanup must skip `gen:null`.
- `Source` objects are embedded values (`id`, `type`, `path`, `url`, `snippet`), not a collection. The server assigns ids to client-supplied sources.
- `OnboardingData.id` = `project_analysis._id`. `OnboardingPlan.item.artifactIds` must reference existing artifact ids (validated on generation).

**Derived values.**
- `Project.stats.files` = count of `repo_files`.
- `OnboardingData.progress`:
  - `repositoryConnected` = true.
  - `repositoryIndexed` = latest sync succeeded.
  - `structureAnalyzed` = analysis row exists.
  - `handoffReady` = a handoff exists.
- File `language` is lowercase (`rust`, `typescript`, `markdown`, `json`, `toml`). The Search UI filter chips send exactly these. Match case-insensitively. `Project.language` keeps GitHub's display casing.
- Tree = built from `repo_files.path` (folders synthesized, folders first then alphabetical, item `id` = path, `size` on files).
- GitHub blob URLs: `https://github.com/{fullName}/blob/{defaultBranch}/{path}`, with `#L{start}-L{end}` for chunk sources.

## API CONTRACT

Base `/api/v1`. Auth cookie `relay_sid` (httpOnly, SameSite=Lax, Secure in production, 14 days). Every route except the two `/auth/github*` routes, `/healthz` and the 404 handler requires a session (401 otherwise). Types are the zod schemas in `apps/web/src/lib/api/types.ts`.

**Auth**

| Method + path | Behavior |
|---|---|
| `GET /auth/github` | Set `relay_oauth_state` cookie (10 min), 302 to GitHub authorize (`scope` from `GITHUB_SCOPE`, default `read:user user:email public_repo`). |
| `GET /auth/github/callback?code&state` | Verify state. Exchange the code. Fetch `/user` and `/user/emails`. Upsert user: email fallback `{login}@users.noreply.github.com`, name fallback login. Encrypt the token. Create session, set cookie, 302 to `${PUBLIC_APP_URL}/dashboard`. Any failure → 302 `/sign-in?error=oauth_failed`. |
| `GET /auth/me` | → `User`. |
| `POST /auth/logout` | Delete the session, clear the cookie → 204. |

**Projects**

| Method + path | Request | Response |
|---|---|---|
| `GET /projects` | – | `Project[]`, `updatedAt` desc. |
| `POST /projects` | `{fullName: /^[\w.-]+\/[\w.-]+$/ (≤140), description?: ≤500, language?: ≤50}` | 201 `Project` (`syncStatus:"running"`, sync job started). Steps: `GET /repos/{fullName}` with the user's token → 404 `"Repository not found or not accessible"`; duplicate `(ownerId, repoId)` → 409 `"Repository already connected"`; GitHub's description/language/canonical casing win over body values (body is fallback). |
| `GET /projects/:id` | – | `Project`. |
| `DELETE /projects/:id` | – | 204, cascade. |
| `GET /projects/:id/sync` | – | latest `SyncJob` (a job always exists after create). |
| `POST /projects/:id/sync` | none | `SyncJob` 200. If a job is active, return it (idempotent). Else create it with `status:"running"`, and set `project.syncStatus="running"`. |
| `GET /projects/:id/artifacts?type=&q=` | `type` ∈ artifactType enum or `all` (else 422); `q` ≤200 chars, case-insensitive substring over title/summary/path | `Artifact[]` (no `body`), `updatedAt` desc, hard cap 200. |
| `GET /projects/:id/activity` | – | `ActivityEvent[]`, newest first, cap 50. |

**Ask**

| Method + path | Request | Response |
|---|---|---|
| `GET /projects/:id/ask` | – | `AskAnswer[]` for this user, newest first, cap 50. |
| `POST /projects/:id/ask` | `{question: trimmed 1–2000}` | 201 `AskAnswer` (full answer, `isStreaming` omitted). Persist, add an activity event. LLM failure → 502 `"Answer generation failed"`. |

**Decisions**

| Method + path | Request | Response |
|---|---|---|
| `GET /projects/:id/decisions` | – | `Decision[]`, newest first. |
| `POST /projects/:id/decisions` | `{title: 1–200, summary: 1–2000, rationale?: ≤10000 (default ""), sources?: ≤20 of {type,path,url,snippet≤1000}}` | 201 `Decision`. Upserts the mirror artifact and adds an activity event. |

**Onboarding**

| Method + path | Behavior |
|---|---|
| `GET /projects/:id/onboarding/data` | `OnboardingData`. If no analysis exists yet: skeleton built from the project (`id:"pending"`, empty arrays, progress flags per the data model). |
| `GET /projects/:id/onboarding` | `OnboardingPlan` for this user. If none exists yet: non-persisted `{id:"pending", title:"Onboarding plan", items:[]}`. |
| `PATCH /projects/:id/onboarding/items/:itemId` | Body `{completed: boolean}` → full updated `OnboardingPlan`. Unknown item → 404 `"Onboarding item not found"`. Adds an activity event only on first completion of an item (no event on un-toggle). |

**Handoffs**

| Method + path | Behavior |
|---|---|
| `GET /projects/:id/handoffs` | `Handoff[]`, version desc (empty array if none). |
| `GET /projects/:id/handoffs?version=N` | **Single** `Handoff` (not an array). `N` int ≥1 (else 422). Missing → 404 `"Version not found"`. |
| `GET /projects/:id/handoffs/current` | Highest version. None → 404 `"No handoff found"`. |
| `POST /projects/:id/handoffs/generate` | Body `{regenerate?: boolean}`. Requires latest sync `succeeded`, else 409 `"Project has not finished indexing"`. Semantics below. Returns 200 `Handoff`. |
| `PATCH /projects/:id/handoffs/current` | Body: any of `title` (1–200), `summary` (1–2000), `sections` (≤30 of `{id?, heading 1–200, body 1–20000, sources?, insufficientEvidence?}`); at least one field. Sections replace wholesale; ids missing are generated; other keys (`id`, `version`, `projectId`) are stripped. Mutates the latest version in place, bumps `updatedAt`. None → 404. |
| `POST /projects/:id/handoffs/versions` | Body `{description?: ≤200}` (accepted, ignored: not in the `Handoff` schema). Clones the latest version as `version+1` → 201 `Handoff`. None → 404 `"No current handoff to version"`. |
| `POST /projects/:id/handoffs` | Manual create `{title 1–200, summary 1–2000, sections? ≤30}` → 201 `Handoff` with `version = max+1` (1 if none). |

**Generate semantics:**
- `regenerate:false` and none exists → create v1.
- `regenerate:false` and one exists → return the latest unchanged.
- `regenerate:true` and none exists → create v1.
- `regenerate:true` and one exists → replace the latest version's sections/summary in place (version number unchanged).

Generated sections use numbered headings: `1. Project summary`, `2. Architecture and important subsystems`, `3. Current state and recent changes`, `4. Active PRs and unresolved issues`, `5. Known operational caveats`, `6. Important engineering decisions`, `7. Recommended next actions`. Per-section evidence is in `sources`. A section without evidence gets `insufficientEvidence:true` and a body that says what is unknown.

**Repository & search**

| Method + path | Behavior |
|---|---|
| `GET /projects/:id/repository/tree` | `RepositoryTree {projectId, repository: fullName, tree}`. |
| `GET /projects/:id/repository/files/*path` | `FileContent`. Exact `(projectId, path)` lookup, no filesystem or GitHub access at request time. Missing → 404 `"File not found"`. Binary or large → `content:""` with the flag set. |
| `GET /search?q=&projectId=&language=` | `q` ≤200. Missing/empty `q` → 200 with empty results. `projectId` and `language` equal to `all` or absent mean no filter. A specific `projectId` the user doesn't own → 404. Scope = owned projects. Returns `SearchResults {query, projectId, language, results ≤50, totalCount = matching files}`. Each result is one file: `type` `file` (or `readme` for README files), `lineNumber` = startLine + offset of the first matching line, `snippet` = that line ±1, ≤300 chars, `matchedText` = the actual matched substring, `fileName` = basename. |

## FRONTEND → BACKEND MAP

| Screen / component | User action | Endpoint | Validation | DB op | Frontend state update |
|---|---|---|---|---|---|
| `SignInCard` GitHub button | click | `GET /auth/github` (full-page navigation) | state cookie | upsert `users`, insert `sessions` | Browser lands on `/dashboard`. On failure `/sign-in?error=oauth_failed` → `SignInCard` shows `generalError`. |
| `SignInCard` email form | submit | none (see Risks) | existing client `signInSchema` | – | `signInWithEmail` rejects with "Email sign-in is not available. Continue with GitHub." |
| `ProfilePage`, any page | load | `GET /auth/me` | session | find session + user | `useCurrentUser`. A 401 anywhere → `client.ts` redirects to `/sign-in`. |
| `AppHeader` Sign Out | click | `POST /auth/logout` | – | delete session | Navigate `/sign-in`, `queryClient.clear()`. |
| `DashboardPage`, `ProjectsListPage`, `CommandPalette`, `SearchPage` project filter | load | `GET /projects` | – | find by `ownerId` | `useProjects` list. |
| `ConnectRepoModal` | submit `fullName` | `POST /projects` | regex, GitHub lookup, dup check | insert project + sync job, start runner | Invalidate `projects.all`, navigate `/app/projects/{id}`. Errors surface via `createProject.error.message`. |
| `ProjectsListPage`, `ProjectSettingsPage` delete | confirm | `DELETE /projects/:id` | ownership | cascade delete | Invalidate list, navigate `/dashboard`. |
| `ProjectGuard`, `ProjectOverviewPage`, `ProjectHero`, `ProjectHealthCard` | load project | `GET /projects/:id` | ownership | find | 404 → `ProjectNotFound`. `health` and `healthLabel` rendered. |
| `ProjectHero`, `ProjectSettingsPage` Sync | click; poll 1s while `running` | `POST /sync`, `GET /sync` | ownership, one active job | insert/read `sync_jobs`, run pipeline | Polls only while `project.syncStatus` or `syncJob.status` is `running`. **A fix is required**, see Phase 5. |
| `ProjectActivityTimeline` | load | `GET /activity` | ownership | find, sort | `useProjectActivity`. Events are written by sync, ask, decision create, onboarding first-complete and handoff generate/version. |
| `ExplorerPage` | type chip / search box | `GET /artifacts?type&q` | enum, `q` length | filtered find, cap 200 | `useProjectArtifacts(id, type, q)` keyed on `{type, query}`. |
| `RepositoryExplorerPage`, `RepositoryTree` | load | `GET /repository/tree` | ownership | find `repo_files`, build tree | Nested `tree`, root expanded to depth 2 client-side. |
| `FileViewer` | select file (`?path=`) | `GET /repository/files/*path` | exact path | find `repo_files` | Renders `isBinary`/`isLarge` states. 404 → error state. |
| `SearchPage` | type query, filters | `GET /search` | `q`, `all` handling | regex aggregation on `chunks` | `results` + `totalCount`. `language` chips are lowercase. |
| `AskPage` | submit question | `POST /ask`, then refetch `GET /ask` | trim 1–2000 | `$text` retrieval, LLM, insert `ask_answers` | Newest-first list. Client animates new answers. `insufficientEvidence` drives `InsufficientEvidenceState`. |
| `DecisionsPage`, `NewDecisionModal` | load; submit | `GET`/`POST /decisions` | title/summary required | insert `decisions`, upsert mirror artifact | Invalidate `decisions`. |
| `OnboardingPage`, `OnboardingOverview`, `ImportantFiles`, `GettingStarted` | load | `GET /onboarding/data`, `GET /onboarding` | ownership | read `project_analysis`, `onboarding_plans` | Empty arrays and `items:[]` while indexing. |
| `OnboardingItemRow` | toggle checkbox | `PATCH /onboarding/items/:itemId` | `completed` boolean | update array item | Invalidate `onboarding` and refetch the plan. Progress UI is derived client-side. |
| `HandoffPage` | load | `GET /handoffs`, `GET /handoffs/current`, `GET /handoffs?version=N` | version int | find | `HandoffVersionHistory` sorts desc. A 404 on current means the empty state. |
| `HandoffEmptyState` Generate / `HandoffActions` Regenerate | click | `POST /handoffs/generate {regenerate}` | indexed, rate limit | LLM, insert or replace latest | `generateMutation.isPending` shows loading. Regenerate clears unsaved edits client-side. |
| `HandoffSectionEditor` then Save Version | edit, save | `PATCH /handoffs/current` then `POST /handoffs/versions` (sequential, as `HandoffPage.handleSaveVersion` does) | section rules | update latest; insert clone | `setCurrentVersion(newVersion.version)`. |
| `NewHandoffModal` | submit | `POST /handoffs` | title/summary required | insert | Invalidate `handoffs`. |
| `HandoffActions` Export | click | none (client-side Markdown Blob) | – | – | **NOT REQUIRED** on the backend. |
| `SettingsPage`, `ProjectSettingsPage` toggles/branch | edit | none | – | – | **NOT REQUIRED** (local state only). |

**Frontend assumptions the backend must preserve:**
1. Same-origin `/api/v1`, cookie auth, errors expose only `message`.
2. A project 404 must be exactly 404, because `ProjectGuard` branches on `ApiError.status === 404`.
3. 204 for `DELETE /projects/:id`. All mutations return the full updated object, not a delta.
4. All dates are UTC ISO strings with `Z`. All `url` fields are absolute or `null`. `User.email` is a valid email.
5. `project.syncStatus` is `running` for the entire job. `ProjectHero` polls only on `running`, so `queued` is never visible. `POST /sync` and create therefore start as `running`.
6. `GET /ask` must include an answer immediately after `POST /ask` returns (the client refetches).
7. List endpoints return bare arrays. `handoffs?version=` returns an object, not an array.
8. `health` is optional on the `Project` schema, but `healthLabel` is required.
9. `type=all`, `projectId=all` and `language=all` mean no filter.
10. The `AskAnswer` body is rendered through `whitespace-pre-line` plus `StreamingText`, so produce plain text with `\n`, with optional `**bold**` and numbered lists only, and no HTML.
11. Search-language and file-language values are lowercase slugs.

## IMPLEMENTATION PLAN

Run phases strictly in order. After each, run its verify command plus `pnpm --filter web check` if web files changed.

**Phase 1: API foundation**
- Create `apps/api/{package.json, tsconfig.json, tsup.config.ts, vitest.config.ts, .env.example}` and `src/{server,app,config}.ts`, `middleware/{requestId,error}.ts`, `lib/{errors,ids,serialize}.ts`.
- `tsconfig.json`: path alias `@web-types/*` → `../web/src/lib/api/*`. The same alias goes in the vitest and tsup configs.
- Dependencies: express@5, zod@^4, mongodb, pino, pino-http, helmet, express-rate-limit, groq-sdk; dev: tsx, tsup, vitest, supertest, mongodb-memory-server, typescript 5.9.3.
- `GET /api/v1/healthz` → `{ok:true}` (unauthenticated).
- Scripts: `dev` (tsx watch), `build` (tsup), `check` (tsc --noEmit), `lint` (`tsc --noEmit` is acceptable if no ESLint is added), `test` (vitest run).
- Verify: `pnpm --filter api check && pnpm --filter api test`.

**Phase 2: Database**
- `db/{client,collections,indexes}.ts`. `ensureIndexes()` called at boot and in test helpers. Typed collection handles for every collection in DATA MODEL.
- `lib/{crypto,language,chunker,secrets}.ts` (AES-GCM, extension → lowercase slug map, 60-line chunker, secret-path matcher).
- Tests: crypto roundtrip, chunker `startLine`, secrets matcher, partial unique index on `sync_jobs`.
- Verify: `pnpm --filter api test`.

**Phase 3: Authentication**
- `integrations/github.ts` (OAuth exchange, user, emails) behind an interface so tests inject a fake. `services/authService.ts`, `routes/auth.ts`, `middleware/auth.ts` (`requireUser`).
- Tests: callback creates user + session, bad state redirects to `/sign-in?error=oauth_failed`, `/auth/me` 401 without cookie, logout invalidates the session server-side, token not present in any response.
- Verify: `pnpm --filter api test auth`.

**Phase 4: Core APIs (in this sub-order)**
1. `projectService`/`routes/projects.ts` + `loadOwnedProject` middleware. Table-driven isolation test: user B gets 404 on every `/projects/:id/*` route.
2. `integrations/github.ts` repo/tree/blob/commits/issues/PRs/count helpers, plus `jobs/syncRunner.ts` and `routes/sync.ts`. Includes generation swap, boot recovery, project delete aborting the job.
3. `routes/artifacts.ts`, `activity.ts`, `repository.ts` (tree + files).
4. `routes/search.ts`. Read `features/search/SearchPage.tsx` and `mocks/data.ts` `mockSearchResults` first to match `language` and `fileName` values.
5. `integrations/llm.ts` (interface plus Groq impl, JSON mode, zod validation, one retry), then `askService`/`routes/ask.ts`, `decisions.ts`.
6. Sync step 90–100: analysis, onboarding plan generation, health. Then `onboarding.ts` routes.
7. `handoffService`/`routes/handoffs.ts` with the exact semantics above. Register static routes (`/current`, `/generate`, `/versions`) as written; there is no `/:version` param route.
- Each route returns through `serialize.ts`. Each test `schema.parse`s the response with the matching web zod schema (`projectSchema`, `askAnswerSchema`, `handoffSchema`, `searchResultsSchema`, …).
- Tests per area (fake GitHub + fake LLM): ask zero-hit → no LLM call and `insufficient`; unknown cited ids dropped; handoff generate/PATCH/versions matrix; failed sync keeps old chunks; secret files never stored.
- Verify: `pnpm --filter api test`.

**Phase 5: Frontend integration (minimal edits only)**
- `apps/web/vite.config.ts`: add `server.proxy: {"/api": "http://localhost:4000"}`.
- `apps/web/src/main.tsx` / `mocks/browser.ts`: start MSW only when `import.meta.env.VITE_USE_MOCKS === "true"`.
- `lib/api/client.ts`: on a 401 (excluding `/auth/me` on `/sign-in` and `/`), `window.location.assign("/sign-in")`.
- `features/auth/api.ts`: `signInWithGithub` → `window.location.assign("/api/v1/auth/github")`; `signInWithEmail` rejects with the unsupported message. `SignInCard`: read `?error=oauth_failed` into `generalError`.
- `components/layout/AppHeader.tsx`: the Sign Out item calls `POST /auth/logout` then `queryClient.clear()` then navigate to `/sign-in`. Add a `useLogout` hook in `hooks.ts`.
- `features/projects/ProjectHero.tsx`: when the polled `syncJob.status` transitions out of `running`, invalidate `queryKeys.projects.detail(id)`, `queryKeys.projects.all` and the repository/artifact queries. Without this the project stays `running` and polls forever.
- `lib/api/hooks.ts` `useFileContent`: encode each path segment (`filePath.split("/").map(encodeURIComponent).join("/")`).
- Do not touch `types.ts`, `query-keys.ts`, mocks, or any UI layout/styling.
- Verify: `pnpm check && pnpm lint && pnpm test` (existing web tests must still pass untouched). Manual: `pnpm --filter api dev` plus `pnpm dev` with `VITE_USE_MOCKS=false`, sign in, connect a small public repo, walk every page.

**Phase 6: Validation and error handling hardening**
- Add per-route zod schemas for any remaining untested bodies, 422 envelope tests, 429 tests, 502 mapping tests (GitHub/LLM failure), and a pino redaction test for `authorization`, `cookie` and the token.
- Verify: `pnpm --filter api test`.

**Phase 7: Production readiness**
- Root `package.json`: `check`/`lint`/`test`/`build` → `pnpm -r <script>`. Add `dev:api` → `pnpm --filter api dev`.
- `Dockerfile` (web): also `COPY apps/api/package.json`; the build command becomes `pnpm --filter web build`. New `Dockerfile.api`.
- `docker-compose.yml`: add `mongo:7` (volume) and `api` (depends_on mongo, env from `.env`). `nginx.conf`: `location /api/ { proxy_pass http://api:4000; proxy_read_timeout 120s; proxy_set_header X-Forwarded-Proto $scheme; }`. Express uses `trust proxy`.
- CI (`ci.yml`) already runs root scripts, so it needs no change except Node/pnpm being unchanged.
- Verify: `pnpm check && pnpm lint && pnpm test && pnpm build`, `docker compose build`.

## RISKS / OPEN DECISIONS

1. **Email/password sign-in has no backend purpose.** `SignInCard` has a form but there is no register UI, and `User.githubLogin` is required.
   - Default in this plan: GitHub-only, with the email path rejecting with a clear message.
   - Alternative: hide the form (a UI change), or add register + hashing (new scope).
2. **GitHub OAuth scope.** The default is `public_repo` (least privilege), so private repos return "not found or not accessible". Switching to `repo` is a one-env-var change plus a product/privacy decision.
3. **Handoff save semantics.**
   - The frontend calls `PATCH current` and then `POST versions`.
   - Under the in-place PATCH plus clone design, version N also contains the edits that become N+1.
   - The alternative (PATCH creates the new version) would require a frontend change, so it is not chosen.
4. **Regenerate overwrites the latest version in place.** This matches the mock. Prior content is lost unless the user saved a version first.
5. **Ask quality depends on `$text` keyword retrieval.** Semantic questions ("how does caching work?") may return weak or zero hits and get "insufficient". Embeddings are deferred (NOT REQUIRED for the UI contract) but will likely be the first quality upgrade.
6. **Search is substring-only over ≤5000 files per project** (regex scan, bounded by caps). Fine for the MVP, but large repos will need a different index.
7. **Synchronous LLM latency.** Ask and handoff generate block the HTTP request (tens of seconds). The client has no timeout and nginx is set to 120s. A very slow generation can still time out; fixing it would need a client change (async job plus polling).
8. **In-process sync does not survive restarts or scale horizontally.** Boot recovery marks jobs failed, and the user re-syncs manually. Acceptable for a single instance. Redis/worker is deferred.
9. **Onboarding plan is generated once** (first successful sync) and is not regenerated on later syncs. Item `artifactIds` can go stale if a later sync deletes artifacts. No UI exists to regenerate it.
10. **`LLM_MODEL` default `llama-3.3-70b-versatile` is unverified.** Confirm the model id against the Groq API before Phase 4 step 5.
11. **`ProjectArchitectureCard` and `SuggestedActionsCard`** source of data was not traced. `hooks.ts` has no endpoint beyond those listed, so they must consume `useProject`/onboarding data. If either renders fields absent from `Project`/`OnboardingData`, surface it in Phase 5 rather than adding endpoints.