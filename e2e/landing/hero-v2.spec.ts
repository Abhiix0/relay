import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

const widths = [375, 414, 768, 1024, 1100, 1280, 1440, 1920];
const baseUrl = process.env["LOCAL_URL"] ?? "http://localhost:4173";
const SIGNOFF = path.resolve(import.meta.dirname, "../../baseline/signoff");

test.describe("Hero V2 diagram geometry", () => {
  for (const width of widths) {
    test(`keeps diagram elements clear and connectors attached at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.waitForTimeout(900);
      const stage = page.locator(".hero-diagram");
      await expect(stage).toBeVisible();

      const layout = await stage.evaluate(async (root) => {
        const selectors = [
          ".caption-a",
          ".caption-b",
          ".node-a",
          ".node-b",
          ".node-c",
          ".node-d",
          ".context-card",
        ];
        const elements = Object.fromEntries(
          selectors.map((selector) => {
            const element = root.querySelector<HTMLElement>(selector);
            if (!element) throw new Error(`Missing diagram element ${selector}`);
            const rect = element.getBoundingClientRect();
            return [selector, { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom }];
          }),
        );
        const mobile = matchMedia("(max-width: 640px)").matches;
        const svg = root.querySelector<SVGSVGElement>(
          mobile ? ".diagram-lines-mobile" : ".diagram-lines:not(.diagram-lines-mobile)",
        );
        if (!svg) throw new Error("Missing visible connector SVG");
        const paths = [...svg.querySelectorAll<SVGPathElement>("path")];
        const matrix = svg.getScreenCTM();
        if (!matrix) throw new Error("Visible connector SVG has no screen transform");
        const screenPoint = (path: SVGPathElement, end: boolean) => {
          const point = path.getPointAtLength(end ? path.getTotalLength() : 0);
          const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
          return { x: screen.x, y: screen.y };
        };
        const connectorPoints = [0, 1, 2].map((index) => screenPoint(paths[index]!, false));
        const nodeDEndpoint = screenPoint(paths[4]!, true);
        const tagFontSizes = [".node-a", ".node-b", ".node-c", ".node-d"].map(
          (selector) => Number.parseFloat(getComputedStyle(root.querySelector<HTMLElement>(selector)!).fontSize),
        );
        const edgeRects = [".node-a", ".node-b", ".node-c"].map((selector) => {
          const rect = root.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
          return { x: rect.right, y: rect.top + rect.height / 2 };
        });

        const card = root.querySelector<HTMLElement>(".context-card")!;
        const float = card.getAnimations().find((animation) =>
          animation.animationName === "float-card",
        );
        const cardExtremes = [];
        if (float) {
          float.pause();
          for (const time of [0, 3000]) {
            float.currentTime = time;
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const rect = card.getBoundingClientRect();
            cardExtremes.push({ x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom });
          }
          float.cancel();
        } else {
          const rect = card.getBoundingClientRect();
          cardExtremes.push({ x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom });
        }

        return {
          mobile,
          elements,
          cardExtremes,
          connectorPoints,
          nodeDEndpoint,
          tagFontSizes,
          edgeRects,
          stage: (() => {
            const rect = root.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })(),
        };
      });
      expect(layout.stage.width / layout.stage.height).toBeCloseTo(
        layout.mobile ? 360 / 440 : 720 / 410,
        2,
      );
      if (width === 1100) expect(Math.min(...layout.tagFontSizes)).toBeGreaterThanOrEqual(7.5);
      if (layout.mobile) expect(Math.min(...layout.tagFontSizes)).toBeGreaterThanOrEqual(9);

      const names = ["caption-a", "caption-b", "node-a", "node-b", "node-c", "node-d"];
      const boxes = names.map((name) => layout.elements[`.${name}`]) as Array<{
        x: number;
        y: number;
        right: number;
        bottom: number;
      }>;
      const clearBySix = (
        a: (typeof boxes)[number],
        b: (typeof boxes)[number],
      ) =>
        a.right + 6 <= b.x ||
        b.right + 6 <= a.x ||
        a.bottom + 6 <= b.y ||
        b.bottom + 6 <= a.y;
      await test.info().attach(`diagram-layout-${width}.json`, {
        body: JSON.stringify(layout, null, 2),
        contentType: "application/json",
      });
      for (let first = 0; first < boxes.length; first += 1) {
        for (let second = first + 1; second < boxes.length; second += 1) {
          expect(
            clearBySix(boxes[first]!, boxes[second]!),
            `${names[first]} and ${names[second]} need 6px clearance at ${width}px: ${JSON.stringify([boxes[first], boxes[second]])}`,
          ).toBe(true);
        }
        for (const [position, card] of layout.cardExtremes.entries()) {
          expect(
            clearBySix(boxes[first]!, card),
            `${names[first]} and context-card at float point ${position} need 6px clearance at ${width}px: ${JSON.stringify([boxes[first], card])}`,
          ).toBe(true);
        }
      }

      for (let index = 0; index < 3; index += 1) {
        expect(Math.abs(layout.connectorPoints[index]!.x - layout.edgeRects[index]!.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(layout.connectorPoints[index]!.y - layout.edgeRects[index]!.y)).toBeLessThanOrEqual(2);
      }
      const nodeD = layout.elements[".node-d"];
      expect(Math.abs(layout.nodeDEndpoint.x - (nodeD.x + nodeD.right) / 2)).toBeLessThanOrEqual(2);
      expect(Math.abs(layout.nodeDEndpoint.y - nodeD.y)).toBeLessThanOrEqual(2);
    });
  }
});

test("hero CTA and metrics fit the requested desktop viewports", async ({ page }) => {
  const measurements = [];
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator(".site-header").waitFor();
    const result = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const box = element.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, height: box.height };
      };
      return {
        header: rect(".site-header"),
        cta: rect(".hero-actions a"),
        metrics: rect(".hero-metrics"),
        viewportHeight: window.innerHeight,
      };
    });
    measurements.push({ ...viewport, ...result });
    expect(result.cta.top).toBeGreaterThanOrEqual(0);
    expect(result.cta.bottom).toBeLessThanOrEqual(viewport.height);
    if (viewport.height >= 880) {
      expect(result.metrics.bottom).toBeLessThanOrEqual(viewport.height);
    }
  }
  await test.info().attach("hero-v2-viewport-measurements.json", {
    body: JSON.stringify(measurements, null, 2),
    contentType: "application/json",
  });
  fs.writeFileSync(
    path.join(SIGNOFF, "hero-v2-viewport-measurements.json"),
    JSON.stringify(measurements, null, 2),
  );
});

test("hero motion keeps its established animation settings", async ({ browser }) => {
  const videoDirectory = test.info().outputPath("hero-motion-video");
  fs.mkdirSync(videoDirectory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
    recordVideo: { dir: videoDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  const sample = () => page.evaluate(() => {
    const animation = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const style = getComputedStyle(element);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
        delay: style.animationDelay,
        iteration: style.animationIterationCount,
        playState: style.animationPlayState,
      };
    };
    return {
      dash: animation(".diagram-lines:not(.diagram-lines-mobile) path"),
      pulse: animation(".live-dot"),
      float: animation(".context-card"),
      revealRight: animation(".hero-art"),
      dashOffset: getComputedStyle(document.querySelector<SVGPathElement>(
        ".diagram-lines:not(.diagram-lines-mobile) path",
      )!).strokeDashoffset,
      pulseShadow: getComputedStyle(document.querySelector<HTMLElement>(".live-dot")!).boxShadow,
      pulseTime: document.querySelector<HTMLElement>(".live-dot")!.getAnimations().find(
        (animation) => animation.animationName === "pulse",
      )?.currentTime,
      cardY: document.querySelector<HTMLElement>(".context-card")!.getBoundingClientRect().y,
      visiblePathAnimations: document.querySelector<SVGSVGElement>(".diagram-lines:not(.diagram-lines-mobile)")!
        .querySelector("path")!.getAnimations().length,
      hiddenPathAnimations: document.querySelector<SVGSVGElement>(".diagram-lines-mobile")!
        .querySelector("path")!.getAnimations().length,
    };
  });
  const before = await sample();
  const frames = [before];
  for (let index = 0; index < 30; index += 1) {
    await page.waitForTimeout(200);
    frames.push(await sample());
  }
  const actual = frames.at(-1)!;
  expect(actual.dash).toMatchObject({ name: "dash", duration: "18s", timing: "linear", iteration: "infinite" });
  expect(actual.pulse).toMatchObject({ name: "pulse", duration: "2.3s", timing: "ease-in-out", iteration: "infinite" });
  expect(actual.float).toMatchObject({ name: "float-card", duration: "6s", timing: "ease-in-out", iteration: "infinite" });
  expect(actual.revealRight).toMatchObject({ name: "reveal-up", duration: "0.7s", timing: "ease", delay: "0.12s", iteration: "1" });
  expect(new Set(frames.map((frame) => frame.dashOffset)).size).toBeGreaterThan(1);
  expect(new Set(frames.map((frame) => frame.pulseTime)).size).toBeGreaterThan(1);
  expect(new Set(frames.map((frame) => frame.cardY)).size).toBeGreaterThan(1);
  expect(actual.visiblePathAnimations).toBe(1);
  expect(actual.hiddenPathAnimations).toBe(0);
  const animationReport = {
      before: {
        dash: { name: "dash", duration: "18s", timing: "linear", delay: "0s", iteration: "infinite" },
        pulse: { name: "pulse", duration: "2.3s", timing: "ease-in-out", delay: "0s", iteration: "infinite" },
        float: { name: "float-card", duration: "6s", timing: "ease-in-out", delay: "0s", iteration: "infinite" },
        revealRight: { name: "reveal-up", duration: "0.7s", timing: "ease", delay: "0.12s", iteration: "1" },
      },
      after: actual,
      samples: frames.map(({ dashOffset, pulseShadow, cardY }) => ({ dashOffset, pulseShadow, cardY })),
  };
  const animationReportJson = JSON.stringify(animationReport, null, 2);
  await test.info().attach("hero-v2-animation-computed.json", {
    body: animationReportJson,
    contentType: "application/json",
  });
  const videoPath = await page.video()?.path();
  await context.close();
  if (videoPath) {
    await test.info().attach("hero-v2-six-second-motion.webm", {
      path: videoPath,
      contentType: "video/webm",
    });
    fs.copyFileSync(videoPath, path.join(SIGNOFF, "hero-v2-six-second-motion.webm"));
  }
  fs.writeFileSync(path.join(SIGNOFF, "hero-v2-animation-before-after.json"), animationReportJson);
});
