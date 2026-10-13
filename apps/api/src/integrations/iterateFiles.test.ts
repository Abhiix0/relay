import { gzipSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import tar from "tar-stream";
import { createGithubClient, type GithubFile } from "./github";
import { gitBlobSha } from "../lib/gitSha";

async function tarball(entries: [string, Buffer][]): Promise<Buffer> {
  const pack = tar.pack();
  for (const [name, data] of entries) pack.entry({ name }, data);
  pack.finalize();
  const parts: Buffer[] = [];
  for await (const p of pack) parts.push(p as Buffer);
  return gzipSync(Buffer.concat(parts));
}

afterEach(() => vi.unstubAllGlobals());

describe("iterateFiles", () => {
  it("strips the prefix, skips non-allowed and oversize entries, flags NUL files, hashes like git", async () => {
    const gz = await tarball([
      ["acme-widget-abc/README.md", Buffer.from("hello\n")],
      ["acme-widget-abc/src/a.rs", Buffer.from("fn main() {}")],
      ["acme-widget-abc/other.txt", Buffer.from("not allowed")],
      ["acme-widget-abc/big.txt", Buffer.alloc(100, "x")],
      ["acme-widget-abc/bin.dat", Buffer.from([1, 0, 2])],
    ]);
    const calls: { url: string; auth: string | null }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, auth: new Headers(init.headers).get("authorization") });
      return url.startsWith("https://api.github.com")
        ? new Response(null, { status: 302, headers: { location: "https://codeload.github.com/x" } })
        : new Response(new Uint8Array(gz));
    });
    const out: GithubFile[] = [];
    const allowed = new Set(["README.md", "src/a.rs", "big.txt", "bin.dat"]);
    for await (const f of createGithubClient().iterateFiles("tok", "acme/widget", "main", { allowed, maxBytes: 50 })) out.push(f);
    expect(out.map((f) => f.path)).toEqual(["README.md", "src/a.rs", "bin.dat"]);
    expect(out[0]).toMatchObject({ content: "hello\n", sha: "ce013625030ba8dba906f756967f9e9ca394464a", isBinary: false, size: 6 });
    expect(out[2]).toMatchObject({ content: null, isBinary: true, sha: gitBlobSha(Buffer.from([1, 0, 2])) });
    expect(calls.map((c) => c.auth)).toEqual(["Bearer tok", null]); // token never reaches the redirect host
  });

  it("stops cleanly when the consumer breaks early or the signal aborts", async () => {
    const gz = await tarball([["p/a", Buffer.from("1")], ["p/b", Buffer.from("2")]]);
    vi.stubGlobal("fetch", async () => new Response(new Uint8Array(gz)));
    const opts = { allowed: new Set(["a", "b"]), maxBytes: 10 };
    for await (const f of createGithubClient().iterateFiles("t", "o/r", "main", opts)) {
      expect(f.path).toBe("a");
      break;
    }
    const ac = new AbortController();
    ac.abort();
    await expect(
      (async () => {
        for await (const _ of createGithubClient().iterateFiles("t", "o/r", "main", { ...opts, signal: ac.signal })) void _;
      })(),
    ).rejects.toThrow();
  });
});
