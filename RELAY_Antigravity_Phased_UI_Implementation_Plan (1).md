# RELAY — Phased UI Implementation Plan for Antigravity

## Goal
Bring the current RELAY application from the mostly empty dark dashboard to the supplied RELAY design board. The design board is the **visual source of truth** for authenticated/product pages; the current dashboard screenshot is the baseline to improve, not a design reference.

The target product should feel like one coherent, editorial developer tool: warm linen surfaces, charcoal navigation, copper accents, serif display headings, clean sans-serif body text, restrained mono labels, thin borders, compact useful information, and deliberate empty/loading/error states.

## Non-negotiable rules (paste into every implementation session)

- Work on **one phase only**. Do not start the next phase or expand the scope.
- The attached **RELAY Developer Tool Design System Board** is the visual source of truth. Compare against it while implementing. Use the current dashboard screenshot only to understand what must improve.
- **Freeze the public landing page (`/`)**: do not modify its layout, copy, spacing, colors, typography, animation, or behavior. Verify it has no visual regressions. Reuse its existing tokens where appropriate, but do not change the landing page to make the app easier to style.
- Use the existing design tokens and component conventions. Do not scatter hard-coded hex colors through page components. Do not introduce a new visual theme.
- Remove **runtime demo/seeded/mock data** from the product experience. Never fabricate repositories, counts, issues, pull requests, activity, files, AI answers, or profile stats. Test fixtures/mocks are allowed inside automated tests only.
- Use real repository/provider/backend data where integration actually exists. If a real integration or credential is not configured, show a clear, useful connection/setup/empty/error state. Do not pretend that a connection or sync succeeded.
- Every visible control must work. Do not leave dead buttons, fake toggles, placeholder pages, TODOs, or links pointing to nowhere. Hide navigation for not-yet-implemented capabilities until they are ready.
- Support loading, empty, error, offline, permission-denied, and insufficient-evidence states where relevant.
- Responsive layout, keyboard navigation, visible focus, semantic HTML, accessible names, and appropriate contrast are required.
- Preserve useful existing functionality. Do not delete or overwrite unrelated work, do not run destructive Git commands, and do not force-push.
- Before finishing, run the repository's available checks (normally `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build`). Report commands actually run and their real results; never claim a check passed if it was not run.
- Finish with a concise report: files changed, behavior changed, checks/results, known blockers, and a short manual verification checklist. Stop after reporting.

---

## Phase 0 — Repository audit and visual baseline
**Purpose:** Understand the real current state before changing code. This is an audit-only phase; do not implement visual changes yet.

### Antigravity prompt

> Inspect the RELAY repository and the attached RELAY design board/current dashboard screenshot. Follow the global rules above.
>
> Do not change source files in this phase. Inspect the app router, page/component structure, CSS/Tailwind tokens, current application shell, authentication, API/data layer, GitHub integration, mock/seed-data sources, and existing test/build commands.
>
> Return:
> 1. A route inventory: route, current page/component, whether it works, and whether it is required by the target board.
> 2. A data inventory: each page's data source and whether it is real backend/provider data, runtime demo data, test-only fixture data, or currently unavailable.
> 3. A visual gap report comparing the current dashboard to the design board: shell, palette, typography, spacing, content density, hierarchy, and responsiveness.
> 4. A list of routes/pages that should be removed from navigation or retired (at minimum the Design System page and Settings page, per product direction), plus routes that must remain (Landing, Sign In, Dashboard, Project Overview, Repository Explorer, Search, Ask Relay, Onboarding, Handoff, Profile, Not Found).
> 5. Existing blockers to real GitHub data, authentication, repository indexing, and AI answers. Do not invent backend endpoints or claim real integration without verifying it.
> 6. Baseline results for `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build` if the scripts exist. If any command fails, include the first relevant error and do not repair it in this audit phase.
>
> End with a recommended file/route sequence for the remaining phases. Do not start Phase 1.

**Done when:** The existing app, routes, data sources, and blockers are documented, with no source changes.

---

## Phase 1 — Design tokens, app shell, and navigation
**Purpose:** Establish the shared visual foundation before rebuilding individual pages.

### Antigravity prompt

