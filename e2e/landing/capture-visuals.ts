import type { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "../..");

async function prepare(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(process.env["LOCAL_URL"] ?? "http://localhost:4173", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const step = 400;
      let current = 0;
      const total = document.body.scrollHeight;
      const id = setInterval(() => {
        current = Math.min(current + step, total);
        window.scrollTo({ top: current, behavior: "instant" });
        if (current >= total) {
          clearInterval(id);
          resolve();
        }
      }, 40);
    });
  });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);
}

async function save(page: Page, directory: string, name: string, selector: string) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible" });
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await element.screenshot({ path: path.join(directory, `${name}.png`), animations: "disabled" });
}

export async function captureVisuals(page: Page, directory: string) {
  fs.mkdirSync(directory, { recursive: true });

  for (const [width, height, suffix] of [
    [1440, 900, "1440"],
    [375, 812, "375"],
  ] as const) {
    await prepare(page, width, height);
    await save(page, directory, `nav-${suffix}`, ".site-header");
    await save(page, directory, `hero-container-${suffix}`, ".hero-section");
    for (const [name, selector] of [
      ["kicker", ".hero-copy .kicker"],
      ["h1", ".hero-copy h1"],
      ["lede", ".hero-copy .hero-lede"],
      ["actions", ".hero-copy .hero-actions"],
      ["metrics", ".hero-copy .hero-metrics"],
    ] as const) {
      await save(page, directory, `hero-copy-${name}-${suffix}`, selector);
    }
    await save(page, directory, `hero-diagram-${suffix}`, ".hero-diagram");
    await save(page, directory, `ticker-${suffix}`, ".ticker-band");

    for (const [name, selector] of [
      ["overview", "#product"],
      ["workflow", "#workflow"],
      ["features", "#features"],
      ["dashboard", "#demo"],
      ["cta", "#contact"],
      ["footer", ".site-footer"],
    ] as const) {
      await save(page, directory, `section-${name}-${suffix}`, selector);
    }

    if (width <= 640) {
      await page.locator("button.menu-button").click();
      await save(page, directory, "nav-menu-open-375", "#primary-navigation");
    }
  }
}
