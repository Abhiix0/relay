import type { RequestHandler } from "express";
import { AppError } from "../lib/errors";

/** CSRF guard: state-changing requests must declare a JSON content type. */
export const requireJson: RequestHandler = (req, _res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    throw new AppError(415, "unsupported_media_type", "Content-Type must be application/json");
  }
  next();
};