> Implement only the shared authenticated-app foundation in RELAY. Follow the global rules and Phase 0 audit.
>
> Match the design board: warm linen/off-white content canvas, charcoal/dark-green sidebar, copper primary actions and small accents, restrained sage/warning/error status colors, thin low-contrast borders, minimal shadows, serif display headings, readable sans-serif body text, and compact mono metadata. Reuse existing landing-page tokens where appropriate; preserve `/` pixel-identically.
>
> Build/fix a consistent responsive app shell with:
> - A fixed or sticky dark left navigation on desktop with RELAY branding and clear active states.
> - A compact top bar with global search/Ask entry point and the profile/avatar menu.
> - A warm light content area with consistent max width, spacing, headings, section labels, buttons, cards, inputs, tables/list rows, and status indicators.
> - A mobile navigation pattern that remains usable without covering content.
> - Accessible focus styles, keyboard behavior, tooltips/labels where needed, and correct landmarks.
>
> Remove the **Design System page** and **Settings page** from the product navigation and route map. Do not delete design tokens or shared design-system components; those are implementation foundations, not product pages. Do not leave dead links or broken routes. Keep Profile as the account destination. Do not add sidebar items that point to placeholder pages; show only implemented routes, adding later-phase destinations when their pages become functional.
>
> Do not rebuild the dashboard or other page content in this phase. Avoid unrelated refactors. Verify `/` against a baseline screenshot and keep it visually unchanged.

**Done when:** Shared shell/theme are consistent; Design System and Settings are no longer reachable through product navigation; landing page remains unchanged; no dead links are introduced.

---

## Phase 2 — Real data, GitHub connection, and removal of runtime demo data
**Purpose:** Make every later page honest about what RELAY knows and where data comes from.

### Antigravity prompt

> Inspect and implement only the shared data/integration layer needed by the product pages. Follow the global rules and Phase 0 audit. Do not redesign pages yet.
>
> Trace all runtime mock repositories, seeded counts, fake activity, static search results, hard-coded file trees, demo AI answers, sample onboarding progress, handoff previews, and fake profile metrics. Remove them from production/runtime flows. Do not remove test fixtures used only by unit/integration tests.
>
> Where a real API/provider integration already exists, use it through a typed service/query layer with explicit loading, success, empty, error, offline, permission, and stale-data behavior. Avoid putting data-fetching logic directly into display components. Keep query invalidation/sync behavior consistent. Do not expose GitHub tokens or secrets in browser code.
>
> Verify the real GitHub connect/repository selection flow. A button must not claim to connect/sync if it only opens a modal or changes local state. If required backend endpoints, OAuth configuration, indexing services, or API credentials are missing, do not fake the integration: document the precise missing prerequisite and provide an honest connection/setup/unavailable state. Do not invent endpoints or fabricate success. Ensure zero-data accounts/repositories render cleanly.
>
> Add or update tests for service states and ensure pages can render with genuinely empty responses. Avoid broad dependency additions unless necessary.

**Done when:** Production pages have no fake runtime content; real integrations are used only where verified; unavailable integrations explain what is missing; tests still use isolated fixtures as needed.

---

## Phase 3 — Dashboard
**Purpose:** Replace the blank dashboard with the dashboard shown in the board.

### Antigravity prompt

> Implement only the Dashboard page. Follow the global rules and reuse the Phase 1 shell and Phase 2 data layer. Use the design board's **03. Dashboard** panel as the visual reference.
>
> Layout:
> - Small copper uppercase eyebrow/section label.
> - Large serif greeting/title and one short supporting sentence.
> - Prominent copper **Connect Repository** action aligned to the right on wider screens.
> - One compact row of four metric cards for total projects, open issues, active pull requests, and CI failures (or only metrics that are genuinely supported by the backend). Values must be live-derived; never hard-code the numbers.
> - A Recent Projects section with compact repository rows/cards, owner/repository name, real status, real activity/update time, and useful direct navigation.
> - A proper empty state when there are no connected repositories, with a short explanation and a working Connect Repository action. Do not display a forest of zero metric cards if they add no value; follow the board's compact hierarchy and explain zero state clearly.
> - Include loading, error, offline, and partially available metric states.
>
> Keep the content background linen/light rather than the current large empty dark canvas; the sidebar remains dark and the copper accent should match the landing-page theme. Match the reference's spacing, alignment, restrained borders, typography, and content density. Avoid oversized cards and excessive empty space. Make it responsive and keyboard accessible.
>
> Only wire real interactions and real data. Do not add sample project cards when no project exists. Add focused component tests for populated and empty dashboard states.

