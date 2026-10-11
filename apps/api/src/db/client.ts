import { MongoClient, type Db } from "mongodb";

export interface DbHandle {
  client: MongoClient;
  db: Db;
}

export async function connect(uri: string): Promise<DbHandle> {
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db() };
}

export async function close(handle: DbHandle): Promise<void> {
  await handle.client.close();
}
