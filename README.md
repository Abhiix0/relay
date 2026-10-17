# Relay

**Understand any codebase faster.** Relay connects to a GitHub repository, indexes it, and turns the code, issues, pull requests and commit history into a searchable project context layer. On top of that it gives you an evidence-grounded Q&A agent, generated onboarding plans, and editable, versioned handoff documents.

Relay is evidence-first: every project-specific claim in an answer cites a source Relay actually retrieved, the agent is read-only, and when the evidence is weak the answer says so instead of guessing.

![CI](https://github.com/Abhiix0/relay/actions/workflows/ci.yml/badge.svg)

---

## Table of contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API overview](#api-overview)
- [Security model](#security-model)
- [Testing and CI](#testing-and-ci)
- [Deployment](#deployment)
- [Webhooks](#webhooks)
- [Troubleshooting](#troubleshooting)
- [Known limits](#known-limits)
- [Roadmap](#roadmap)
- [License](#license)

---

## What it does

| Area | What you get |
| --- | --- |
| **Connect** | Sign in with GitHub, pick a repository, and Relay indexes it in the background with live progress. |
| **Overview** | Repository snapshot: commits, pull requests, issues, releases, sync health, activity timeline and architectural highlights. |
| **Files** | Repository tree and file viewer over the indexed generation. |
| **Ask AI** | Project-scoped questions answered with cited files, issues, PRs and commits, plus a clear "insufficient evidence" state. |
| **Explorer** | Browse and filter indexed artifacts (files, issues, PRs, commits, README, decisions). |
| **Search** | Keyword and semantic search across one project or all of your projects. |
| **Onboarding** | A generated, ordered learning path linked to real files, with progress you can tick off. |
| **Handoff** | A generated handoff document with editable sections, saved versions, and an evidence appendix. |
| **Decisions** | A manual decision log that is also searchable and retrievable by the agent. |
| **Project controls** | Re-index, archive and unarchive, revoke the stored GitHub token, delete a project and all its data. |

## How it works

```
GitHub ─► tree + blobs (reused by sha) + commits/issues/PRs
       ─► redact secrets ─► chunk ─► embed (optional)
       ─► write generation N+1 ─► flip project.syncGeneration ─► delete generation N
          (a failed sync keeps generation N live)
```

**Sync.** Each project has a `syncGeneration`. A sync writes a complete new generation next to the old one, then flips the pointer and deletes the old rows. Reads always filter on the current generation, so a failed or aborted sync never corrupts what you can see. Unchanged files (same blob sha) are not re-downloaded or re-embedded.

**Ask.** A planner classifies the question, read-only retrieval tools search the project's own data, hybrid ranking merges full-text and embedding similarity, and the LLM answers in JSON. The cited source ids must be a subset of the chunks that were actually retrieved. Anything else is rejected.

**Trust.** Repository content is treated as untrusted data, never as instructions. The agent has no write tools and cannot touch the repository.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web | React 19, Vite 7, TypeScript, TanStack Query, React Router 7, Tailwind CSS, Radix UI, zod 4 |
| API | Node 22, Express 5, TypeScript, zod 4, pino, helmet |
| Database | MongoDB (native driver) with `$text` indexes |
| AI | Groq SDK (default model `openai/gpt-oss-120b`), local sentence embeddings (`Xenova/all-MiniLM-L6-v2`) |
| Auth | GitHub OAuth, server-side sessions, AES-256-GCM encrypted provider tokens |
| Tests | Vitest, Testing Library, MSW, mongodb-memory-server, Playwright, axe-core |
| Tooling | pnpm workspaces, ESLint, Prettier, Docker, GitHub Actions |

The zod schemas in `apps/web/src/lib/api/types.ts` are the API contract between the web app and the API.

## Repository layout

```
apps/
  web/        React SPA: features/, lib/api (contract + hooks), MSW mocks
  api/        Express API: routes/, services/, jobs/, integrations/, db/, lib/
e2e/          Playwright specs (app shell layout, landing visual, accessibility)
baseline/     Visual baselines (do not regenerate)
docs/         PRD, backend plan, gap check, MVP acceptance mapping
Dockerfile        Web image (nginx serving the Vite build)
Dockerfile.api    API image
docker-compose.yml, nginx.conf
```

API internals: `routes` parse input with zod and enforce auth; `services` hold logic and serialize at the edge; `db` holds collections and indexes; `jobs` runs the in-process sync runner (one sync per project, two globally); `integrations` wraps GitHub and Groq behind interfaces so tests use fakes; `lib` holds the embedder, secret redaction and secret-file rules.

## Quick start

**Prerequisites:** Node 22, pnpm 10.18, Docker (for MongoDB).

```bash
pnpm install --frozen-lockfile
docker compose up -d mongo
cp apps/api/.env.example apps/api/.env      # fill in the values (see Configuration)
pnpm --filter api dev                        # API on http://localhost:4000
pnpm dev                                     # web on http://localhost:5200 (proxies /api to :4000)
```

Open `http://localhost:5200`.

- **UI only, no backend:** `apps/web/.env.development` defaults to `VITE_USE_MOCKS=true`, which serves the whole UI from MSW mock data.
- **Real sign-in:** put `VITE_USE_MOCKS=false` in `apps/web/.env.development.local`.

### Create a GitHub OAuth app (local)

GitHub, Settings, Developer settings, OAuth Apps, New OAuth App:

- Homepage URL: `http://localhost:5200`
- Authorization callback URL: `http://localhost:5200/api/v1/auth/github/callback`

Copy the client ID and generate a client secret into `apps/api/.env`. A GitHub OAuth app has a single callback URL, so use a separate app for production.

## Configuration

All API configuration lives in `apps/api/.env` and is validated at startup. Invalid or missing values stop the process with a clear message.

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | e.g. `mongodb://localhost:27017/relay` |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | yes | From your GitHub OAuth app |
| `TOKEN_ENCRYPTION_KEY` | yes | 32 bytes, base64: `openssl rand -base64 32`. Losing it makes stored GitHub tokens unreadable. |
| `PUBLIC_APP_URL` | no | Browser origin, default `http://localhost:5200`. Also the only allowed `Origin` for state-changing requests; anything else gets 403. Derives the OAuth callback URL. |
| `GITHUB_SCOPE` | no | Default `read:user user:email public_repo` (public repositories only) |
| `GITHUB_CALLBACK_URL` | no | Overrides `<PUBLIC_APP_URL>/api/v1/auth/github/callback` |
| `GROQ_API_KEY` | for AI | Without it, Ask, handoff and plan generation return 503 |
| `LLM_MODEL` | no | Default `openai/gpt-oss-120b` |
| `EMBEDDINGS_ENABLED` | no | Default `true`. Set `false` to skip the local embedding model; search and Ask fall back to keyword retrieval. |
| `GITHUB_WEBHOOK_SECRET` | no | Enables `POST /api/v1/webhooks/github`; unset means 503 |
| `MAX_PROJECTS_PER_USER` | no | Default 10 |
| `TRUST_PROXY` | no | Reverse-proxy hops to trust for client IPs, default 1 |
| `PORT`, `NODE_ENV` | no | Defaults 4000, development |

Web (`apps/web/.env*`): `VITE_API_BASE_URL` should stay **empty**. The app talks to same-origin `/api/v1` through a reverse proxy or the Vite dev proxy. Never put secrets in frontend environment variables.

The first sync or semantic search downloads the embedding model (about 25 MB) and caches it. If the download fails, search silently falls back to keyword mode.

## Scripts

Run from the repo root:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Web dev server on :5200 |
| `pnpm --filter api dev` | API dev server on :4000 |
| `pnpm check` | TypeScript type-check, all packages |
| `pnpm lint` | ESLint, all packages (zero warnings allowed) |
| `pnpm test` | Vitest, all packages |
| `pnpm build` | Production build, all packages |
| `pnpm format` | Prettier |
| `pnpm test:visual` | Visual regression against `baseline/` |
| `pnpm test:a11y` | Accessibility checks on the landing page |
| `pnpm test:app-shell` | App shell layout checks |

## API overview

All routes are under `/api/v1`. Everything except sign-in and `healthz` requires a session, and every `/projects/:id/*` route returns 404 for projects you do not own.

| Group | Endpoints |
| --- | --- |
| Health and auth | `GET /healthz`, `GET /auth/github`, `GET /auth/github/callback`, `GET /auth/me` (alias `/me`), `POST /auth/logout` |
| Projects | `GET/POST /projects`, `GET/DELETE /projects/:id`, `POST /projects/:id/archive`, `/unarchive`, `/revoke` |
| GitHub | `GET /github/repos` |
| Sync | `GET/POST /projects/:id/sync`, `GET /projects/:id/events` (server-sent events) |
| Repository | `GET /projects/:id/repository/tree`, `GET /projects/:id/repository/files/*path` |
| Artifacts | `GET /projects/:id/artifacts`, `GET /projects/:id/artifacts/:artifactId`, `GET /projects/:id/activity` |
| Ask | `GET/POST /projects/:id/ask` |
| Search | `GET /search` (all projects or one) |
| Onboarding | `GET /projects/:id/onboarding`, `POST .../onboarding/generate`, `PATCH .../onboarding/items/:itemId` |
| Handoffs | list, `current`, `generate`, `PATCH current`, `POST versions` under `/projects/:id/handoffs` |
| Decisions | `GET/POST /projects/:id/decisions` |
| Webhooks | `POST /webhooks/github` (signature verified) |

Expensive routes are rate limited per user (Ask 20, search 30, sync 5, project create 5, handoff and decision writes 20, onboarding generate 10, per minute), and sign-in is rate limited per IP.

## Security model

- **Tenancy.** `projects.ownerId` is the only tenancy boundary. A project that is not yours and a project that does not exist both return 404.
- **Tokens.** GitHub tokens are AES-256-GCM encrypted at rest and never serialized, returned or logged. Revoking a project deletes its stored token.
- **Sessions.** Server-side sessions in an HttpOnly, Secure, SameSite=Lax cookie. OAuth uses a state cookie.
- **Secrets are not indexed.** `.env*`, private keys, keystores, credential files and similar are never stored, and credential-looking strings are redacted before anything is stored or chunked.
- **Input.** All request bodies are validated with zod; JSON content type is required for writes; source URLs must be http(s).
- **Browser.** helmet defaults, an Origin check on state-changing requests, and per-user and per-IP rate limits.
- **Prompt injection.** Retrieved content is data, not instructions; the model can only cite chunks that were retrieved; the agent has read-only tools.

## Testing and CI

API tests run against an in-memory MongoDB and fakes for GitHub, the LLM and the embedder. Nothing touches a real service. The web tests use Testing Library and MSW.

```bash
pnpm check && pnpm lint && pnpm test && pnpm build
docker compose build
```

If the combined suite is slow on your machine: `pnpm -r --workspace-concurrency=1 test`.

GitHub Actions runs type-check, lint, tests and build, and a separate job runs the visual regression suite against the committed baselines. Do not regenerate baselines to make a failing diff pass.

Acceptance evidence for the product requirements is in [`docs/MVP_ACCEPTANCE.md`](docs/MVP_ACCEPTANCE.md).

## Deployment

### Option A: Docker Compose (everything on one host)

```bash
cp apps/api/.env.example apps/api/.env      # fill in
docker compose up -d --build                 # web on :3000, nginx proxies /api to the API
```

nginx disables buffering for `/api/v1/projects/:id/events` so server-sent events stream. The API image is glibc-based because the embedding runtime has no musl binaries.

### Option B: Render (API) + Vercel (web) + MongoDB Atlas

```
browser ─► https://<name>.vercel.app ──/api/* rewrite──► https://<service>.onrender.com ─► MongoDB Atlas
```

The web app and the API **must appear as one origin** to the browser. The session cookie is SameSite=Lax, the API has no CORS, and the web code uses same-origin `/api/v1` paths. Vercel therefore proxies `/api/*` to Render.

**1. MongoDB Atlas.** Create a free cluster and a database user (letters and digits only in the password, role "Read and write to any database"). Under Network Access allow `0.0.0.0/0`. Your connection string must include the database name:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/relay?appName=Cluster0
```

**2. Vercel project (reserve the domain).** Import the repository with the Root Directory left at the repo root. Set Node.js to 22.x. Leave `VITE_API_BASE_URL` unset. Note your production URL `https://<name>.vercel.app`.

**3. GitHub OAuth app (production).** Homepage `https://<name>.vercel.app`, callback `https://<name>.vercel.app/api/v1/auth/github/callback`.

**4. Render web service.** Runtime Docker, **Dockerfile path `./Dockerfile.api`**, build context `.`, health check path `/api/v1/healthz`. Environment variables:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Atlas string with `/relay` |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | From the production OAuth app |
| `TOKEN_ENCRYPTION_KEY` | `openssl rand -base64 32` |
| `PUBLIC_APP_URL` | `https://<name>.vercel.app` (exact, no trailing slash) |
| `TRUST_PROXY` | `2` (browser, Vercel, Render load balancer) |
| `EMBEDDINGS_ENABLED` | `false` on small instances (512 MB RAM) |
| `GROQ_API_KEY` | Your key |

Render sets `PORT` itself and the image sets `NODE_ENV=production`. Confirm `https://<service>.onrender.com/api/v1/healthz` returns `{"ok":true}`.

**5. Connect Vercel to Render.** Add `vercel.json` at the repo root with your real Render URL and push:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "pnpm install --frozen-lockfile --filter web...",
  "buildCommand": "pnpm --filter web build",
  "outputDirectory": "apps/web/dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<service>.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The API rule must come first. The second rule is the single-page-app fallback so deep links such as `/app/dashboard` survive a refresh.

**6. Smoke test.** `https://<name>.vercel.app/api/v1/healthz` returns ok; sign in with GitHub and land on `/app/dashboard`; connect a small public repository and wait for the sync; try Ask, Onboarding and Handoff.

> `TRUST_PROXY` matters for rate limits. If it is too low, every visitor looks like the proxy's IP and shares one bucket. Check the `RateLimit-Remaining` header from two different networks; if it counts down across both, adjust the value.

## Webhooks

Optional. Set `GITHUB_WEBHOOK_SECRET`, then add a repository webhook:

- Payload URL: `https://<api-host>/api/v1/webhooks/github` (point at the API host directly)
- Content type: `application/json`
- Secret: the same value as `GITHUB_WEBHOOK_SECRET`
- Events: push, issues, pull requests

A verified event queues a sync for every non-archived project on that repository. Signatures are checked in constant time and duplicate deliveries are ignored.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| nginx `host not found in upstream "api"` on Render | Wrong Dockerfile | Use `./Dockerfile.api` |
| `bad auth : authentication failed` | Wrong Atlas user or password, or a `<password>` placeholder left in | Reset the user password, rebuild the URI |
| `Server selection timed out` | Atlas network allowlist | Add `0.0.0.0/0` |
| `Invalid environment configuration` | Missing or malformed variable | The log names it; `TOKEN_ENCRYPTION_KEY` must be 32 bytes base64 |
| Redirect to `/sign-in?error=oauth_failed` | OAuth callback mismatch or wrong client secret | Callback must be `PUBLIC_APP_URL` + `/api/v1/auth/github/callback` |
| 403 `forbidden_origin` | Browser origin differs from `PUBLIC_APP_URL` | Fix `PUBLIC_APP_URL`; preview URLs are not supported |
| 429 for everyone | All users share one proxy IP | Adjust `TRUST_PROXY` |
| 404 on page refresh | Missing SPA rewrite | Check `vercel.json` rule order |
| Ask or Handoff return 503 | No `GROQ_API_KEY` | Set it |
| Ask or Handoff return 502 | Model unavailable for your key | List models and set `LLM_MODEL` |
| Search is keyword-only | Embeddings disabled or model download failed | Expected when `EMBEDDINGS_ENABLED=false` |

## Known limits

- Public repositories only by default (`public_repo` scope).
- Sync runs in the API process. On hosts that sleep or restart (for example free Render), a running sync is marked failed on the next boot and you re-index.
- Large repositories are indexed within bounds (file count and size caps); binary and oversized files are listed but not indexed.
- Vercel preview deployments cannot sign in, because the Origin check and OAuth are bound to one `PUBLIC_APP_URL`.
- Single-owner projects. There is no team sharing yet.

## Roadmap

Post-MVP candidates from the product spec ([`docs/PRD.md`](docs/PRD.md)): team sharing and roles, Slack or Discord ingestion with explicit consent, Jira and Linear integration, CI and deployment signals, architecture diagram generation, automatic decision extraction, and context-gap detection.

## License

MIT
