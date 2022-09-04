import type { Request, Response } from "express";
import Quote, { QuoteType } from "../models/quote";
import type { UserType } from "../models/user";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  ValidatorError,
} from "../errors";
import {
  enforcePermit,
  escapeRegExp,
  id,
  idOrUndefined,
  string,
  stringOrUndefined,
} from "../utils";

export async function getQuoteRoute(req: Request, res: Response) {
  const quoteFound = await Quote.findById(req.params["id"]).exec();
  if (quoteFound === null) {
    throw new NotFoundError();
  }
  const preparedQuote = await quoteFound.prepare();
  res.json(preparedQuote);
}

export async function searchQuotesRoute(req: Request, res: Response) {
  // Public is fine, but if it's not, we need to check if the user is an admin
  const state = req.query["state"];
  if (state === "pending" || state === "archived") {
    await enforcePermit(req.headers.authorization, "admin");
  } else if (state !== undefined && state !== "public") {
    throw new ValidatorError("state", "state");
  }

  let query = Quote.find();
  const originator = idOrUndefined(req.query["originator"], "originator");
  if (originator !== undefined) {
    query = query.where("originator").equals(originator);
  }
  const classId = idOrUndefined(req.query["class"], "class");
  if (classId !== undefined) {
    query = query.where("class").equals(classId);
  }
  const text = stringOrUndefined(req.query["text"], "text");
  if (text !== undefined) {
    query = query.regex("text", new RegExp(escapeRegExp(text), "i"));
  }
  if (state !== undefined) {
    query = query.where("state").equals(state);
  }
  const quotes = await query.exec();

  // Simplify all quotes
  const quotesFound = await Promise.all(quotes.map((q) => q.prepare()));

  res.json(quotesFound); // Send the found enteries
}

export async function createQuoteRoute(req: Request, res: Response) {
  const user = await enforcePermit(req.headers.authorization, "user");
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
    context: stringOrUndefined(req.body.context, "context"),
    text: string(req.body.text, "text"),
    note: stringOrUndefined(req.body.note, "note"),
    originator: id(req.body.originator, "originator"),
    classId,
    state,
    createdBy: user,
    approvedBy: state === "public" ? user : undefined,
  });
  res.status(user.role === "admin" ? 201 : 202).json({ _id });
}

function editPerm(current: QuoteType, user: UserType) {
  if (current.state === "pending") {
    if (user.role === "user") {
      if (!current.createdBy.equals(user._id)) {
        throw new ForbiddenError();
      }
    } else {
      user.requirePermit(current.class || "admin");
    }
  } else {
    user.requirePermit("admin");
  }
}

export async function editQuoteRoute(req: Request, res: Response) {
  const user = await enforcePermit(req.headers.authorization, "user");
  const current = await Quote.findById(req.params["id"]).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  editPerm(current, user);
  // Edit the quotes

  const text = stringOrUndefined(req.body.text, "text");
  // Text - change or nothing - don't change
  if (text !== undefined) {
    current.text = text;
  }

  const originator = idOrUndefined(req.body.originator, "originator");
  // Id - change or nothing - don't change
  if (originator !== undefined) {
    current.originator = originator;
  }

  const context = stringOrUndefined(req.body.context, "context");
  // Text - change, "" - unset, or nothing - don't change
  if (context !== undefined) {
    current.context = context === "" ? undefined : context;
  }

  const note = stringOrUndefined(req.body.note, "note");
  // Text - change, "" - unset, or nothing - don't change
  if (current.note !== note) {
    current.note = note === "" ? undefined : note;
  }

  const classString = stringOrUndefined(req.body.class, "class");
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

export async function setQuoteStateRoute(req: Request, res: Response) {
  const state = string(req.body.state, "state");
  if (state !== "public" && state !== "pending" && state !== "archived") {
    throw new ValidatorError("state", "state");
  }

  const user = await enforcePermit(req.headers.authorization, "user");
  const current = await Quote.findById(req.params["id"]).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  if (current.state === "pending") {
    user.requirePermit(current.class || "admin");
  } else {
    user.requirePermit("admin");
  }

  switch (state) {
    case "public":
      if (current.state === "pending") {
        current.state = "public";
        current.approvedBy = user._id;
        await current.save();
      } else {
        throw new ConflictError("state");
      }
      break;
    case "archived":
      if (current.state !== "archived") {
        current.state = "archived";
        await current.save();
      } else {
        throw new ConflictError("state");
      }
      break;
    default:
      throw new ConflictError("state");
  }
  res.sendStatus(204);
}

export async function randomQuoteRoute(_req: Request, res: Response) {
  const quotes = await Quote.find({
    state: "public",
    class: { $exists: false },
  }).exec();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (quote === undefined) {
    throw new ServerError("Quote randomization failed");
  }
  res.json(await quote.prepare());
}

// Quote must be users own pending quote or user must be admin
export async function deleteQuoteRoute(req: Request, res: Response) {
  const user = await enforcePermit(req.headers.authorization, "user");
  const quote = await Quote.findById(req.params["id"]).exec();
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
