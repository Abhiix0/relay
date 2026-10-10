import { expect, test } from "@playwright/test";

const baseUrl = process.env["LOCAL_URL"] ?? "http://localhost:4173";

// Generate projects fixture with plenty of content to ensure vertical scrollability
const mockProjectsFixture = Array.from({ length: 12 }, (_, i) => ({
  id: `proj-${i + 1}`,
  name: `project-${i + 1}`,
  fullName: `relay-org/project-${i + 1}`,
  description: `Automated test fixture repository ${i + 1} with extensive metadata for scroll verification.`,
  language: i % 2 === 0 ? "TypeScript" : "Rust",
  branch: "main",
  syncStatus: "succeeded",
  healthLabel: "Synced",
  lastIndexedAt: "2026-10-10T10:00:00Z",
  fileCount: 420 + i * 10,
  symbolCount: 12500 + i * 100,
  chunkCount: 3400 + i * 50,
}));

const mockUserFixture = {
  id: "usr-test",
  name: "Test Developer",
  email: "dev@relay.test",
  githubLogin: "testdev",
  avatarUrl: null,
};

test.describe("AppShell viewport and internal scrolling layout", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls using test-only route fixtures
    await page.route("**/api/v1/projects**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjectsFixture),
      });
    });

    await page.route("**/api/v1/user**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUserFixture),
      });
    });
  });

  test("desktop 1440x900: keeps shell within viewport, scrolls content pane, keeps header/sidebar stationary", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });

    // Wait for content scroll container and sidebar to be visible
    const scrollPane = page.locator('[data-testid="app-content-scroll"]');
    await expect(scrollPane).toBeVisible();

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    const header = page.locator("header");
    await expect(header).toBeVisible();

    // 1. Document scrollHeight must not exceed viewport height (tolerance <= 2px for subpixel rounding)
    const docDimensions = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      bodyScrollHeight: document.body.scrollHeight,
      innerHeight: window.innerHeight,
    }));

    expect(docDimensions.scrollHeight).toBeLessThanOrEqual(902);
    expect(docDimensions.bodyScrollHeight).toBeLessThanOrEqual(902);

    // Record initial positions of header and desktop sidebar
    const headerInitialBox = await header.boundingBox();
    const sidebarInitialBox = await sidebar.boundingBox();
    expect(headerInitialBox).not.toBeNull();
    expect(sidebarInitialBox).not.toBeNull();

    // 2. Central app content pane has scrollable overflow
    const scrollPaneStateBefore = await scrollPane.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollTop: el.scrollTop,
    }));

    expect(scrollPaneStateBefore.scrollHeight).toBeGreaterThan(scrollPaneStateBefore.clientHeight);

    // Scroll central content pane down
    await scrollPane.evaluate((el) => {
      el.scrollTop = 400;
    });

    const scrollTopAfter = await scrollPane.evaluate((el) => el.scrollTop);
    expect(scrollTopAfter).toBeGreaterThan(0);

    // Document scroll position should remain 0 (document does not scroll)
    const windowScrollY = await page.evaluate(() => window.scrollY);
    expect(windowScrollY).toBe(0);

    // 3. Header and desktop sidebar remain stationary in viewport
    const headerAfterBox = await header.boundingBox();
    const sidebarAfterBox = await sidebar.boundingBox();

    expect(headerAfterBox?.y).toBeCloseTo(headerInitialBox!.y, 1);
    expect(headerAfterBox?.x).toBeCloseTo(headerInitialBox!.x, 1);
    expect(sidebarAfterBox?.y).toBeCloseTo(sidebarInitialBox!.y, 1);
    expect(sidebarAfterBox?.x).toBeCloseTo(sidebarInitialBox!.x, 1);
  });

  test("mobile 375x812: no horizontal document overflow, central content pane scrolls, chrome stays stable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });

    const scrollPane = page.locator('[data-testid="app-content-scroll"]');
    await expect(scrollPane).toBeVisible();

    // 4. Mobile assertions
    const mobileMetrics = await page.evaluate(() => ({
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      docScrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    }));

    // No horizontal document overflow
    expect(mobileMetrics.docScrollWidth).toBeLessThanOrEqual(376);
    // Vertical document height bounded to viewport height
    expect(mobileMetrics.docScrollHeight).toBeLessThanOrEqual(814);

    // Content pane remains scrollable
    const contentMetrics = await scrollPane.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(contentMetrics.scrollHeight).toBeGreaterThan(contentMetrics.clientHeight);

    // Header position remains stationary
    const header = page.locator("header");
    const headerInitialBox = await header.boundingBox();

    await scrollPane.evaluate((el) => {
      el.scrollTop = 350;
    });

    const headerAfterBox = await header.boundingBox();
    expect(headerAfterBox?.y).toBeCloseTo(headerInitialBox!.y, 1);

    // Window scroll Y remains 0
    const windowScrollY = await page.evaluate(() => window.scrollY);
    expect(windowScrollY).toBe(0);
  });
});
