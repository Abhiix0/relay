import { MongoBinary } from "mongodb-memory-server";

// Download mongod once before workers start; parallel test files otherwise race on the same .downloading temp file.
export default async function setup() {
  await MongoBinary.getPath();
}
