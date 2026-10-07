import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { loadConfig } from "../config";
import type { EncToken } from "../db/collections";

const keyBuf = (keyB64?: string) =>
  Buffer.from(keyB64 ?? loadConfig().TOKEN_ENCRYPTION_KEY, "base64");

export function encrypt(plain: string, keyB64?: string): EncToken {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuf(keyB64), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}

export function decrypt(enc: EncToken, keyB64?: string): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyBuf(keyB64),
    Buffer.from(enc.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(enc.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(enc.data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