**Done when:** A connected account has a useful, data-backed dashboard; a new account has a polished empty state; the design matches the board and scales to mobile.

---

## Phase 4 — Project Overview and repository activity tabs
**Purpose:** Give a connected repository a clear context/health page.

### Antigravity prompt

> Implement only Project Overview and its existing project-scoped overview tabs. Follow the global rules and use the design board's **04. Project Overview** panel.
>
> The page should include a clear back-to-projects link, repository avatar/icon, owner/repository name, short real description, external **View on GitHub** link, a real connection/indexing/health status, and an overflow menu with only working actions. Show repository facts such as commits, pull requests, issues, and releases only when returned by the real provider/API.
>
> Add a compact tab row for Overview, Issues, Pull Requests, Commits, and Files if these datasets/routes are supported. Each visible tab must navigate and show the correct real dataset, loading/empty/error states, and active tab state; do not create fake counts or generic placeholder content. Keep the Overview composition balanced: project health/documentation/activity panels where real data is available, and an informative setup state when it is not.
>
> Reuse shared cards, metrics, status pills, headings, and spacing from the design foundation. No new color system, no oversized hero, no demo activity. Check that clicking a project from the dashboard opens the correct project and that back navigation preserves a sensible context.
>
> Add tests for missing/invalid project IDs, loading, empty provider data, and populated real-data-shaped responses. Do not implement Repository Explorer itself in this phase.

**Done when:** Project identity and current state are clear, tabs work, all displayed facts are real, and empty/error states are useful.

---

## Phase 5 — Repository Explorer and code viewer
**Purpose:** Match the board's code-navigation workspace.

### Antigravity prompt

> Implement only Repository Explorer and its code/file viewer. Follow the global rules and use **05. Repository Explorer** as the visual reference.
>
> Build a three-part workspace at desktop sizes: project navigation, searchable/collapsible repository tree, and code viewer. On smaller screens, use a usable stacked/drawer layout instead of squeezing three unreadable columns together.
>
> Requirements:
> - Tree nodes expand/collapse with keyboard support and clear selected states.
> - Search/filter the real indexed file paths and directories; allow clearing the query.
> - Selecting a file loads its real content and identifies the path and language. Use safe, escaped rendering and syntax highlighting only if a supported highlighter already exists or can be added narrowly.
> - Handle initial indexing, excluded/binary/large files, no files, missing file content, permission errors, and network errors honestly.
> - Keep project context visible without overwhelming the code area. Use restrained dividers and readable code typography.
> - Do not generate a fake tree or display invented code when a repository has no indexed content.
>
> Tests must cover tree selection/keyboard interaction, empty search results, unavailable content, and loading/error states. Do not implement global Search in this phase.

**Done when:** Users can navigate real repository paths, view real content safely, and understand indexing or empty states.

---

## Phase 6 — Global Search
**Purpose:** Make Search compact, fast, and useful instead of a static results mock.

### Antigravity prompt

> Implement only global Search. Follow the global rules and use **06. Search** as the visual reference.
>
> Create a clear search header and a single prominent input for searching indexed code, files, issues, pull requests, commits, and docs where the real index/provider supports them. Add compact filter chips/tabs (All, Code, Issues, PRs, Commits, Docs) only for supported result types. Keep query and filters reflected in URL search parameters so reload/back/share behavior works.
>
> Results should have a clear type icon/label, title/path or repository, short real matching excerpt, useful timestamp when available, and a working destination. Highlight matched terms safely without rendering raw HTML. Include debounced requests only if appropriate for the existing data layer; cancel/ignore stale requests so old results do not replace new ones.
>
> Implement empty-before-search, no-results, loading, error, offline, and unsupported-index states. Do not display the sample authentication search results shown in the board as live data. A query must never return fabricated matches.
>
> Ensure keyboard navigation and accessible filter controls. Add tests for URL synchronization, filters, no results, safe excerpts, and stale responses. Do not implement Ask Relay in this phase.

**Done when:** Search is URL-addressable, results are genuine, filters and result destinations work, and empty/error states are clear.

---

## Phase 7 — Ask Relay / evidence-first codebase answers
**Purpose:** Deliver reliable answers with traceable evidence.

### Antigravity prompt

