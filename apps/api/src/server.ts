import pino from "pino";
import { createApp } from "./app";
import { createGithubClient } from "./integrations/github";
import { createGroqClient } from "./integrations/llm";
import { createLocalEmbedder } from "./lib/embedder";
import { loadConfig } from "./config";
import { close, connect } from "./db/client";
import { ensureIndexes } from "./db/indexes";
import { createSyncRunner } from "./jobs/syncRunner";
import { run as runAnalysis } from "./services/analysisService";

const logger = pino({
  level: "info",
  redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
});

try {
  const config = loadConfig();
  const handle = await connect(config.MONGODB_URI);
  await ensureIndexes(handle.db);
  const github = createGithubClient();
  const llm = createGroqClient();
  const embedder = createLocalEmbedder();
  const syncRunner = createSyncRunner({
    db: handle.db,
    github,
    logger,
    embedder,
    afterSync: ({ projectId, signal }) => runAnalysis(handle.db, llm, projectId, signal, logger),
  });
  await syncRunner.recoverOrphans();
  const app = createApp({ db: handle.db, github, llm, syncRunner, logger, embedder });

  const server = app.listen(config.PORT, () => {
    logger.info(`api listening on :${config.PORT}`);
  });

  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => {
      logger.info(`${sig} received, shutting down`);
      void syncRunner.shutdown().finally(() => {
        server.close(() => {
          void close(handle).finally(() => process.exit(0));
        });
      });
    });
  }
} catch (err) {
  logger.fatal({ err }, "failed to start");
  process.exit(1);
}
