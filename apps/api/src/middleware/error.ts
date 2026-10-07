import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError, notFound } from "../lib/errors";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound("Not found"));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      message: err.message,
      code: err.code,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }
  if (err instanceof ZodError) {
    res
      .status(422)
      .json({ message: "Validation failed", code: "validation_error", details: err.issues });
    return;
  }
  const e = err as { status?: number; type?: string };
  if (e?.status === 400 && e.type?.startsWith("entity.")) {
    res.status(400).json({ message: "Invalid request body", code: "bad_request" });
    return;
  }
  // Log the error only, never bodies or cookies.
  req.log?.error({ err }, "unhandled error");
  res.status(500).json({ message: "Internal server error", code: "internal_error" });
};
