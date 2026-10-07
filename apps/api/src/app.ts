import express, { Router, type Express } from "express";
import helmet from "helmet";
import pino from "pino";
import { pinoHttp } from "pino-http";
import type { Db } from "mongodb";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { requestId } from "./middleware/requestId";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// github and llm integration interfaces arrive in later phases.
export interface AppDeps {
  db?: Db;
  github?: unknown;
  llm?: unknown;
}

export function createApp(_deps: AppDeps = {}): Express {
  const app = express();
  app.set("trust proxy", true);
  app.disable("x-powered-by");

  const logger = pino({
    level: process.env.NODE_ENV === "test" ? "silent" : "info",
    redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
  });

  app.use(requestId);
  app.use(pinoHttp({ logger, genReqId: (req) => (req as express.Request).id }));
  app.use(helmet());
  app.use(express.json());

  const router = Router();
  router.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  router.use(notFoundHandler);
  app.use("/api/v1", router);

  app.use(errorHandler);
  return app;
}
