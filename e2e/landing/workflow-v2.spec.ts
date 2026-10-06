import { expect, test, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const baseUrl = process.env["LOCAL_URL"] ?? "http://localhost:4173";
const signoff = path.resolve(import.meta.dirname, "../../baseline/signoff");

async function loadLanding(page: Page, width: number) {
  await page.setViewportSize({ width, height: width <= 640 ? 812 : 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

test.describe("How It Works V2", () => {
  for (const width of [768, 1024, 1280, 1440, 1920]) {
    test(`aligns card dividers and preserves the aside at ${width}px`, async ({ page }) => {
      await loadLanding(page, width);
      const section = page.locator("#workflow");
      await expect(section.locator(".section-number")).toHaveText("02");
      await expect(section.locator(".section-caption")).toHaveText("How it works");
      await expect(page.getByText("THREE MOVES", { exact: false })).toHaveCount(0);
      await expect(section.locator(".card-arrow")).toHaveCount(0);
      await expect(section.locator("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])")).toHaveCount(0);

      const dividerTops = await section.locator(".workflow-card-line").evaluateAll((lines) =>
        lines.map((line) => line.getBoundingClientRect().top),
      );
      if (width >= 1024) {
        expect(Math.max(...dividerTops) - Math.min(...dividerTops)).toBeLessThanOrEqual(0.5);
      }

      const asideStyles = await page.evaluate(() => {
        const pairs = [
          [".section-number", "fontSize", "letterSpacing", "color"],
          [".section-caption", "fontSize", "letterSpacing", "color", "writingMode"],
        ] as const;
        return pairs.flatMap(([selector, ...properties]) => {
          const overview = getComputedStyle(document.querySelector(`#product ${selector}`)!);
          const workflow = getComputedStyle(document.querySelector(`#workflow ${selector}`)!);
          return properties.map((property) => ({
            selector,
            property,
            overview: overview[property],
            workflow: workflow[property],
          }));
        });
      });
      for (const style of asideStyles) expect(style.workflow).toBe(style.overview);

      const ruleHeights = await page.evaluate(() => [
        document.querySelector("#product .vertical-rule")!.getBoundingClientRect().height,
        document.querySelector("#workflow .vertical-rule")!.getBoundingClientRect().height,
      ]);
      expect(ruleHeights[1]).toBe(ruleHeights[0]);
    });
  }

  test("captures section signoff and reports final dimensions", async ({ page }) => {
    const measurements = [];
    for (const [width, suffix] of [[1440, "1440"], [375, "375"]] as const) {
      await loadLanding(page, width);
      const section = page.locator("#workflow");
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await section.screenshot({
        path: path.join(signoff, `workflow-v2-after-${suffix}.png`),
        animations: "disabled",
      });
      measurements.push(await section.evaluate((element) => ({
        viewportWidth: window.innerWidth,
        sectionHeight: element.getBoundingClientRect().height,
        cardHeights: [...element.querySelectorAll<HTMLElement>(".workflow-card")].map(
          (card) => card.getBoundingClientRect().height,
        ),
        dividerTops: [...element.querySelectorAll<HTMLElement>(".workflow-card-line")].map(
          (line) => line.getBoundingClientRect().top,
        ),
        noteHeight: element.querySelector(".workflow-note")!.getBoundingClientRect().height,
      })));
    }
    fs.writeFileSync(
      path.join(signoff, "workflow-v2-measurements.json"),
      `${JSON.stringify(measurements, null, 2)}\n`,
    );
  });

  test("the header navigation still scrolls to the workflow section", async ({ page }) => {
    await loadLanding(page, 1440);
    await page.locator(".main-nav a[href='#workflow']").click();
    const sectionTop = await page.locator("#workflow").evaluate((element) =>
      element.getBoundingClientRect().top,
    );
    expect(Math.abs(sectionTop)).toBeLessThanOrEqual(2);
  });
});
