# Relay — Understand any codebase faster

Relay is a developer tool that connects GitHub repositories and gives instant project context, an evidence-grounded AI agent, onboarding, handoff, and search. **North star: "Understand any codebase faster."**

This is a pnpm workspace monorepo containing the Relay frontend application.

## Stack

**Frontend (apps/web):**
- React 19 with TypeScript (strict mode)
- Vite for build tooling
- Tailwind CSS v3 with design tokens
- shadcn/ui patterns
- TanStack Query for data fetching
- React Router v7
- Self-hosted fonts (Inter + JetBrains Mono)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Scripts

**Root workspace:**
- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm preview` — Preview production build
- `pnpm check` — TypeScript type checking
- `pnpm lint` — ESLint validation
- `pnpm format` — Format with Prettier

**Web app specific:**
```bash
cd apps/web
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm check    # Type check
pnpm lint     # Run ESLint
```

## Project Structure

```
relay/
├── apps/
│   └── web/                # Main frontend application
│       ├── src/
│       │   ├── app/        # Providers, router, layouts
│       │   ├── pages/      # Route components
│       │   ├── features/   # Feature modules (landing, dashboard, etc.)
│       │   ├── components/ # UI primitives and common components
│       │   ├── lib/        # Utilities (cn, format, api client)
│       │   ├── styles/     # Design tokens and global styles
│       │   └── types/      # TypeScript types
│       ├── public/         # Static assets
│       └── index.html      # Entry HTML
├── packages/               # Shared packages (future)
└── pnpm-workspace.yaml     # Workspace configuration
```

## Design System

The Relay visual identity follows an editorial design language with:
- **Warm linen surfaces** for marketing/landing
- **Charcoal/carbon product surfaces** for the application
- **Copper accent** for primary actions
- **Typography:** Serif headings (Georgia) + Monospace labels (JetBrains Mono)
- **Design tokens:** All colors are CSS variables mapped to Tailwind theme

See `apps/web/src/styles/tokens.css` for the complete token system.

## Development Guidelines

- TypeScript strict mode with `noUncheckedIndexedAccess`
- Components under 200 lines
- Design tokens only (no hardcoded colors)
- Accessible HTML with proper ARIA labels
- Evidence-first UX patterns

## Status

Frontend in active development. Backend API and database integration coming soon.
