# Relay Landing Contrast Audit (Phase L3)

**Date:** October 6, 2026  
**Scope:** `/` at 1440px and 375px, including the default view and each of the five feature selections.  
**Decision:** Colors were not changed; these failures are for the team lead to review.

Axe ran via Playwright and `@axe-core/playwright` at both required viewports. Each viewport scanned the default page and Context, AI Agent, Onboarding, Handoff, and Search selections. Axe found no non-color violations. It found 118 failing text nodes across the five scans at 1440px and 103 at 375px; the mobile mock hides project timestamps.

Each unique foreground/background pair was recalculated manually with the WCAG relative-luminance formula, `(Llighter + 0.05) / (Ldarker + 0.05)`. Manual ratios agree with axe within 0.02:1. All listed text is normal size and requires 4.5:1.

| Visible text and location | Foreground | Background | Manual ratio | Failing nodes (1440 / 375) |
|---|---|---|---:|---:|
| Header, hero, final CTA button labels (9-10px) | `#fbfaf5` | `#c6603e` | **3.91:1** | 15 / 15 |
| Hero diagram “View trail” (7px) | `#c6603e` | `#191b17` | **4.25:1** | 5 / 5 |
| Overview number, feature tab numbers, Context badge (9-10px) | `#c6603e` | `#f2f0e7` | **3.58:1** | 31 / 31 |
| Workflow step numbers (9px) | `#c6603e` | `#f5f4ec` | **3.70:1** | 15 / 15 |
| Dashboard mock date and mini labels (7px) | `#8a8c82` | `#ece9de` | **2.81:1** | 5 / 5 |
| Dashboard mock Healthy status labels (7px) | `#4f815d` | `#ece9de` | **3.73:1** | 10 / 10 |
| Dashboard mock project timestamps (7px) | `#86877e` | `#ece9de` | **2.99:1** | 15 / 0 |
| Dashboard mock Indexing status (7px) | `#8174ad` | `#ece9de` | **3.43:1** | 5 / 5 |
| Dashboard mock question prompt (9px) | `#87877d` | `#f4f2ea` | **3.23:1** | 5 / 5 |
| Footer meta (8px) | `#8a8a80` | `#f2f0e7` | **3.05:1** | 10 / 10 |
| AI Agent feature badge (9px) | `#4f815d` | `#f2f0e7` | **3.97:1** | 1 / 1 |
| Onboarding feature badge (9px) | `#ae7e17` | `#f2f0e7` | **3.17:1** | 1 / 1 |

The Handoff badge (`#456e82` on `#f2f0e7`, 4.83:1) and Search badge (`#5c5d54` on `#f2f0e7`, 5.84:1) pass. Other text/background pairs in the scanned page states passed axe.

Machine-readable findings, including selectors and axe-computed colors, are in [axe-desktop.json](../../baseline/a11y/axe-desktop.json) and [axe-mobile.json](../../baseline/a11y/axe-mobile.json).
