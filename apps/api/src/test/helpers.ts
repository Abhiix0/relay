import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp, type AppDeps } from "../app";
import { close, connect, type DbHandle } from "../db/client";
import { ensureIndexes } from "../db/indexes";

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

export function makeTestApp(deps: AppDeps = {}) {
  return createApp(deps);
}
