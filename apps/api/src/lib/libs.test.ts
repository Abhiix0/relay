import { describe, expect, it } from "vitest";
import { chunk } from "./chunker";
import { decrypt, encrypt } from "./crypto";
import { detectLanguage } from "./language";
import { isExcludedPath, isLockfile } from "./secrets";

describe("crypto", () => {
  it("roundtrips", () => {
    const enc = encrypt("gho_token");
    expect(enc.data).not.toContain("gho_token");
    expect(decrypt(enc)).toBe("gho_token");
  });

  it("fails on tampered data or tag", () => {
    const enc = encrypt("gho_token");
    const flipped = Buffer.from(enc.data, "base64");
    flipped[0] = (flipped[0] ?? 0) ^ 1;
    expect(() => decrypt({ ...enc, data: flipped.toString("base64") })).toThrow();
    const tag = Buffer.from(enc.tag, "base64");
    tag[0] = (tag[0] ?? 0) ^ 1;
    expect(() => decrypt({ ...enc, tag: tag.toString("base64") })).toThrow();
  });
});

describe("chunker", () => {
  it("splits into 60-line chunks with correct 1-based startLine", () => {
    const text = Array.from({ length: 130 }, (_, i) => `line ${i + 1}`).join("\n");
    const chunks = chunk(text);
    expect(chunks.map((c) => c.startLine)).toEqual([1, 61, 121]);
    expect(chunks[1]?.text.split("\n")[0]).toBe("line 61");
    expect(chunks[2]?.text.split("\n")).toHaveLength(10);
  });

  it("returns nothing for empty text", () => {
    expect(chunk("")).toEqual([]);
  });
});

describe("secrets", () => {
  it("excludes secret files and vendor dirs", () => {
    for (const p of [".env", ".env.local", "a.pem", "k/server.key", "id_rsa", "x/my-secret.txt", "node_modules/x", "a/dist/b.js", "vendor/y.go"]) {
      expect(isExcludedPath(p), p).toBe(true);
    }
    for (const p of ["src/index.ts", "README.md", "package-lock.json"]) {
      expect(isExcludedPath(p), p).toBe(false);
    }
  });

  it("flags lockfiles as listed-but-not-chunked", () => {
    expect(isLockfile("package-lock.json")).toBe(true);
    expect(isLockfile("a/pnpm-lock.yaml")).toBe(true);
    expect(isLockfile("src/index.ts")).toBe(false);
  });
});

describe("language", () => {
  it("maps to lowercase slugs", () => {
    expect(detectLanguage("src/main.rs")).toBe("rust");
    expect(detectLanguage("a/b.tsx")).toBe("typescript");
    expect(detectLanguage("Cargo.toml")).toBe("toml");
    expect(detectLanguage("noext")).toBeNull();
  });
});
