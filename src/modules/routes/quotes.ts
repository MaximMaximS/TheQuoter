import { Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import Quote, { IQuote, IReducedQuote } from "../models/quote";
import { ForbiddenError, NotFoundError, ValidatorError } from "../errors";
import {
  enforceRole,
  id,
  idOrUndefined,
  string,
  stringOrUndefined,
} from "../utils";

export async function getRoute(req: Request, res: Response) {
  const quoteFound = await Quote.findById(req.params.id);
  if (quoteFound === null) {
    throw new NotFoundError();
  }
  const reducedQuote = await quoteFound.reduce();
  res.json(reducedQuote);
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

export async function searchRoute(req: Request, res: Response) {
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

export async function createRoute(req: Request, res: Response) {
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
  res.status(user.role === "admin" ? 201 : 202).json({ _id: quoteCreated._id });
}

// TODO
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function editRoute(req: Request, res: Response) {
  const current = await Quote.findById(req.params.id);
  if (current === null) {
    throw new NotFoundError();
  }
  const newState = stringOrUndefined(req.body.state);
  if (
    newState !== undefined &&
    newState !== "public" &&
    newState !== "pending"
  ) {
    throw new ValidatorError("state", "invalid");
  }
  const user = await enforceRole(req.headers.authorization, "moderator");
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
    } else if (
      user.role !== "admin" &&
      !user.class.equals(current.class || "")
    ) {
      // User isn't creator, an admin, or a moderator from same class
      throw new ForbiddenError();
    }
  }

  // Edit the quote
  if (newState !== undefined) {
    current.state = newState;
  }

  const text = string(req.body.text, "text");
  if (current.text !== text) {
    current.text = text;
  }

  const originator = id(req.body.originator, "originator");
  if (current.originator !== originator) {
    current.originator = originator;
  }

  const context = stringOrUndefined(req.body.context);
  if (current.context !== context) {
    current.context = context;
  }

  const note = stringOrUndefined(req.body.note);
  if (current.note !== note) {
    current.note = note;
  }

  const classId = idOrUndefined(req.body.class);
  if (current.class !== classId) {
    current.class = classId;
  }

  await current.save();

  res.sendStatus(204);
}
