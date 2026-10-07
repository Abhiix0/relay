import { createApp } from "./app";
import { loadConfig } from "./config";
import { close, connect } from "./db/client";
import { ensureIndexes } from "./db/indexes";

const config = loadConfig();
const handle = await connect(config.MONGODB_URI);
await ensureIndexes(handle.db);
const app = createApp({ db: handle.db });

const server = app.listen(config.PORT, () => {
  console.log(`api listening on :${config.PORT}`);
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    server.close(() => {
      void close(handle).finally(() => process.exit(0));
    });
  });
}
