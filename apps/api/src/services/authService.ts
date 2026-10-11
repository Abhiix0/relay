import { randomBytes } from "node:crypto";
import type { Db, ObjectId } from "mongodb";
import { getCollections, type UserDoc } from "../db/collections";
import { encrypt } from "../lib/crypto";
import type { GithubUser } from "../integrations/github";

export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export async function upsertUserFromGithub(
  db: Db,
  input: { profile: GithubUser; email: string | null; token: string; scope: string },
): Promise<UserDoc> {
  const { users } = getCollections(db);
  const { profile, email, token, scope } = input;
  const now = new Date();
  const user = await users.findOneAndUpdate(
    { githubId: profile.id },
    {
      $set: {
        githubLogin: profile.login,
        email: email ?? `${profile.login}@users.noreply.github.com`,
        name: profile.name?.trim() || profile.login,
        avatarUrl: profile.avatarUrl,
        encToken: encrypt(token),
        scope,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!user) throw new Error("user upsert failed");
  return user;
}

export async function createSession(db: Db, userId: ObjectId): Promise<string> {
  const id = randomBytes(32).toString("hex");
  const now = new Date();
  await getCollections(db).sessions.insertOne({
    _id: id,
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });
  return id;
}

export async function getSessionUser(db: Db, sid: string): Promise<UserDoc | null> {
  const { sessions, users } = getCollections(db);
  const session = await sessions.findOne({ _id: sid });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return users.findOne({ _id: session.userId });
}

export async function destroySession(db: Db, sid: string): Promise<void> {
  await getCollections(db).sessions.deleteOne({ _id: sid });
}
