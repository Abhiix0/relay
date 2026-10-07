import type { Db } from "mongodb";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { UserDoc } from "../db/collections";
import { unauthorized } from "../lib/errors";
import { getSessionUser } from "../services/authService";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

export function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function requireUser(db: Db): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const sid = readCookie(req, "relay_sid");
    const user = sid ? await getSessionUser(db, sid) : null;
    if (!user) throw unauthorized();
    req.user = user;
    next();
  };
}
