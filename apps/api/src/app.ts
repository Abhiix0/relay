import express, { Router, type Express } from "express";
import helmet from "helmet";
import pino, { type Logger } from "pino";
import { pinoHttp } from "pino-http";
import type { Db } from "mongodb";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { requestId } from "./middleware/requestId";
import type { SyncRunner } from "./jobs/syncRunner";
import type { GithubClient } from "./integrations/github";
import { authRouter } from "./routes/auth";
import { explorerRouter } from "./routes/explorer";
import { githubReposRouter } from "./routes/githubRepos";
import { projectsRouter } from "./routes/projects";
import { searchRouter } from "./routes/search";
import { syncRouter } from "./routes/sync";

/** Request path without the query string, so OAuth codes and states never reach the logs. */
export function stripQuery(url: string): string {
  const i = url.indexOf("?");
  return i === -1 ? url : url.slice(0, i);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// llm integration interface arrives in a later phase.
export interface AppDeps {
  db: Db;
  github: GithubClient;
  llm?: unknown;
  syncRunner?: SyncRunner;
  logger?: Logger;
}

export function createApp(deps: AppDeps): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  const logger =
    deps.logger ??
    pino({
      level: process.env.NODE_ENV === "test" ? "silent" : "info",
      redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
    });

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as express.Request).id,
      serializers: {
        req: (req: express.Request) => ({
          id: req.id,
          method: req.method,
          path: stripQuery(req.originalUrl ?? req.url),
        }),
      },
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));

  const router = Router();
  router.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  router.use(authRouter(deps.db, deps.github));
  router.use(githubReposRouter(deps.db, deps.github));
  router.use(projectsRouter(deps.db, deps.github, deps.syncRunner));
  router.use(syncRouter(deps.db, deps.syncRunner));
  router.use(explorerRouter(deps.db));
  router.use(searchRouter(deps.db));
  router.use(notFoundHandler);
  app.use("/api/v1", router);

  app.use(errorHandler);
  return app;
}
