/**
 * Tiny structured logger — the only place in the codebase that calls console.*.
 * Import from here instead of using console directly.
 */

const isDev = import.meta.env.DEV;

/** Tracks which messages have already been emitted in prod (dedup). */
const emitted = new Set<string>();

export const log = {
  warn(msg: string, ...args: unknown[]): void {
    if (isDev) {
      console.warn(`[relay:warn] ${msg}`, ...args);
    }
  },

  error(msg: string, ...args: unknown[]): void {
    if (isDev) {
      console.error(`[relay:error] ${msg}`, ...args);
    } else {
      // Prod: emit once per unique message to avoid log floods
      if (!emitted.has(msg)) {
        emitted.add(msg);
        console.error(`[relay:error] ${msg}`);
      }
    }
  },
};
