# Relay: instructions for Claude Code

Purpose: Relay connects to GitHub repos and gives evidence-grounded answers, onboarding plans, and handoff documents. `docs/PRD.md` is the product source of truth (it wins over this file). The web zod schemas are the response contract; `apps/api` satisfies them. Scope: PRD P0 plus cheap P1 (webhook sync, SSE, onboarding, handoff). Out: team sharing, metrics dashboards, Redis/BullMQ, external vector DB.

## Stack
- Monorepo: pnpm 10.18 workspaces, Node 22. `apps/web` (React 19, Vite 7, TanStack Query, zod 4, strict TS). `apps/api` (Express 5, TS strict, MongoDB native driver, zod 4, pino, Groq SDK).
- Sync runs in-process (no Redis, no queue, no external vector DB). Embeddings are local (`@huggingface/transformers`, Xenova/all-MiniLM-L6-v2) and stored on chunks; retrieval is hybrid `$text` + in-process cosine. No new dependency unless a task names it.

## Contract sources of truth (read these, don't re-explore the repo)
- `apps/web/src/lib/api/types.ts`: zod schemas for every response. API tests must `schema.parse` responses with them (import via alias `@web-types/types`).
- `apps/web/src/lib/api/hooks.ts`: the complete list of endpoints the UI calls. `client.ts`: base `/api/v1`, error body read as `{message}`, 204 → undefined.
- `apps/web/src/mocks/handlers.ts`: reference behavior for status codes and shapes.
- Web contract changes are additive only: extend types.ts, mocks and hooks together; never break an existing schema.

