# Landing visual baseline

## How it works

| Directory | Purpose |
|---|---|
| `baseline/golden/` | Committed golden PNGs — the frozen reference |
| `baseline/current/` | Freshly captured PNGs — generated on each run, not committed |
| `baseline/diff/` | Annotated diff images — generated on each run, not committed |

## Workflow

### First time / intentional design change

```sh
# 1. Build and preview the local app
pnpm build && pnpm preview

# 2. In another terminal, stamp the new golden baseline
pnpm test:visual:baseline

# 3. Commit baseline/golden/*.png
git add baseline/golden && git commit -m "chore: update visual baseline"
```

### Normal dev flow (verify nothing changed)

```sh
pnpm build && pnpm preview &
pnpm test:visual        # capture + diff
```

### CI

CI runs `pnpm test:visual` inside the `visual` job. The preview server is
started as a background step. The `baseline/golden/` PNGs are already
committed so no capture step is needed.

## Font rendering across OS

Golden PNGs are captured with Chromium build **1148** (Playwright 1.49.1) and
three stabilisation flags:

```
--font-render-hinting=none
--disable-font-subpixel-positioning
--force-device-scale-factor=1
```

If CI (ubuntu-latest) diverges from a local Windows capture, re-stamp the
golden baseline from inside the CI environment:

```sh
# Run the baseline capture job directly in CI once, download the artifacts,
# and commit them as the new golden set.
```

The threshold is **0.1%** of pixels per image. This absorbs trivial
anti-aliasing differences while catching any real layout or style change.
