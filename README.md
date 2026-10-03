# Relay — Understand any codebase faster

Relay currently contains a frontend-first landing and marketing experience. The live page is a single responsive React route with an editorial developer-tool visual system, inline architecture diagrams, feature navigation, and a dashboard preview. No authentication, GitHub integration, API, or database behavior is wired into the frontend.

## Run locally

```bash
pnpm install
pnpm dev:static
```

The static development server listens on port 3000 by default and honors `PORT`. Use `pnpm check` for TypeScript validation, `pnpm build:static` for the frontend production build, and `pnpm test` for the existing repository tests.

The backend and database starter files remain in the repository for future product work but are outside the current frontend scope.
