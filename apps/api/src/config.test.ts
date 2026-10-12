import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("sync memory settings", () => {
  const cases: [string, unknown, string, unknown, string][] = [
    ["SYNC_FILE_BATCH", 25, "40", 40, "0"],
    ["EMBED_BATCH", 8, "16", 16, "0"],
    ["SYNC_MAX_CONCURRENT", 1, "2", 2, "0"],
    ["SYNC_MAX_FILES", 2000, "1000", 1000, "abc"],
    ["SYNC_MAX_FILE_BYTES", 262144, "1024", 1024, "-1"],
    ["SYNC_RSS_LIMIT_MB", 0, "420", 420, "-5"],
    ["LOG_MEMORY", false, "true", true, "yes"],
  ];
  it.each(cases)("%s: default, override, invalid", (key, dflt, raw, parsed, bad) => {
    const get = (v?: string) => (loadConfig({ NODE_ENV: "test", ...(v === undefined ? {} : { [key]: v }) }) as Record<string, unknown>)[key];
    expect(get()).toBe(dflt);
    expect(get(raw)).toBe(parsed);
    expect(() => get(bad)).toThrow(/Invalid environment configuration/);
  });
});

describe("EMBEDDINGS_ENABLED", () => {
  it("defaults to true", () => {
    expect(loadConfig({ NODE_ENV: "test" }).EMBEDDINGS_ENABLED).toBe(true);
  });

  it('parses "false"', () => {
    expect(loadConfig({ NODE_ENV: "test", EMBEDDINGS_ENABLED: "false" }).EMBEDDINGS_ENABLED).toBe(false);
  });
});
