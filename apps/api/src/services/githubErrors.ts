import type { Db, ObjectId } from "mongodb";
import { getCollections, type UserDoc } from "../db/collections";
import { GithubAccessError } from "../integrations/github";
import { decrypt } from "../lib/crypto";
import { AppError } from "../lib/errors";

export async function purgeSessions(db: Db, userId: ObjectId): Promise<void> {
  await getCollections(db).sessions.deleteMany({ userId });
}

async function revoked(db: Db, userId: ObjectId): Promise<AppError> {
  await purgeSessions(db, userId);
  return new AppError(401, "github_token_invalid", "GitHub access was revoked. Please sign in again.");
}

export async function mapGithubError(db: Db, userId: ObjectId, err: unknown): Promise<AppError> {
  if (err instanceof GithubAccessError) {
    if (err.kind === "revoked") return revoked(db, userId);
    if (err.kind === "rate_limited") {
      return new AppError(429, "github_rate_limited", "GitHub rate limit reached. Try again later.");
    }
    return new AppError(502, "upstream_error", "GitHub denied access to this repository");
  }
  return new AppError(502, "upstream_error", "GitHub request failed");
}

/** An undecryptable token is treated exactly like a revoked one. */
export async function decryptUserToken(db: Db, user: UserDoc): Promise<string> {
  try {
    if (!user.encToken) throw new Error("token revoked");
    return decrypt(user.encToken);
  } catch {
    throw await revoked(db, user._id);
  }
}
