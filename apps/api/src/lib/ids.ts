import type { ObjectId } from "mongodb";

export const isObjectIdHex = (s: string): boolean => /^[0-9a-f]{24}$/i.test(s);

export const toId = (id: ObjectId): string => id.toHexString();
