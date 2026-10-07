# Relay

**Understand any codebase faster.**

Relay is a developer tool that connects to GitHub repositories and provides instant project context through an evidence-grounded AI agent, interactive onboarding guides, architectural handoffs, and intelligent search. Every answer is backed by AST nodes, commit history, and PR evidence—no hallucinations.

## What Relay Does

- **Evidence-Grounded AI**: Ask questions about any codebase and get answers backed by actual source code, commits, and PR reviews
- **Smart Onboarding**: Interactive guides that help developers understand unfamiliar codebases quickly
- **Architecture Handoffs**: Generate and maintain comprehensive project documentation with evidence citations
- **Intelligent Search**: Find code, documentation, and architectural decisions across repositories
- **Project Context**: Understand repository health, sync status, and development patterns

## Features

✅ **Completed (Phase 0-9)**
- Landing page with responsive design
- Project dashboard and management  
- GitHub repository connection and indexing
- File browser with syntax highlighting
- Global search across projects and files
- Evidence-grounded AI chat agent
- Interactive onboarding workflows
- Architecture handoff generation and editing  
- Version-controlled handoff documents
- Markdown export functionality
- User profile and authentication
- Project-level and app-level settings
- Architecture decision records (ADRs)
- Comprehensive system states (loading, empty, error, offline, 404)
- Keyboard accessibility and focus management
- Responsive design across all screen sizes

## Tech Stack

**Frontend:**
- React 19 with TypeScript (strict mode)
- Vite for build tooling and development
- Tailwind CSS v3 with custom design tokens
- Radix UI primitives for accessibility
- TanStack Query for data fetching and caching
- React Router v7 for client-side routing
- MSW (Mock Service Worker) for API mocking
- Vitest + Testing Library for unit tests

**Development:**
- pnpm workspace monorepo
- ESLint + TypeScript strict mode
- Prettier code formatting
- GitHub Actions CI/CD
- Docker containerization

## Requirements

- **Node.js**: 22.x or later
- **pnpm**: 10.18.0 or later
- **Git**: For version control

## Installation

```bash
git clone <repository-url>
cd relay
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**Available Scripts:**
- `pnpm dev` — Start development server with hot reload
- `pnpm build` — Build for production  
- `pnpm preview` — Preview production build locally
- `pnpm check` — TypeScript type checking
- `pnpm lint` — ESLint code quality checks
- `pnpm test` — Run unit tests
- `pnpm format` — Format code with Prettier

## Validation

Verify everything works correctly:

```bash
# Type checking
pnpm check

# Code quality
pnpm lint  

# Unit tests
pnpm test

# Production build
pnpm build
```

All commands should exit with code 0 (success).

## Docker

For containerized deployment:

```bash
# Build and start the application
docker compose up

# Or build only
docker compose build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The Docker setup uses:
- Multi-stage build for optimized production image
- Nginx for efficient static file serving
- Gzip compression and security headers
- Health checks for container monitoring

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
│   └── web/                    # Main React application
│       ├── src/
│       │   ├── app/           # App shell, router, providers
│       │   ├── pages/         # Route-level pages (404, etc.)
│       │   ├── features/      # Feature modules
│       │   │   ├── ask/       # AI chat interface  
│       │   │   ├── dashboard/ # Project management
│       │   │   ├── explorer/  # File browser
│       │   │   ├── handoff/   # Architecture docs
│       │   │   ├── onboarding/# Interactive guides
│       │   │   ├── profile/   # User management
│       │   │   ├── search/    # Global search
│       │   │   └── settings/  # Configuration
│       │   ├── components/    # Reusable UI components
│       │   ├── lib/          # Utilities and API client
│       │   ├── mocks/        # MSW API mocking
│       │   ├── styles/       # Global CSS and design tokens
│       │   └── types/        # TypeScript definitions
│       ├── public/           # Static assets
│       └── index.html        # Entry HTML
├── .github/workflows/        # GitHub Actions CI
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Container definition
└── pnpm-workspace.yaml     # Workspace configuration
```

## Environment Variables

No environment variables are required for development. The application uses MSW to mock all API calls locally.

For production deployment, you may want to configure:
- Custom API endpoints (when backend is available)  
- Authentication providers
- Analytics tracking

## Troubleshooting

**Common Issues:**

1. **pnpm not installed**
   ```bash
   npm install -g pnpm@10.18.0
   ```

2. **Dependencies won't install**
   ```bash
   rm -rf node_modules apps/web/node_modules
   pnpm install --frozen-lockfile
   ```

3. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   # Or use different port
   PORT=3001 pnpm dev
   ```

4. **Docker build fails**
   - Ensure Docker Desktop is running
   - Check available disk space (>2GB recommended)
   - Try `docker system prune` to free space

5. **TypeScript errors after updates**
   ```bash
   pnpm check
   # Fix any type errors before continuing
   ```

**Need help?** Check the existing issues or create a new one with:
- Your operating system
- Node.js and pnpm versions (`node --version && pnpm --version`)
- Full error message
- Steps to reproduce

## Development Guidelines

- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`
- **Components**: Keep under 200 lines, extract utilities to `/lib`
- **Styling**: Use design tokens only (no hardcoded colors)
- **Accessibility**: Semantic HTML with proper ARIA attributes
- **Testing**: Focus on behavior, not implementation details
- **Performance**: Leverage React Query caching, avoid unnecessary re-renders

## License

MIT License - see LICENSE file for details.
