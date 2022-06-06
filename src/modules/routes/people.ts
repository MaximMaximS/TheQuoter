import { FilterQuery, Types } from "mongoose";
import Person, { IPerson } from "../models/person";
import { Request, Response } from "express";
import { enforceRole, string, stringOrUndefined } from "../utils";

export async function getRoute(req: Request, res: Response) {
  const peopleFound = await search(
    stringOrUndefined(req.query.name),
    stringOrUndefined(req.query.type)
  );
  res.json({ people: peopleFound });
}

export async function postRoute(req: Request, res: Response) {
  const { _id } = await enforceRole(req.headers.authorization, "admin");
  const personCreated = await create(
    string(req.body.name, "name"),
    string(req.body.type, "type"),
    _id
  );
  res.status(201).json(personCreated);
}

export async function search(
  name: string | undefined,
  type: string | undefined
) {
  const query: FilterQuery<IPerson> = {};
  if (name !== undefined) {
    query["name"] = { $regex: name, $options: "i" };
  }
  if (type !== undefined) {
    query["type"] = { $regex: type, $options: "i" };
  }
  const people = await Person.find(query);
  return people.map((p) => p.reduce());
}

export async function create(name: string, type: string, user: Types.ObjectId) {
  const result = await Person.create({
    name: name,
    type: type,
    createdBy: user,
  });
  return result.reduce();
}
