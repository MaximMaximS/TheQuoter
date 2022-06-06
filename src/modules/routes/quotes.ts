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
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidatorError,
} from "../errors";

export async function getRoute(req: Request, res: Response) {
  // Public is fine, but if it's not, we need to check if the user is an admin
  let state = req.query.state;
  if (state !== "public") {
    if (typeof state !== "string") {
      state = "public";
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
    user.role !== "admin" ? "pending" : "public",
    idOrUndefined(req.body.class),
    stringOrUndefined(req.body.context),
    stringOrUndefined(req.body.note)
  );
  res.json({ quote: quoteCreated });
}

export async function putRoute(req: Request, res: Response) {
  const id = req.params.id;
  const current = await Quote.findById(id);
  if (current === null) {
    throw new NotFoundError();
  }
  const newState = stringOrUndefined(req.body.state);
  const user = await enforceRole(req.headers.authorization, "user");
  if (current.state === "public") {
    // Quote is public, so only admins can change it

    // Throw error if user is not an admin
    if (user.role !== "admin") {
      throw new ForbiddenError();
    }
  } else if (current.state === "pending") {
    // Quote is pending, so admins, moderators from the same class, and the author can change it

    // If user is creator
    if (current.createdBy.equals(user._id)) {
      // User is creator, so they can't change the state
      if (newState !== undefined) {
        throw new ForbiddenError();
      }
    } else {
      // User is not the author

      // Check if user isn't a moderator of the class or an admin
      if (
        !(
          user.role === "admin" ||
          (user.role === "moderator" && user.class.equals(current.class))
        )
      ) {
        throw new ForbiddenError();
      }
    }
  }
  if (newState !== undefined) {
    if (newState !== "public" && newState !== "pending") {
      throw new ValidatorError("state", "invalid");
    }
    if (current.state === "public" && newState === "pending") {
      throw new ConflictError("state");
    }
  }

  // Edit the quote

  res.sendStatus(501);
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
    approvedBy: state === "public" ? user : undefined,
  });
  return result.reduce();
}
