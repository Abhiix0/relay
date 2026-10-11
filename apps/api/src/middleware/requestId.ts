import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  const id = incoming && /^[\w.-]{1,128}$/.test(incoming) ? incoming : randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};
