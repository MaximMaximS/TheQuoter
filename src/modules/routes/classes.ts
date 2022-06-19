import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Class, { IClass } from "../models/class";
import { NotFoundError } from "../errors";
import { enforceRole, string, stringOrUndefined } from "../utils";

export async function getRoute(req: Request, res: Response) {
  const classFound = await Class.findById(req.params.id).exec();
  if (classFound === null) {
    throw new NotFoundError();
  }
  res.json(classFound.reduce());
}

export async function searchRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query.name);
  const query: FilterQuery<IClass> = {};
  if (name !== undefined) {
    query.name = { $regex: name, $options: "i" };
  }
  const classes = await Class.find({ ...query }).exec();
  // Simplify all classes
  const classesFound = classes.map((c) => c.reduce());

  res.json(classesFound);
}

export async function createRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "admin");
  const name = string(req.body.name, "name");
  const { _id } = await Class.create({
    name,
    createdBy: user._id,
  });
  res.status(201).json({ _id });
}
