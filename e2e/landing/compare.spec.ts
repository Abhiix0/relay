/**
 * compare.spec.ts
 * Captures the current local build and writes screenshots to baseline/current/.
 * Used by `pnpm test:visual:compare` (after golden baseline exists).
 * The actual pixel diff is done by compare.ts (tsx e2e/landing/compare.ts).
 *
 * Requires the preview server:
 *   pnpm preview  →  http://localhost:4173
 */

import { test, type Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env["LOCAL_URL"] ?? "http://localhost:4173";
const OUT_DIR = path.resolve(__dirname, "../../baseline/current");

const BREAKPOINTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1024", width: 1024, height: 768 },
  { name: "768",  width: 768,  height: 1024 },
  { name: "375",  width: 375,  height: 812 },
] as const;

const SECTIONS = [
  { id: "top",      name: "hero" },
  { id: "product",  name: "overview" },
  { id: "workflow", name: "workflow" },
  { id: "features", name: "features" },
  { id: "demo",     name: "dashboard" },
  { id: "contact",  name: "cta" },
] as const;

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function stabilize(page: Page) {
  await page.evaluate(() =>
    (document as Document & { fonts: FontFaceSet }).fonts.ready
  );
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

for (const bp of BREAKPOINTS) {
  test(`current full-page @ ${bp.name}px`, async ({ page }) => {
    ensureDir(OUT_DIR);
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await stabilize(page);
    await page.screenshot({
      path: path.join(OUT_DIR, `full-${bp.name}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("current header-cta hover @ 1440px", async ({ page }) => {
  ensureDir(OUT_DIR);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await stabilize(page);
  const cta = page
    .locator("header a.button")
    .first()
    .or(page.locator("header a[href*='sign']").first());
  await cta.waitFor({ timeout: 10_000 }).catch(() => null);
  await cta.hover({ timeout: 10_000 }).catch(() => null);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, "header-cta-hover-1440.png"),
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 100 },
    animations: "disabled",
  });
});

test("current hero-buttons hover @ 1440px", async ({ page }) => {
  ensureDir(OUT_DIR);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await stabilize(page);
  const heroBtn = page
    .locator(".hero-actions a.button")
    .first()
    .or(page.locator(".hero-actions a").first());
  await heroBtn.waitFor({ timeout: 10_000 }).catch(() => null);
  await heroBtn.hover({ timeout: 10_000 }).catch(() => null);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, "hero-btn-hover-1440.png"),
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
    animations: "disabled",
  });
});

test("current mobile-menu open @ 375px", async ({ page }) => {
  ensureDir(OUT_DIR);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await stabilize(page);
  await page.locator("button.menu-button").click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, "mobile-menu-open-375.png"),
    fullPage: false,
    animations: "disabled",
  });
});

for (const section of SECTIONS) {
  test(`current section-${section.name} @ 1440px`, async ({ page }) => {
    ensureDir(OUT_DIR);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await stabilize(page);
    const el = page.locator(`#${section.id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await el.screenshot({
      path: path.join(OUT_DIR, `section-${section.name}-1440.png`),
      animations: "disabled",
    });
  });
}
