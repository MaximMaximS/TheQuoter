import type { Request, Response } from "express";
import Class from "../models/class";
import { NotFoundError } from "../errors";
import { enforcePermit, string, stringOrUndefined } from "../utils";

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
    query = query.where("name").regex(name, "i");
  }
  const classes = await query.exec();
  // Simplify all classes
  const classesFound = classes.map((c) => c.prepare());

  res.json(classesFound);
}

export async function createClassRoute(req: Request, res: Response) {
  const user = await enforcePermit(req.headers.authorization, "admin");
  const name = string(req.body.name, "name");
  const { _id } = await Class.create({
    name,
    createdBy: user._id,
  });
  res.status(201).json({ _id });
}
