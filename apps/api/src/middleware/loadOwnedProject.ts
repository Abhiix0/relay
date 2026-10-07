import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getCollections, type ProjectDoc } from "../db/collections";
import { notFound } from "../lib/errors";
import { isObjectIdHex } from "../lib/ids";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      project?: ProjectDoc;
    }
  }
}

export function loadOwnedProject(db: Db): RequestHandler {
  const { projects } = getCollections(db);
  return async (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params.id;
    const project =
      typeof id === "string" && isObjectIdHex(id) && req.user
        ? await projects.findOne({ _id: new ObjectId(id), ownerId: req.user._id })
        : null;
    if (!project) throw notFound("Project not found");
    req.project = project;
    next();
  };
}
