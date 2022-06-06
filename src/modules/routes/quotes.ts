import { FilterQuery, Types } from "mongoose";
import Quote, { IQuote, IReducedQuote } from "../models/quote";
import { Request, Response } from "express";
import {
  enforceRole,
  string,
  id,
  idOrUndefined,
  stringOrUndefined,
} from "../utils";

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

export async function postRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "user");
  const quoteCreated = await create(
    user._id,
    string(req.body.text, "text"),
    id(req.body.originator, "originator"),
    user.role !== "user" ? "approved" : "pending",
    idOrUndefined(req.body.class),
    stringOrUndefined(req.body.context),
    stringOrUndefined(req.body.note)
  );
  res.json({ quote: quoteCreated });
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

export async function create(
  user: Types.ObjectId,
  text: string,
  originator: Types.ObjectId,
  state: string,
  classId?: Types.ObjectId,
  context?: string,
  note?: string
) {
  const result = await Quote.create({
    context,
    text,
    note,
    originator,
    classId,
    state,
    createdBy: user,
  });
  return result.reduce();
}
