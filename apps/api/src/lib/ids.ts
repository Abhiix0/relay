import { createHash } from "node:crypto";
import type { ObjectId } from "mongodb";

export const isObjectIdHex = (s: string): boolean => /^[0-9a-f]{24}$/i.test(s);

export const toId = (id: ObjectId): string => id.toHexString();

export const artifactKey = (projectId: ObjectId, externalId: string): string =>
  createHash("sha256").update(`${projectId.toHexString()}:${externalId}`).digest("hex").slice(0, 24);
