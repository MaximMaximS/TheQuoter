import { Request, Response } from "express";
import Person from "../models/person";
import { NotFoundError } from "../errors";
import { enforcePermit, string, stringOrUndefined } from "../utils";

export async function getPersonRoute(req: Request, res: Response) {
  const personFound = await Person.findById(req.params.id).exec();
  if (personFound === null) {
    throw new NotFoundError();
  }
  res.json(personFound.reduce());
}

export async function searchPeopleRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query.name, "name");
  const type = stringOrUndefined(req.query.type, "type");

  let query = Person.find();
  if (name !== undefined) {
    query = query.where("name").regex(name, "i");
  }
  if (type !== undefined) {
    query = query.where("type").regex(type, "i");
  }
  const people = await query.exec();
  res.json(people.map((p) => p.reduce()));
}

export async function createPersonRoute(req: Request, res: Response) {
  const user = await enforcePermit(req.headers.authorization, "admin");
  const { _id } = await Person.create({
    name: string(req.body.name, "name"),
    type: string(req.body.type, "type"),
    createdBy: user._id,
  });
  res.status(201).json({ _id });
}
