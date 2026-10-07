import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId, type Db } from "mongodb";
import { createApp, type AppDeps } from "../app";
import { close, connect, type DbHandle } from "../db/client";
import { getCollections, type UserDoc } from "../db/collections";
import { ensureIndexes } from "../db/indexes";
import { encrypt } from "../lib/crypto";
import { createSession } from "../services/authService";

let server: MongoMemoryServer | undefined;
let handle: DbHandle | undefined;

export async function startTestDb() {
  server = await MongoMemoryServer.create();
  handle = await connect(server.getUri("relay_test"));
  await ensureIndexes(handle.db);
  return handle.db;
}

export async function stopTestDb(): Promise<void> {
  if (handle) await close(handle);
  if (server) await server.stop();
  handle = undefined;
  server = undefined;
}

export function makeTestApp(deps: AppDeps) {
  return createApp(deps);
}

export async function loginAs(
  db: Db,
  overrides: Partial<UserDoc> = {},
): Promise<{ cookie: string; user: UserDoc }> {
  const id = new ObjectId();
  const now = new Date();
  const user: UserDoc = {
    _id: id,
    githubId: Math.floor(Math.random() * 1e9),
    githubLogin: `user-${id.toHexString().slice(-6)}`,
    email: `${id.toHexString()}@example.com`,
    name: "Test User",
    avatarUrl: null,
    encToken: encrypt("gho_test"),
    scope: "read:user",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  await getCollections(db).users.insertOne(user);
  const sid = await createSession(db, user._id);
  return { cookie: `relay_sid=${sid}`, user };
}
