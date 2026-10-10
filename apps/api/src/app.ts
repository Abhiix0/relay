import express, { Router, type Express } from "express";
import helmet from "helmet";
import pino, { type Logger } from "pino";
import { pinoHttp } from "pino-http";
import type { Db } from "mongodb";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { loadConfig } from "./config";
import { perIpJsonLimit } from "./middleware/rateLimit";
import { requireOrigin } from "./middleware/requireOrigin";
import { requestId } from "./middleware/requestId";
import type { SyncRunner } from "./jobs/syncRunner";
import type { GithubClient } from "./integrations/github";
import { createGroqClient, type LlmClient } from "./integrations/llm";
import { askRouter } from "./routes/ask";
import { authRouter } from "./routes/auth";
import { decisionsRouter } from "./routes/decisions";
import { explorerRouter } from "./routes/explorer";
import { githubReposRouter } from "./routes/githubRepos";
import { handoffsRouter } from "./routes/handoffs";
import { onboardingRouter } from "./routes/onboarding";
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

export interface AppDeps {
  db: Db;
  github: GithubClient;
  llm?: LlmClient;
  syncRunner?: SyncRunner;
  logger?: Logger;
}

export function createApp(deps: AppDeps): Express {
  const app = express();
  app.set("trust proxy", loadConfig().TRUST_PROXY);
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
  router.use(perIpJsonLimit(300));
  router.use(requireOrigin);
  router.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  router.use(authRouter(deps.db, deps.github));
  router.use(githubReposRouter(deps.db, deps.github));
  router.use(projectsRouter(deps.db, deps.github, deps.syncRunner));
  router.use(syncRouter(deps.db, deps.syncRunner));
  router.use(explorerRouter(deps.db));
  router.use(searchRouter(deps.db));
  router.use(decisionsRouter(deps.db));
  router.use(onboardingRouter(deps.db));
  router.use(handoffsRouter(deps.db, deps.llm ?? createGroqClient()));
  router.use(askRouter(deps.db, deps.llm ?? createGroqClient()));
  router.use(notFoundHandler);
  app.use("/api/v1", router);

  app.use(errorHandler);
  return app;
}
