# RELAY — Frontend Application

**Developer Codebase Intelligence & Architectural Transfer**

RELAY is a modern developer web application designed to connect to codebases and provide deep architectural context through evidence-grounded AI reasoning, interactive onboarding guides, engineering handoffs, repository browsing, and cross-project search.

---

## Architecture & Current Scope

This repository contains the **frontend single-page application (SPA)** built with React 19, TypeScript, Vite, Tailwind CSS, and TanStack Query.

### What is Implemented in this Frontend:
- **Application Shell**: Viewport-bounded workspace with stationary chrome and central internal scrolling.
- **Project Dashboard**: Repository listing, recent activity, and connection modal with immutable state management.
- **Repository & Artifact Explorer**: Source file navigation, directory trees, and ADR/artifact inspection.
- **Interactive Onboarding**: Ramp-up guides, file highlights, and contributor checklist UI.
- **Architecture Handoffs**: Structured engineering transfer briefs, section editing, and version history interface.
- **Architecture Decisions (ADRs)**: Technical decision records and searchable trade-off logs.
- **Evidence-Grounded AI Query Interface (Ask Relay)**: Query stream with cited line-number anchors.
- **Global Search**: Search UI with project and language filter chips.
- **Developer Profile**: Identity overview and integration status indicators.
- **Honest System States**: Explicit loading skeletons, empty states, typed network/API error handling, and offline banners.

### Backend Requirements (External Service):
This repository snapshot **does not include the backend API server or daemon service**. The following capabilities require a separately deployed and configured RELAY backend:
- Persistent user authentication and OAuth authorization.
- Real GitHub repository webhooks and live background synchronization.
- Real AST node parsing and semantic code indexing.
- Live AI LLM completion and evidence synthesis.

When a backend service is not running or unreachable, the frontend gracefully displays honest error and service-unavailable states rather than fabricating demo data or artificial progress.

---

## Configuration

### API Base URL

The API client communicates via REST requests to `/api/v1`. By default, it uses same-origin requests (`/api/v1`), suitable for reverse-proxy setups (such as nginx or ingress controllers).

To connect the frontend to a remote or dedicated backend API service:

1. Copy `.env.example` in `apps/web/.env.example` to `apps/web/.env`:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
2. Set `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=https://api.relay.yourdomain.com
   ```
   *(or `http://localhost:8080` for local backend development)*

> **Security Note:** Never put secrets, private tokens, or authentication credentials in client-side environment variables. All secrets belong on the backend server.

---

## Tech Stack

- **Framework:** React 19 + TypeScript (Strict Mode)
- **Bundler:** Vite 7
- **Styling:** Tailwind CSS v3 with semantic design tokens
- **UI Primitives:** Radix UI accessible headless components
- **Server State & Caching:** TanStack React Query v5
- **Routing:** React Router v7
- **Testing:** Vitest, Testing Library, Playwright (Visual & E2E)
- **Package Manager:** pnpm 10 (workspace monorepo)

---

## Getting Started

### Prerequisites
- Node.js 22.x or later
- pnpm 10.18.0 or later

### Installation
```bash
pnpm install --frozen-lockfile
```

### Development
```bash
pnpm dev
```
Starts the local development server at `http://localhost:3000`.

### Building & Verification
```bash
pnpm check      # TypeScript type checking
pnpm lint       # ESLint rules
pnpm test       # Vitest unit & integration tests
pnpm build      # Production bundle
```

### Preview Production Build
```bash
pnpm preview
```
Serves the production build locally at `http://localhost:4173`.

---

## GitHub sign-in setup

1. Create a GitHub OAuth App (Settings → Developer settings → OAuth Apps).
   - Local: homepage `http://localhost:5200`, callback `http://localhost:5200/api/v1/auth/github/callback`
   - Production: homepage `https://<your-domain>`, callback `https://<your-domain>/api/v1/auth/github/callback`
2. Copy `apps/api/.env.example` to `apps/api/.env` and fill in:

| Variable | Notes |
| --- | --- |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | From the OAuth App |
| `GITHUB_SCOPE` | Default `read:user user:email public_repo` |
| `GITHUB_CALLBACK_URL` | Optional; overrides the derived callback URL |
| `TOKEN_ENCRYPTION_KEY` | 32 bytes base64: `openssl rand -base64 32` |
| `PUBLIC_APP_URL` | Browser origin, e.g. `http://localhost:5200` |
| `MONGODB_URI` | e.g. `mongodb://localhost:27017/relay` (compose overrides it) |

`PUBLIC_APP_URL` must equal the origin the browser uses, so the `relay_sid` cookie stays same-origin (`/api` is proxied by Vite in dev and nginx in Docker).

`VITE_USE_MOCKS`: `.env.development` defaults to `true` (MSW mocks). Set it to `false` in `apps/web/.env.development.local` for real login. Never set it in production.

## Project Structure

```
relay/
├── apps/
│   └── web/                   # Frontend React application
│       ├── src/
│       │   ├── app/           # Router, Providers, entry
│       │   ├── components/    # Shell, Layout, and UI primitives
│       │   ├── features/      # Feature-specific pages & components
│       │   │   ├── ask/       # AI conversation interface
│       │   │   ├── auth/      # Sign-in forms & cards
│       │   │   ├── dashboard/ # Dashboard & repository connection
│       │   │   ├── decisions/ # ADR logging & creation
│       │   │   ├── explorer/  # Codebase artifact explorer
│       │   │   ├── handoff/   # Handoff generation & versions
│       │   │   ├── landing/   # Frozen marketing landing page
│       │   │   ├── onboarding/# Onboarding guides & checklists
│       │   │   ├── profile/   # Developer profile & integrations
│       │   │   ├── projects/  # Project overview & list
│       │   │   ├── repository/# Repository file tree & viewer
│       │   │   └── search/    # Global cross-project search
│       │   ├── lib/           # API client, typed hooks, utilities
│       │   ├── styles/        # Global CSS & semantic design tokens
│       │   └── test/          # Test setup & test fixtures
│       ├── public/            # Static assets
│       └── package.json
├── e2e/                       # Playwright tests (AppShell layout & landing visual)
├── docker-compose.yml         # Container configuration (static web container)
├── Dockerfile                 # Multi-stage production container build
├── nginx.conf                 # Static web server configuration
└── package.json               # Root monorepo workspace configuration
```

---

## License

MIT License.
