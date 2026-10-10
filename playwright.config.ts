import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for visual baseline testing.
 *
 * Scripts:
 *   pnpm test:visual:baseline  — stamp golden PNGs from local build (run once)
 *   pnpm test:visual:capture   — capture current build into baseline/current/
 *   pnpm test:visual:diff      — pixelmatch golden vs current, fail if > 0.1%
 *   pnpm test:visual           — capture + diff (CI entry point)
 *
 * Stabilisation flags — keep CI and local renders byte-identical:
 *   --font-render-hinting=none          no subpixel font hints
 *   --disable-font-subpixel-positioning no fractional glyph advances
 *   --force-device-scale-factor=1       always 1× regardless of host DPI
 *
 * Strategy for CI font rendering:
 *   Golden PNGs are captured locally and committed to the repo.
 *   CI re-captures with the same Chromium build (pinned via @playwright/test@1.49.1)
 *   and the same font flags. If CI renders diverge (e.g. Linux vs Windows
 *   subpixel differences), the golden PNGs should be re-stamped inside a
 *   Docker container that matches CI (ubuntu-latest) so both share the same
 *   font stack. See e2e/landing/README.md for the update procedure.
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: "baseline/.playwright-results",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "baseline/.playwright-report" }],
  ],

  use: {
    reducedMotion: "reduce",
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-font-subpixel-positioning",
            "--force-device-scale-factor=1",
          ],
        },
      },
    },
  ],

  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
