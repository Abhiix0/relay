import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

export async function enableMocking(): Promise<void> {
  // Start MSW worker in browser
  if (typeof window === "undefined") return;

  try {
    await worker.start({
      onUnhandledFrame: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  } catch {
    // MSW worker failed to start; app continues without mocking
  }
}
