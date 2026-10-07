# Relay: instructions for Claude Code

Purpose: Relay connects to GitHub repos and gives evidence-grounded answers, onboarding plans, and handoff documents. The React frontend is DONE and is the contract. You are building `apps/api` to satisfy it.

## Stack
- Monorepo: pnpm 10.18 workspaces, Node 22. `apps/web` (React 19, Vite 7, TanStack Query, zod 4, strict TS). `apps/api` (Express 5, TS strict, MongoDB native driver, zod 4, pino, Groq SDK).
- No Redis, no queue, no vector store, no webhooks, no SSE. Do not add them.

## Contract sources of truth (read these, don't re-explore the repo)
- `apps/web/src/lib/api/types.ts`: zod schemas for every response. API tests must `schema.parse` responses with them (import via alias `@web-types/types`).
- `apps/web/src/lib/api/hooks.ts`: the complete list of endpoints the UI calls. `client.ts`: base `/api/v1`, error body read as `{message}`, 204 → undefined.
- `apps/web/src/mocks/handlers.ts`: reference behavior for status codes and shapes.
- Do not edit types.ts, query-keys.ts or mocks. If the contract seems wrong, stop and ask.

## Backend architecture
- Layers: `routes/` (zod parse, auth, call service, send) → `services/` (logic) → `db/collections.ts`. Routes never touch collections. Integrations (`integrations/github.ts`, `integrations/llm.ts`) are interfaces injected via `createApp({db, github, llm})`; tests use fakes. Never hit real GitHub or the LLM in tests.
- Sync runs in-process (`jobs/syncRunner.ts`): one active job per project, max 2 global, generation swap (write new `gen`, then delete old) so failures keep old data.
- Auth: GitHub OAuth only. Server-side sessions in Mongo, cookie `relay_sid` httpOnly SameSite=Lax. GitHub token AES-256-GCM encrypted; never serialized or logged. State-changing routes require JSON content-type.
- Tenancy: `projects.ownerId` is the only boundary. Every `/projects/:id/*` route calls `loadOwnedProject`; a bad id, missing project, or other user's project is 404 `{message:"Project not found"}`. Every child query filters by `projectId`.

## Data conventions
- API ids = `_id.toHexString()`. Dates = `toISOString()` (zod `.datetime()` rejects offsets). URLs absolute or null. Convert via `lib/serialize.ts` only.
- Collections and indexes live in `db/indexes.ts`. Add an index there when you add a query pattern. `chunks` text index has a `projectId` prefix; always query with `projectId` equality.
- File `language` is a lowercase slug (rust, typescript, markdown, json, toml). `Project.language` keeps GitHub casing.

## API conventions
- Base `/api/v1`. Lists are bare arrays (no pagination). Mutations return the full updated object. Delete → 204.
- Errors: `{message, code, details?}`. 401 / 404 (also for not-owned) / 409 / 422 (zod) / 429 / 502 (upstream) / 500 (sanitized).
- `handoffs?version=N` returns a single object; `GET /handoffs` returns an array. `PATCH /handoffs/current` mutates latest in place; `POST /handoffs/versions` clones latest as version+1. Static handoff routes before anything parameterized.
- `project.syncStatus` is `running` for the entire job (UI polls only on `running`). Never expose `queued` to the UI.
- Ask returns a complete answer in one response (client fakes streaming). No evidence → `confidence:"insufficient"`, `insufficientEvidence:true`, `sources:[]`, and no LLM call when retrieval returns zero chunks.

## Validation conventions
- zod schema per request in the route file. Trim strings. Enforce the length caps from the plan (question 2000, title 200, summary 2000, section body 20000, `fullName` regex `^[\w.-]+/[\w.-]+$`).
- Strip unknown keys. Never accept `id`, `projectId`, `version`, `ownerId` from client bodies.
- LLM output: strict JSON, zod-validated, one retry, cited source ids must be a subset of retrieved chunk ids.
- Never index secret files (.env*, *.pem, *.key, id_rsa*, *secret*) or vendor/build dirs (`lib/secrets.ts`).

## Frontend integration rules
- Web edits are limited to the auth wiring files listed in the current phase prompt. No visual, layout, copy, or route changes.
- Keep `pnpm test:visual` baselines untouched. Do not regenerate golden images.

## Commands
- Dev: `docker compose up -d mongo`, `pnpm --filter api dev` (port 4000), `pnpm dev` (web; proxy `/api` → 4000).
- Verify all: `pnpm check && pnpm lint && pnpm test && pnpm build`
- API only: `pnpm --filter api check|lint|test|build`
- Web only: `pnpm --filter web check|lint|test`

## Environment (apps/api/.env.example; client-visible vars: none except VITE_USE_MOCKS)
PORT=4000, NODE_ENV, MONGODB_URI, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_SCOPE (default `read:user user:email public_repo`), TOKEN_ENCRYPTION_KEY (32 bytes base64), PUBLIC_APP_URL (e.g. http://localhost:5200), GROQ_API_KEY, LLM_MODEL (default llama-3.3-70b-versatile). Validate in `config.ts`; fail fast on boot. Never commit real values.

## Product constraints
- Evidence-grounded only: every project-specific claim must trace to a retrieved chunk. The agent is read-only (no tools, no GitHub writes).
- Owner-only projects. No teams, roles, archive, or settings persistence.

## Rules
- Implement only what the plan lists. Anything marked NOT REQUIRED stays unbuilt. No speculative endpoints, fields, abstractions, or dependencies.
- Do not modify existing web source beyond Phase 5. Do not reformat unrelated files.
- Never edit, skip, loosen or delete existing tests or visual baselines to get green. Fix the code. New tests assert the contract; do not weaken assertions or mock away the thing under test.
- Keep the architecture consistent: new routes follow the route → service → collections pattern, use `loadOwnedProject`, return through `serialize.ts`, and get a contract test that parses the web zod schema plus an isolation test (other user → 404).
- Work phase by phase in the order of the plan; run the phase's verify command before moving on. Do not re-investigate the frontend; use the contract files above.

## Token discipline
- Read only the files named in the prompt. Do not explore the repo.
- No plans, no questions, no summaries. Stop and report in 2 lines if blocked.
- Run targeted tests (`pnpm --filter api test <name>`) plus tsc. Run the full suite only when the prompt says so.
- Final reply: max 5 lines: files changed + command results.
