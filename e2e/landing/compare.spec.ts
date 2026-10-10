import { test } from "@playwright/test";
import path from "path";
import { captureVisuals } from "./capture-visuals";

const CURRENT = path.resolve(import.meta.dirname, "../../baseline/current");

test("capture landing element crops", async ({ page }) => {
  await captureVisuals(page, CURRENT);
});
