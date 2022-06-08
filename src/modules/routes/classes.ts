import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Class, { IClass } from "../models/class";
import { IUser } from "../models/user";
import { NotFoundError } from "../errors";
import { enforceRole, string, stringOrUndefined } from "../utils";

export async function getRoute(req: Request, res: Response) {
  const classFound = await Class.findById(req.params.id);
  if (classFound === null) {
    throw new NotFoundError();
  }
  res.json({ class: classFound.reduce() });
}

export async function searchRoute(req: Request, res: Response) {
  const classesFound = await search(stringOrUndefined(req.query.name));
  res.json({ classes: classesFound });
}

export async function createRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "admin");
  const classCreated = await create(string(req.body.name, "name"), user);
  res.status(201).json({ _id: classCreated._id });
}

export async function search(name: string | undefined) {
  const query: FilterQuery<IClass> = {};
  if (name !== undefined) {
    query["name"] = { $regex: name, $options: "i" };
  }
  const classes = await Class.find(query);
  // Simplify all classes
  return classes.map((c) => c.reduce());
}

export async function create(name: string, user: IUser) {
  const result = await Class.create({
    name: name,
    createdBy: user._id,
  });
  return result.reduce();
}
