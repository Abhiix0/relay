/**
 * MSW browser worker.
 *
 * Loaded only when VITE_USE_MOCKS=true (the default for local dev).
 * Do NOT import this file directly from application code — use the
 * dynamic-import path in main.tsx so MSW stays out of the production bundle.
 */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers/index";

export const worker = setupWorker(...handlers);

export async function enableMocking(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await worker.start({
      onUnhandledFrame: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  } catch {
    // Worker failed to register — app continues without mocking
  }
}
