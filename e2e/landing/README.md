# Landing visual baseline

The visual harness captures the header navigation, hero container and copy
elements, diagram, ticker, every later section, and footer as separate crops at
1440px and 375px. This keeps layout changes in the hero from shifting the
captures of later sections.

| Directory | Purpose |
|---|---|
| `baseline/golden/` | Committed crop references |
| `baseline/current/` | Captures from the current build |
| `baseline/diff/` | Annotated pixel diffs |

## Capture and compare

```sh
pnpm build
pnpm preview
pnpm test:visual:capture
pnpm test:visual:diff
```

To intentionally approve a new design, capture the new references with
`pnpm test:visual:baseline`, inspect the hero before and after crops, and commit
the intended images from `baseline/golden/`.

The Playwright checks also measure the hero at eight viewport widths, verify
connector alignment and clearances, test CTA visibility, and record six seconds
of the diagram animations.

Visual tests use Chromium 1148 with font-rendering hints and device scale factor
flags pinned in `playwright.config.ts`. The per-crop threshold remains 0.1%.
