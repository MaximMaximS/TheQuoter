import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Person, { IPerson } from "../models/person";
import { NotFoundError } from "../errors";
import { enforceRole, string, stringOrUndefined } from "../utils";

export async function getRoute(req: Request, res: Response) {
  const personFound = await Person.findById(req.params.id).exec();
  if (personFound === null) {
    throw new NotFoundError();
  }
  res.json(personFound.reduce());
}

export async function searchRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query.name);
  const type = stringOrUndefined(req.query.type);

  const query: FilterQuery<IPerson> = {};
  if (name !== undefined) {
    query["name"] = { $regex: name, $options: "i" };
  }
  if (type !== undefined) {
    query["type"] = { $regex: type, $options: "i" };
  }
  const people = await Person.find({ ...query }).exec();
  res.json(people.map((p) => p.reduce()));
}

export async function createRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "admin");
  const { _id } = await Person.create({
    name: string(req.body.name, "name"),
    type: string(req.body.type, "type"),
    createdBy: user._id,
  });
  res.status(201).json({ _id });
}
