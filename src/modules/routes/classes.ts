import type { Request, Response } from "express";
import Class from "../models/class";
import { ForbiddenError, NotFoundError } from "../errors";
import { enforceUser, escapeRegExp, string, stringOrUndefined } from "../utils";

export async function getClassRoute(req: Request, res: Response) {
  const classFound = await Class.findById(req.params["id"]).exec();
  if (classFound === null) {
    throw new NotFoundError();
  }
  res.json(classFound.prepare());
}

export async function searchClassesRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query["name"], "name");
  let query = Class.find();
  if (name !== undefined) {
    query = query.regex("name", new RegExp(escapeRegExp(name), "i"));
  }
  const classes = await query.exec();
  // Simplify all classes
  const classesFound = classes.map((c) => c.prepare());

  res.json(classesFound);
}

export async function createClassRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  const name = string(req.body.name, "name");
  const clas = await Class.create({
    name,
    createdBy: user._id,
  });
  res.status(201).json(clas.prepare());
}
