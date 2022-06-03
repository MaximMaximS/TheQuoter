import { FilterQuery } from "mongoose";
import Class, { IClass } from "../models/class";
import { IUser } from "../models/user";
import { IncorrectLoginError, ValidatorError } from "../errors";

export async function search(name: unknown) {
  const query: FilterQuery<IClass> = {};
  if (typeof name === "string") {
    query["name"] = { $regex: name, $options: "i" };
  }
  const classes = await Class.find(query);
  return classes.map((c) => c.reduce());
}

export async function create(name: unknown, user: IUser | null) {
  if (user === null) {
    throw new IncorrectLoginError();
  }
  if (typeof name !== "string") {
    throw new ValidatorError("name", "required");
  }
  const result = await Class.create({
    name: name,
    createdBy: user._id,
  });
  return result.reduce();
}
