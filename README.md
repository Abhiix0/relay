# Relay

**Project handoff and engineering context.** Relay connects to a GitHub repository, indexes it, and gives evidence-grounded answers, onboarding plans and handoff documents. Every project-specific claim cites a retrieved source, and the agent is read-only.

- `apps/web`: React 19, Vite 7, TanStack Query, zod 4, Tailwind. The zod schemas in `apps/web/src/lib/api/types.ts` are the API contract.
- `apps/api`: Express 5, MongoDB (native driver), zod 4, pino, Groq SDK, local sentence embeddings.
- Product spec: [`docs/PRD.md`](docs/PRD.md). Acceptance evidence: [`docs/MVP_ACCEPTANCE.md`](docs/MVP_ACCEPTANCE.md).

## Run it locally

Prerequisites: Node 22, pnpm 10.18, Docker (for MongoDB).

```bash
pnpm install --frozen-lockfile
docker compose up -d mongo
cp apps/api/.env.example apps/api/.env        # then fill in the values below
pnpm --filter api dev                          # API on :4000
pnpm dev                                       # web on :5200, proxies /api to :4000
```

Open `http://localhost:5200`. `apps/web/.env.development` defaults `VITE_USE_MOCKS=true` (MSW, no backend). For real sign-in put `VITE_USE_MOCKS=false` in `apps/web/.env.development.local`.

GitHub OAuth app: Settings, Developer settings, OAuth Apps. Homepage `http://localhost:5200`, callback `http://localhost:5200/api/v1/auth/github/callback`.

### Environment (`apps/api/.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | e.g. `mongodb://localhost:27017/relay` (compose overrides it) |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | yes | From the OAuth app |
| `GITHUB_SCOPE` | no | Default `read:user user:email public_repo` |
| `GITHUB_CALLBACK_URL` | no | Overrides `<PUBLIC_APP_URL>/api/v1/auth/github/callback` |
| `TOKEN_ENCRYPTION_KEY` | yes | 32 bytes, base64: `openssl rand -base64 32` |
| `PUBLIC_APP_URL` | no | Browser origin, default `http://localhost:5200`. State-changing requests whose `Origin` differs get 403 |
| `GROQ_API_KEY` | for AI | Without it, Ask, handoff and plan generation answer 503 |
| `LLM_MODEL` | no | Default `openai/gpt-oss-120b` |
| `GITHUB_WEBHOOK_SECRET` | no | Enables `POST /api/v1/webhooks/github`; unset means 503 |
| `MAX_PROJECTS_PER_USER` | no | Default 10 |
| `TRUST_PROXY` | no | Reverse-proxy hops to trust for client IPs, default 1 |
| `PORT`, `NODE_ENV` | no | 4000, development |

The first semantic search or sync downloads the `Xenova/all-MiniLM-L6-v2` model (about 25 MB) and caches it. If that fails, search silently falls back to keyword mode.

### Webhooks

Point a repository webhook at `https://<host>/api/v1/webhooks/github` (content type `application/json`, events: push, issues, pull requests) with the same secret as `GITHUB_WEBHOOK_SECRET`. A verified event queues a sync for every non-archived project on that repository. Unchanged files are not refetched or re-embedded.

## Verify

```bash
pnpm check && pnpm lint && pnpm test && pnpm build
docker compose build
```

API tests use an in-memory MongoDB and fakes for GitHub, the LLM and the embedder; nothing touches a real service. If the combined suite is slow on your machine, run `pnpm -r --workspace-concurrency=1 test`.

## Deploy with Docker

```bash
cp apps/api/.env.example apps/api/.env   # fill in
docker compose up -d --build              # web on :3000, nginx proxies /api to the API
```

nginx disables buffering for `/api/v1/projects/:id/events` (server-sent events). The API image is glibc-based because the embedding runtime has no musl binaries.

## Architecture

```
browser ── nginx / vite proxy ──> Express API (apps/api)
                                    routes   zod parse, auth, loadOwnedProject
                                    services logic, serialize.ts at the edge
                                    db       MongoDB collections + indexes
                                    jobs     in-process sync runner (1 per project, 2 global)
                                    integrations  GitHub, Groq (interfaces; fakes in tests)
                                    lib      embedder, redaction, secret-file rules

sync:   GitHub -> tree/blobs (reused by sha) + commits/issues/PRs -> redact -> chunk -> embed
        -> write generation N+1 -> flip project.syncGeneration -> delete N   (failures keep N)
ask:    planner (intent) -> read-only tools over this project -> hybrid rank
        ($text + cosine) -> LLM JSON -> cited ids must be a subset of retrieved chunks
```

Rules that matter: `projects.ownerId` is the only tenancy boundary and every `/projects/:id/*` route calls `loadOwnedProject` (not yours or missing is 404). Every read filters the current generation. GitHub tokens are AES-256-GCM encrypted and never serialized or logged. Secret files (`.env*`, keys, `*secret*`, ...) are never stored, and credential-looking strings are redacted before anything is stored or chunked.

## Demo flow (five minutes)

1. Sign in with GitHub and connect a repository you do not know. Watch the indexing progress.
2. Open the project dashboard: the stored snapshot, health and activity.
3. Ask: "How does authentication work?" The answer cites files and PRs.
4. Ask: "Why is Redis here?" The answer comes from decisions and history, not a generic definition.
5. Open Onboarding for the generated learning order; tick items off.
6. Generate a handoff and open "8. Evidence and source links".
7. Push a commit (or open an issue) on the repository: the webhook queues a sync and the dashboard updates live.

## Project layout

```
apps/web   React SPA (features/, lib/api contract, MSW mocks)
apps/api   Express API (routes/, services/, jobs/, integrations/, db/, lib/)
e2e        Playwright specs (layout, landing visual, a11y)
baseline   Visual baselines (do not regenerate)
docs       PRD, backend plan, gap check, acceptance mapping
```

MIT License.
