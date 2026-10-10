import type { RequestHandler } from "express";
import { loadConfig } from "../config";
import { AppError } from "../lib/errors";

/** CSRF defence in depth: a browser-sent Origin on a mutation must be our own front end. */
export const requireOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (
    origin !== undefined &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    origin !== new URL(loadConfig().PUBLIC_APP_URL).origin
  ) {
    throw new AppError(403, "forbidden_origin", "Origin not allowed");
  }
  next();
};
