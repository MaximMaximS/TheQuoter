import type { Request, Response } from "express";
import Person from "../models/person";
import { ForbiddenError, NotFoundError } from "../errors";
import { enforceUser, escapeRegExp, string, stringOrUndefined } from "../utils";

export async function getPersonRoute(req: Request, res: Response) {
  const personFound = await Person.findById(req.params["id"]).exec();
  if (personFound === null) {
    throw new NotFoundError();
  }
  res.json(personFound.prepare());
}

export async function searchPeopleRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query["name"], "name");
  const type = stringOrUndefined(req.query["type"], "type");

  let query = Person.find();
  if (name !== undefined) {
    query = query.regex("name", new RegExp(escapeRegExp(name), "i"));
  }
  if (type !== undefined) {
    query = query.regex("type", new RegExp(escapeRegExp(type), "i"));
  }
  const people = await query.exec();
  res.json(people.map((p) => p.prepare()));
}

export async function createPersonRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  const person = await Person.create({
    name: string(req.body.name, "name"),
    type: string(req.body.type, "type"),
    createdBy: user._id,
  });
  res.status(201).json(person.prepare());
}
