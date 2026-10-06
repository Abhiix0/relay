import { test } from "@playwright/test";
import path from "path";
import { captureVisuals } from "./capture-visuals";

const GOLDEN = path.resolve(import.meta.dirname, "../../baseline/golden");

test("capture landing element goldens", async ({ page }) => {
  await captureVisuals(page, GOLDEN);
});
