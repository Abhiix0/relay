import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const baseUrl = process.env["LOCAL_URL"] ?? "http://localhost:4173";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
] as const;

for (const viewport of viewports) {
  test(`axe landing audit at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const states = ["context", "agent", "onboarding", "handoff", "search"];
    const contrastReport = [] as Array<{
      state: string;
      target: string[];
      html: string;
      checks: unknown[];
    }>;
    const otherIssues = [] as Array<{
      state: string;
      id: string;
      impact: string | null;
      help: string;
      nodes: Array<{ target: string[]; summary: string | undefined }>;
    }>;
    let contrastRuleCount = 0;

    for (const [index, state] of states.entries()) {
      if (index > 0) await page.locator(".feature-tab").nth(index).click();
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page }).analyze();
      const colorIssues = results.violations.filter(
        (violation) => violation.id === "color-contrast",
      );
      contrastRuleCount += colorIssues.length;
      contrastReport.push(
        ...colorIssues.flatMap((violation) =>
          violation.nodes.map((node) => ({
            state,
            target: node.target,
            html: node.html,
            checks: node.any.map((check) => check.data),
          })),
        ),
      );
      otherIssues.push(
        ...results.violations
          .filter((violation) => violation.id !== "color-contrast")
          .map(({ id, impact, help, nodes }) => ({
            state,
            id,
            impact,
            help,
            nodes: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
          })),
      );
    }
    fs.mkdirSync("baseline/a11y", { recursive: true });
    fs.writeFileSync(
      `baseline/a11y/axe-${viewport.name}.json`,
      JSON.stringify(contrastReport, null, 2),
    );

    console.log(
      JSON.stringify(
        {
          viewport: viewport.name,
          nonContrastViolations: otherIssues,
          colorContrastRuleOccurrences: contrastRuleCount,
          colorContrastNodesAcrossFeatureStates: contrastReport.length,
        },
        null,
        2,
      ),
    );

    expect(otherIssues, "Non-contrast axe violations").toEqual([]);
    console.log(`Contrast rule findings left for review: ${contrastRuleCount}`);
  });
}

test("skip link is visible on keyboard focus at desktop and mobile widths", async ({ page }) => {
  fs.mkdirSync("baseline/signoff", { recursive: true });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.screenshot({
      path: `baseline/signoff/keyboard-focus-${viewport.width}.png`,
    });
  }
});

test("mobile menu supports keyboard open, Escape, and link activation", async ({ page }) => {
  fs.mkdirSync("baseline/signoff", { recursive: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.keyboard.press("Tab"); // Skip link
  await page.keyboard.press("Tab"); // Logo
  await page.keyboard.press("Tab"); // Header CTA
  await page.keyboard.press("Tab"); // Menu button
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeFocused();

  await page.keyboard.press("Enter");
  const productLink = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Product" });
  await expect(productLink).toBeFocused();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await page.screenshot({ path: "baseline/signoff/mobile-menu-keyboard.png" });

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});

test("feature tabs support arrow-key navigation", async ({ page }) => {
  fs.mkdirSync("baseline/signoff", { recursive: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const agentTab = page.locator(".feature-tab").nth(1);
  await agentTab.scrollIntoViewIfNeeded();
  await agentTab.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(400);

  const onboardingTab = page.locator(".feature-tab").nth(2);
  await expect(onboardingTab).toBeFocused();
  await expect(onboardingTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "feature-tab-onboarding");
  await page.screenshot({ path: "baseline/signoff/feature-tab-keyboard-375.png" });
});
