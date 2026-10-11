import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("EMBEDDINGS_ENABLED", () => {
  it("defaults to true", () => {
    expect(loadConfig({ NODE_ENV: "test" }).EMBEDDINGS_ENABLED).toBe(true);
  });

  it('parses "false"', () => {
    expect(loadConfig({ NODE_ENV: "test", EMBEDDINGS_ENABLED: "false" }).EMBEDDINGS_ENABLED).toBe(false);
  });
});