## Backend architecture
- Layers: `routes/` (zod parse, auth, call service, send) → `services/` (logic) → `db/collections.ts`. Routes never touch collections. Integrations (`integrations/github.ts`, `integrations/llm.ts`, `lib/embedder.ts`) are interfaces injected via `createApp({db, github, llm, embedder})`; tests use fakes (`test/fakes.ts`). Never hit real GitHub, the LLM or the model in tests.
- Sync runs in-process (`jobs/syncRunner.ts`): one active job per project, max 2 global, generation swap (write new `gen`, then delete old) so failures keep old data. Transient GitHub errors (5xx, network) retry 3x with backoff; unchanged blobs and chunk embeddings are reused by sha/text. Triggers: manual sync, `POST /webhooks/github` (raw-body HMAC, mounted before `express.json`, idempotent by delivery id). `GET /projects/:id/events` streams status as SSE (nginx must not buffer it).
- Auth: GitHub OAuth only. Server-side sessions in Mongo, cookie `relay_sid` httpOnly SameSite=Lax. GitHub token AES-256-GCM encrypted; never serialized or logged. State-changing routes require JSON content-type.
- Projects can be archived (hidden from the default list, sync refused) or revoked (stored token dropped when it is the owner's last live connection, sync refused, data stays readable); delete cascades through every child collection including `members` and `agent_runs`.
- Tenancy: `projects.ownerId` is the only boundary. Every `/projects/:id/*` route calls `loadOwnedProject`; a bad id, missing project, or other user's project is 404 `{message:"Project not found"}`. Every child query filters by `projectId`.

## Data conventions
- Artifact API id = `key`, stable across syncs.
- API ids = `_id.toHexString()`. Dates = `toISOString()` (zod `.datetime()` rejects offsets). URLs absolute or null. Convert via `lib/serialize.ts` only.
- Collections and indexes live in `db/indexes.ts`. Add an index there when you add a query pattern. `chunks` text index has a `projectId` prefix; always query with `projectId` equality.
- Every read filters the current generation. `repo_files` and `chunks`: `gen = project.syncGeneration`. `artifacts`: `gen in [project.syncGeneration, null]` (null = decision mirrors). Never return rows from other generations.
- File `language` is a lowercase slug (rust, typescript, markdown, json, toml). `Project.language` keeps GitHub casing.

## API conventions
- Base `/api/v1`. Lists are bare arrays (no pagination). Mutations return the full updated object. Delete → 204.
- Errors: `{message, code, details?}`. 401 / 404 (also for not-owned) / 409 / 422 (zod) / 429 / 502 (upstream) / 500 (sanitized).
- `handoffs?version=N` returns a single object; `GET /handoffs` returns an array. `PATCH /handoffs/current` mutates latest in place; `POST /handoffs/versions` clones latest as version+1. Static handoff routes before anything parameterized.
- `project.syncStatus` is `running` for the entire job (UI polls only on `running`). Never expose `queued` to the UI.
- Ask returns a complete answer in one response (client fakes streaming). A deterministic planner (`services/agentTools.ts`) classifies the question and runs at most 4 read-only retrieval tools over the project's own data; each run is persisted in `agent_runs` (tools, sources, latency, degradation notes). No evidence, or model confidence `insufficient` → `confidence:"insufficient"`, `insufficientEvidence:true`, `sources:[]`; no LLM call when retrieval returns zero chunks.
- `/search` defaults to file/readme keyword results; `type`, `since` and `mode=semantic` opt in. `/artifacts` takes `type`, `q`, `since`. Aliases: `GET /me`, `POST /onboarding/generate` (keeps completion for titles that persist).

## Validation conventions
- zod schema per request in the route file. Trim strings. Enforce the length caps (question 2000, title 200, summary 2000, section body 20000, `fullName` regex `^[\w.-]+/[\w.-]+$`).
- Strip unknown keys. Never accept `id`, `projectId`, `version`, `ownerId` from client bodies.
- LLM output: strict JSON, zod-validated, one retry, cited source ids must be a subset of retrieved chunk ids.
- Never index secret files (.env*, keys, tokens, credentials, tfstate, ...) or vendor/build dirs (`lib/secrets.ts`); redact credential-shaped strings from everything stored (`lib/redact.ts`).

## Frontend integration rules
- Web changes are additive: reuse existing components and design tokens; no restyling or route changes. Update affected tests.
- Keep `pnpm test:visual` baselines untouched. Do not regenerate golden images.

## Commands
- Dev: `docker compose up -d mongo`, `pnpm --filter api dev` (port 4000), `pnpm dev` (web; proxy `/api` → 4000).
- Verify all: `pnpm check && pnpm lint && pnpm test && pnpm build`
- API only: `pnpm --filter api check|lint|test|build`
- Web only: `pnpm --filter web check|lint|test`

## Environment (apps/api/.env.example; client-visible vars: none except VITE_USE_MOCKS)
PORT=4000, NODE_ENV, MONGODB_URI, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_SCOPE (default `read:user user:email public_repo`), GITHUB_CALLBACK_URL, GITHUB_WEBHOOK_SECRET, TOKEN_ENCRYPTION_KEY (32 bytes base64), PUBLIC_APP_URL (e.g. http://localhost:5200), TRUST_PROXY (default 1), MAX_PROJECTS_PER_USER (default 10), GROQ_API_KEY, LLM_MODEL (default openai/gpt-oss-120b). Validate in `config.ts`; fail fast on boot. Never commit real values.

## Product constraints
- Evidence-grounded only: every project-specific claim must trace to a retrieved chunk. The agent is read-only: its only tools are retrieval over the current project, and there is no GitHub write path.
- Owner-only projects. No teams, roles, or settings persistence.

## Rules
- Build what the PRD and the current task require. No speculative endpoints, fields, abstractions, or dependencies.
- Do not reformat unrelated files.
- Never edit, skip, loosen or delete existing tests or visual baselines to get green. Fix the code. New tests assert the contract; do not weaken assertions or mock away the thing under test.
- Keep the architecture consistent: new routes follow the route → service → collections pattern, use `loadOwnedProject`, return through `serialize.ts`, and get a contract test that parses the web zod schema plus an isolation test (other user → 404).
- Run the verify command for what you changed before finishing. Do not re-investigate the frontend; use the contract files above.
- Run targeted tests (`pnpm --filter api test <name>`) plus tsc while working; the full gate (`pnpm check && pnpm lint && pnpm test && pnpm build`, plus `docker compose build` for deploy changes) before finishing. If the combined suite is slow, `pnpm -r --workspace-concurrency=1 test`.
- Existing Mongo data must keep booting: index changes that need a backfill get one in `db/indexes.ts` (see `backfillArtifactKeys`).
