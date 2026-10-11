import { afterEach, describe, expect, it, vi } from "vitest";
import { createTtlCache } from "./ttlCache";

afterEach(() => vi.useRealTimers());

describe("ttl cache", () => {
  it("expires entries after the ttl", () => {
    vi.useFakeTimers();
    const c = createTtlCache<number>(1000, 10);
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(c.get("a")).toBeUndefined();
  });

  it("never grows past max: sweeps expired entries first, then drops the oldest", () => {
    vi.useFakeTimers();
    const c = createTtlCache<number>(1000, 3);
    c.set("old1", 1);
    c.set("old2", 2);
    vi.advanceTimersByTime(1001);
    c.set("a", 3);
    c.set("b", 4);
    c.set("c", 5); // full: both expired entries are swept, nothing live is lost
    expect(c.size).toBe(3);
    c.set("d", 6); // all live: the oldest ("a") goes
    expect(c.size).toBe(3);
    expect([c.get("a"), c.get("b"), c.get("c"), c.get("d")]).toEqual([undefined, 4, 5, 6]);
  });

  it("re-setting a key refreshes it and keeps the size", () => {
    const c = createTtlCache<number>(1000, 2);
    c.set("a", 1);
    c.set("b", 2);
    c.set("a", 3);
    c.set("c", 4);
    expect([c.get("a"), c.get("b"), c.get("c")]).toEqual([3, undefined, 4]);
  });
});
