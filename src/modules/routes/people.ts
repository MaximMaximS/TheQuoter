import { FilterQuery } from "mongoose";
import Person, { IPerson } from "../models/person";
import { IUser } from "../models/user";
import { ValidatorError } from "../errors";

export async function search(name: unknown, type: unknown) {
  const query: FilterQuery<IPerson> = {};
  if (typeof name === "string") {
    query["name"] = { $regex: name, $options: "i" };
  }
  if (typeof type === "string") {
    query["type"] = { $regex: type, $options: "i" };
  }
  const people = await Person.find(query);
  return people.map((p) => p.reduce());
}

export async function create(name: unknown, type: unknown, user: IUser) {
  if (typeof name !== "string") {
    throw new ValidatorError("name", "required");
  }
  if (typeof type !== "string") {
    throw new ValidatorError("type", "required");
  }
  const result = await Person.create({
    name: name,
    type: type,
    createdBy: user._id,
  });
  return result.reduce();
}