> Implement only Ask Relay. Follow the global rules and use **07. Ask Relay** as the visual reference.
>
> Build a calm conversation view with clear user and Relay messages, a composer anchored near the bottom of the conversation, and compact source/citation indicators. Use the existing streaming transport/backend if it is real and configured. Do not fake streaming by inserting a canned answer or by pretending a request completed. A pending/unsupported backend must show a precise state.
>
> Evidence rules:
> - Answers about the repository must be grounded in retrieved files/issues/PRs/commits returned by the real index/provider.
> - Citation markers must open a source drawer/panel with path/link and a relevant actual excerpt.
> - When there is insufficient evidence or indexing is incomplete, say so explicitly and suggest the next useful step instead of guessing.
> - Distinguish errors, rate limits, cancellation, and indexing in progress; provide retry only where it can work.
> - Handle new conversation/history only if persistence exists; otherwise don't imply conversations were saved.
>
> Support Enter to send, Shift+Enter for newline, stop/cancel, accessible streaming announcements that don't repeatedly interrupt screen readers, disabled/loading state, and sensible focus management. Avoid decorative chrome that competes with the answer. Do not seed conversations or canned responses in production.
>
> Add tests for evidence citation, insufficient evidence, streaming/cancel behavior, errors, and keyboard interaction.

**Done when:** Real answers cite real evidence, no-evidence scenarios are safe and helpful, and the conversation interface is accessible.

---

## Phase 8 — Onboarding
**Purpose:** Help a developer understand a connected repository, without generic demo steps.

### Antigravity prompt

> Implement only repository Onboarding. Follow the global rules and use **08. Onboarding** as the visual reference.
>
> Create a clean two-column layout at desktop widths: a step list/progress rail on the left and selected step details on the right. The step list should show completed/current/upcoming state clearly; selected-step state must remain correct and announced to assistive technology. Support keyboard step navigation without trapping focus.
>
> Steps, descriptions, entry points, file paths, flow order, and key files must come from actual repository analysis/onboarding service results. Do not hard-code the board's sample project or example paths. If onboarding generation is unavailable, provide a truthful unavailable/setup state rather than fabricated instructions.
>
> The detail panel should include the current step's explanation, evidence/source files, and a working previous/next/mark-complete flow where persistence exists. If progress cannot be persisted, don't display a false saved state. Show initial generation, regeneration, empty, partial, error, and completed states. Avoid huge progress banners and ensure the content is scannable.
>
> Add tests for step keyboard behavior, completion state, missing evidence, and loading/error cases. Do not implement Handoff in this phase.

**Done when:** Onboarding steps are real, navigable, keyboard accessible, and honest about missing analysis or unsaved progress.

---

## Phase 9 — Handoff Generator and version history
**Purpose:** Produce a useful, evidence-backed handoff for a real repository.

### Antigravity prompt

> Implement only Handoff Generator and its version/history actions. Follow the global rules and use **09. Handoff Generator** as the visual reference.
>
> Use a balanced two-column layout: generation/progress and included project context on the left; a readable handoff preview on the right. Keep headings, spacing, checklist rows, evidence links, and copper primary action consistent with the rest of RELAY.
>
> Generate the handoff only from available real repository information (such as README, files, issues, PRs, decisions, and onboarding output). Clearly identify sources and call out unknown/missing sections. Never fill absent information with invented project facts or sample repository content. Show genuine progress from the generation process if exposed by the service; otherwise use truthful loading feedback, not fake percentage/progress steps.
>
> Provide working preview/edit, copy/download Markdown, and version history/restore only where persistence/version APIs actually exist. Clipboard/download failures must be handled and reported. Restoring a prior version should require a clear accessible confirmation if it overwrites current content. Do not claim saved versions when they are local-only.
>
> Include generating, partial, empty, failure, and existing-version states. Add tests for Markdown export, evidence references, restore confirmation, and generation failure. Do not add sample handoffs to production data.

**Done when:** A handoff is traceable to real context, export works, and version history does not claim persistence that isn't available.

---

## Phase 10 — Sign In, Profile, and Not Found polish
**Purpose:** Finish the account-related screens shown in the board while keeping profile simple and removing unwanted Settings.

### Antigravity prompt

