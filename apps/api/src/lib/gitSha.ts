import { createHash } from "node:crypto";

/** Same digest as `git hash-object` for a blob. */
export const gitBlobSha = (buf: Buffer): string =>
  createHash("sha1").update(`blob ${buf.byteLength}\0`).update(buf).digest("hex");
