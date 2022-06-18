import { Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import Quote, { IQuote, IReducedQuote } from "../models/quote";
import { IUser } from "../models/user";
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
  const query: FilterQuery<IQuote> = {};
  if (originator !== undefined) {
    query.originator = originator;
  }
  if (classId !== undefined) {
    query.class = classId;
  }
  if (text !== undefined) {
    query.text = { $regex: text, $options: "i" };
  }
  if (state !== undefined) {
    query.state = state;
  }
  const quotes = await Quote.find({ ...query }).exec();

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

async function create(
  user: IUser,
  text: string,
  originator: Types.ObjectId,
  classId?: Types.ObjectId,
  context?: string,
  note?: string
) {
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
    user,
    string(req.body.text, "text"),
    id(req.body.originator, "originator"),
    idOrUndefined(req.body.class, "class"),
    stringOrUndefined(req.body.context),
    stringOrUndefined(req.body.note)
  );
  res.status(user.role === "admin" ? 201 : 202).json({ _id: quoteCreated._id });
}

function resolveAccess(quote: IQuote, user: IUser) {
  if (quote.state === "public") {
    // Quote is public, so only admins can change it

    // Throw error if user is not an admin
    if (user.role !== "admin") {
      throw new ForbiddenError();
    }
  } else {
    // Quote is pending, so admins, moderators from the same class, and the author can change it

    // If user is creator
    if (quote.createdBy.equals(user._id)) {
      // User is creator, so they can't change the state
    } else if (
      !(
        user.role === "admin" ||
        (user.role === "moderator" && user.class.equals(quote.class || ""))
      )
    ) {
      // User isn't creator, an admin, or a moderator from same class
      throw new ForbiddenError();
    }
  }
}

async function edit(
  id: unknown,
  user: IUser,
  text?: string,
  context?: string,
  note?: string,
  originator?: Types.ObjectId,
  classString?: string
) {
  const current = await Quote.findById(id).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  resolveAccess(current, user);
  // Edit the quotes

  // Text - change or nothing - don't change
  if (text !== undefined) {
    current.text = text;
  }

  // Id - change or nothing - don't change
  if (originator !== undefined) {
    current.originator = originator;
  }

  // Text - change, "" - unset, or nothing - don't change
  if (context !== undefined) {
    current.context = context === "" ? undefined : context;
  }

  // Text - change, "" - unset, or nothing - don't change
  if (current.note !== note) {
    current.note = note === "" ? undefined : note;
  }

  // Id - change, "" - unset, or nothing - don't change
  if (classString === "") {
    current.class = undefined;
  } else {
    const classId = idOrUndefined(classString, "class");
    if (classId !== undefined) {
      current.class = classId;
    }
  }

  return await current.save();
}

export async function editRoute(req: Request, res: Response) {
  await edit(
    req.params.id,
    await enforceRole(req.headers.authorization, "user"),
    stringOrUndefined(req.body.text),
    stringOrUndefined(req.body.context),
    stringOrUndefined(req.body.note),
    idOrUndefined(req.body.originator, "originator"),
    stringOrUndefined(req.body.class)
  );
  res.sendStatus(204);
}

async function state(state: "public" | "pending", id: unknown, user: IUser) {
  const current = await Quote.findById(id).exec();
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
  return;
}

export async function stateRoute(req: Request, res: Response) {
  const stateStr = string(req.body.state, "state");
  if (stateStr !== "public" && stateStr !== "pending") {
    throw new ValidatorError("state", "state");
  }

  await state(
    stateStr,
    req.params.id,
    await enforceRole(req.headers.authorization, "moderator")
  );
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
