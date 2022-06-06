import { FilterQuery, Types } from "mongoose";
import Quote, { IQuote, IReducedQuote } from "../models/quote";
import { IUser } from "../models/user";
import { IncorrectLoginError, ValidatorError } from "../errors";
import { Request, Response } from "express";
import { enforceRole, idOrUndefined, stringOrUndefined } from "../utils";

export async function getRoute(req: Request, res: Response) {
  // Approved is fine, but if it's not, we need to check if the user is an admin
  let state = req.query.state;
  if (state !== "approved") {
    if (typeof state !== "string") {
      state = "approved";
    } else {
      await enforceRole(req.headers.authorization, "admin");
    }
  }

  const quotesFound = await search(
    idOrUndefined(stringOrUndefined(req.query.originator)),
    idOrUndefined(stringOrUndefined(req.query.class)),
    stringOrUndefined(req.query.text),
    state
  );

  res.json({ quotes: quotesFound }); // Send the found enteries
}

export async function search(
  originator: Types.ObjectId | undefined,
  classId: Types.ObjectId | undefined,
  text: string | undefined,
  state: string | undefined
): Promise<IReducedQuote[]> {
  const query: FilterQuery<IQuote> = {};
  if (originator !== undefined) {
    query["originator"] = originator;
  }
  if (classId !== undefined) {
    query["class"] = classId;
  }
  if (text !== undefined) {
    query["text"] = { $regex: text, $options: "i" };
  }
  if (state !== undefined) {
    query["state"] = state;
  }
  const quotes = await Quote.find(query);

  // Simplify all quotes
  return Promise.all(quotes.map((q) => q.reduce()));
}

// TODO Not Implemented
export async function create(name: unknown, user: IUser | null) {
  if (user === null) {
    throw new IncorrectLoginError();
  }
  if (typeof name !== "string") {
    throw new ValidatorError("name", "required");
  }
  const result = await Quote.create({
    name: name,
    createdBy: user._id,
  });
  return result.reduce();
}
