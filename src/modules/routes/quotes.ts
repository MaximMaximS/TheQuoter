import { Request, Response } from "express";
import { Types } from "mongoose";
import Quote, { IReducedQuote, QuoteType } from "../models/quote";
import { UserType } from "../models/user";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidatorError,
} from "../errors";
import {
  enforceRole,
  id,
  idOrUndefined,
  string,
  stringOrUndefined,
} from "../utils";

export async function getRoute(req: Request, res: Response) {
  const quoteFound = await Quote.findById(req.params.id).exec();
  if (quoteFound === null) {
    throw new NotFoundError();
  }
  const reducedQuote = await quoteFound.reduce();
  res.json(reducedQuote);
}

async function search(
  originator: Types.ObjectId | undefined,
  classId: Types.ObjectId | undefined,
  text: string | undefined,
  state: "pending" | "public" | undefined
): Promise<IReducedQuote[]> {
  let query = Quote.find();
  if (originator !== undefined) {
    query = query.where("originator").equals(originator);
  }
  if (classId !== undefined) {
    query = query.where("class").equals(classId);
  }
  if (text !== undefined) {
    query = query.where("text").regex(text, "i");
  }
  if (state !== undefined) {
    query = query.where("state").equals(state);
  }
  const quotes = await query.exec();

  // Simplify all quotes
  return Promise.all(quotes.map((q) => q.reduce()));
}

async function resolveState(req: Request) {
  const state = req.query.state;
  if (state === undefined) {
    return;
  }
  if (state === "pending") {
    await enforceRole(req.headers.authorization, "admin");
    return "pending";
  }
  if (typeof state !== "string" || state !== "public") {
    throw new ValidatorError("state", "state");
  }
  return "public";
}

export async function searchRoute(req: Request, res: Response) {
  // Public is fine, but if it's not, we need to check if the user is an admin
  const state = await resolveState(req);

  const quotesFound = await search(
    idOrUndefined(req.query.originator, "originator"),
    idOrUndefined(req.query.class, "class"),
    stringOrUndefined(req.query.text),
    state
  );

  res.json(quotesFound); // Send the found enteries
}

export async function createRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "user");
  const classId = idOrUndefined(req.body.class, "class");

  let state: "public" | "pending" = "pending";
  /*
  ADMIN: public
  MODERATOR: is from same class ? public : 403
  USER: is from same class ? pending : 403
  */
  if (user.role === "admin") {
    state = "public";
  } else {
    if (classId !== undefined) {
      if (!user.class.equals(classId)) {
        throw new ForbiddenError();
      }
      if (user.role === "moderator") {
        state = "public";
      }
    }
  }

  const { _id } = await Quote.create({
    context: stringOrUndefined(req.body.context),
    text: string(req.body.text, "text"),
    note: stringOrUndefined(req.body.note),
    originator: id(req.body.originator, "originator"),
    classId,
    state,
    createdBy: user,
    approvedBy: state === "public" ? user : undefined,
  });
  res.status(user.role === "admin" ? 201 : 202).json({ _id });
}

function editPerm(current: QuoteType, user: UserType) {
  if (current.state === "public") {
    // Quote is public, so only admins can change it

    // Throw error if user is not an admin
    if (user.role !== "admin") {
      throw new ForbiddenError();
    }
  } else {
    // Quote is pending, so admins, moderators from the same class, and the author can change it

    // If user is creator
    if (current.createdBy.equals(user._id)) {
      // User is creator, so they can't change the state
    } else if (
      !(
        user.role === "admin" ||
        (user.role === "moderator" && user.class.equals(current.class || ""))
      )
    ) {
      // User isn't creator, an admin, or a moderator from same class
      throw new ForbiddenError();
    }
  }
}

export async function editRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "user");
  const current = await Quote.findById(req.params.idValidator).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  editPerm(current, user);
  // Edit the quotes

  const text = stringOrUndefined(req.body.text);
  // Text - change or nothing - don't change
  if (text !== undefined) {
    current.text = text;
  }

  const originator = idOrUndefined(req.body.originator, "originator");
  // Id - change or nothing - don't change
  if (originator !== undefined) {
    current.originator = originator;
  }

  const context = stringOrUndefined(req.body.context);
  // Text - change, "" - unset, or nothing - don't change
  if (context !== undefined) {
    current.context = context === "" ? undefined : context;
  }

  const note = stringOrUndefined(req.body.note);
  // Text - change, "" - unset, or nothing - don't change
  if (current.note !== note) {
    current.note = note === "" ? undefined : note;
  }

  const classString = stringOrUndefined(req.body.class);
  // Id - change, "" - unset, or nothing - don't change
  if (classString === "") {
    current.class = undefined;
  } else {
    const classId = idOrUndefined(classString, "class");
    if (classId !== undefined) {
      current.class = classId;
    }
  }

  await current.save();

  res.sendStatus(204);
}

export async function stateRoute(req: Request, res: Response) {
  const state = string(req.body.state, "state");
  if (state !== "public" && state !== "pending") {
    throw new ValidatorError("state", "state");
  }

  const user = await enforceRole(req.headers.authorization, "admin");
  const current = await Quote.findById(req.params.id).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  if (user.role !== "admin" && !user.class.equals(current.class || "")) {
    throw new ForbiddenError();
  }

  if (state === "pending" && current.state === "public") {
    throw new ConflictError("state");
  }

  if (current.state !== state) {
    current.state = state;
    current.approvedBy = user._id;
    await current.save();
  } else {
    throw new ConflictError("state");
  }

  res.sendStatus(204);
}

async function random() {
  // Get random quote
  const quotes = await Quote.find({
    state: "public",
    class: { $exists: false },
  }).exec();
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export async function randomRoute(req: Request, res: Response) {
  const quote = await random();
  res.json(await quote.reduce());
}

// Quote must be users own pending quote or user must be admin
export async function deleteRoute(req: Request, res: Response) {
  const user = await enforceRole(req.headers.authorization, "user");
  const quote = await Quote.findById(req.params.id).exec();
  if (quote === null) {
    throw new NotFoundError();
  }
  if (
    user.role !== "admin" &&
    (quote.state !== "pending" || !quote.createdBy.equals(user._id))
  ) {
    throw new ForbiddenError();
  }
  await quote.remove();
  res.sendStatus(204);
}