> Implement/polish only Sign In, Profile, and Not Found. Follow the global rules and use **02. Sign In**, **11. Profile**, and **12. 404 Not Found** as references. Keep the public Landing page unchanged.
>
> Sign In: centered, compact, light linen form; RELAY mark; serif/clean heading hierarchy; real GitHub OAuth or existing configured authentication flow; clear email/password only if supported by the real auth provider; accessible labels, show/hide password if relevant, validation, loading, error, and safe return-to-route behavior. Never show a successful sign-in when authentication did not succeed.
>
> Profile: clean, uncluttered page with avatar/initials, the user's real name and email when available, an Edit Profile action only if it saves to a real supported destination, and compact account-linked stats/activity only when real data exists. Remove fake metrics, sample activity, unnecessary cards, and visual clutter. Profile should feel lighter and simpler than the repository pages.
>
> Not Found: branded 404 composition, short explanation, useful Back/Home action, keyboard accessibility, and responsive layout. Keep unknown routes from rendering a blank screen.
>
> Ensure Design System and Settings remain removed from product navigation/routes as directed. Do not replace Settings with an unrequested new preferences page. Add tests for unauthenticated/failed auth, missing profile data, and unknown routes.

**Done when:** Sign In, Profile, and 404 match the board; profile data is real; no Settings/Design System product page remains; landing page is unchanged.

---

## Phase 11 — Cross-page UX, responsive, accessibility, and visual regression pass
**Purpose:** Ensure the entire product behaves and looks like a single polished experience.

### Antigravity prompt

> Perform a focused final QA/polish pass across the completed RELAY pages. Follow the global rules. Do not introduce new product features or redesign the frozen landing page.
>
> Verify at minimum: Landing, Sign In, Dashboard, Project Overview, Repository Explorer, Search, Ask Relay, Onboarding, Handoff, Profile, and Not Found. Settings and Design System should not be user-facing routes.
>
> Compare screenshots against the supplied design board at a consistent desktop viewport and at a narrow/mobile viewport. Check the overall composition: linen content canvas, charcoal nav, copper actions, typography hierarchy, line/border treatment, spacing, content density, alignment, page width, and consistency. Fix actual mismatches rather than applying arbitrary global CSS overrides.
>
> Check every navigation link and primary action; no dead controls, placeholder pages, demo content, fake metrics, sample repositories, canned AI results, or fabricated activity. Verify empty/loading/error/offline/permission/insufficient-evidence states and refresh/deep-link behavior. Check keyboard-only flows, visible focus, dialog focus restoration, screen-reader labels/announcements, contrast, zoom, and reduced motion. Fix issues in owned components only; note third-party/component-library limitations separately.
>
> Run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build`; report exact outcomes. Add or update focused regression tests where a bug was found. If browser screenshot tooling is available, capture screenshots and list the routes checked; if not, state that visual comparison remains manual. Do not claim Lighthouse, axe, Docker, or browser tests passed unless run.

**Done when:** All intended pages feel coherent, responsive, and accessible; no fake runtime data or dead routes remain; checks pass or every blocker is documented honestly.

---

## Recommended execution order and commit discipline

1. Review Phase 0 audit before authorizing code changes.
2. Make a safe Git checkpoint first. Because the repository previously experienced branch divergence/stash conflicts, inspect `git status`, branch, and remote state before starting; never discard a stash or use `reset --hard` to solve a UI task.
3. Run one implementation phase per Antigravity session. Review the diff and test report before starting the next phase.
4. Commit each completed phase separately, e.g. `chore: audit RELAY UI and data sources`, `feat: align app shell with RELAY design board`, `refactor: remove runtime demo data`, `feat: rebuild dashboard`, etc. Do not combine a failed phase with unrelated changes.
5. If a phase exposes a missing backend/API, pause and resolve/document that dependency rather than fabricating a working UI.
6. Treat design board screenshots as the truth for app page composition; preserve the actual public landing page as a frozen regression baseline.

## Final acceptance checklist

- [ ] Public landing page remains pixel-identical to baseline.
- [ ] App theme matches the board: linen canvas, charcoal navigation, copper actions, appropriate typography and restrained borders.
- [ ] Dashboard has real metrics/projects or a polished honest empty state.
- [ ] Project Overview, Repository Explorer, Search, Ask Relay, Onboarding, and Handoff use real data and truthful unsupported/empty states.
- [ ] Sign In, Profile, and 404 are polished; Profile is compact and uncluttered.
- [ ] Design System and Settings are not user-facing product pages/routes.
- [ ] No runtime mock/demo/seeded repositories, counts, activity, files, answers, or profile data remain.
- [ ] No dead controls, placeholder routes, or broken deep links.
- [ ] Keyboard and screen-reader flows are usable; contrast and focus indicators are checked.
- [ ] `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build` results are recorded accurately.
