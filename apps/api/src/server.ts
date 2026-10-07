import { createApp } from "./app";
import { createGithubClient } from "./integrations/github";
import { loadConfig } from "./config";
import { close, connect } from "./db/client";
import { ensureIndexes } from "./db/indexes";
import { createSyncRunner } from "./jobs/syncRunner";

const config = loadConfig();
const handle = await connect(config.MONGODB_URI);
await ensureIndexes(handle.db);
const github = createGithubClient();
const syncRunner = createSyncRunner({ db: handle.db, github });
await syncRunner.recoverOrphans();
const app = createApp({ db: handle.db, github, syncRunner });

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
