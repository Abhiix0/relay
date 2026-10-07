import pino from "pino";
import { createApp } from "./app";
import { createGithubClient } from "./integrations/github";
import { loadConfig } from "./config";
import { close, connect } from "./db/client";
import { ensureIndexes } from "./db/indexes";
import { createSyncRunner } from "./jobs/syncRunner";

const logger = pino({
  level: "info",
  redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
});

try {
  const config = loadConfig();
  const handle = await connect(config.MONGODB_URI);
  await ensureIndexes(handle.db);
  const github = createGithubClient();
  const syncRunner = createSyncRunner({ db: handle.db, github, logger });
  await syncRunner.recoverOrphans();
  const app = createApp({ db: handle.db, github, syncRunner, logger });

  const server = app.listen(config.PORT, () => {
    logger.info(`api listening on :${config.PORT}`);
  });

  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => {
      logger.info(`${sig} received, shutting down`);
      server.close(() => {
        void close(handle).finally(() => process.exit(0));
      });
    });
  }
} catch (err) {
  logger.fatal({ err }, "failed to start");
  process.exit(1);
}
