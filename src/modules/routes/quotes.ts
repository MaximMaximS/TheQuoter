import type { Request, Response } from "express";
import Quote from "../models/quote";
import { ForbiddenError, NotFoundError, ServerError } from "../errors";
import {
  enforceUser,
  escapeRegExp,
  id,
  idOrUndefined,
  string,
  stringOrUndefined,
} from "../utils";

export async function getQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const quoteFound = await Quote.findById(req.params["id"]).exec();
  if (quoteFound === null) {
    throw new NotFoundError();
  }
  // Permission check
  if (!quoteFound.can(user, "view")) {
    throw new NotFoundError();
  }
  const preparedQuote = await quoteFound.prepare(user);
  res.json(preparedQuote);
}

export async function searchQuotesRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);

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
  const state = stringOrUndefined(req.query["state"], "state");
  if (state !== undefined) {
    query = query.where("state").equals(state);
  }
  const quotes = await query.exec();

  // Permission check and prepare all quotes
  const quotesFound = await Promise.all(
    quotes
      .filter((quote) => quote.can(user, "view"))
      .map((q) => q.prepare(user))
  );

  res.json(quotesFound); // Send the found enteries
}

export async function createQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);

  const quote = new Quote({
    context: stringOrUndefined(req.body.context, "context"),
    text: string(req.body.text, "text"),
    note: stringOrUndefined(req.body.note, "note"),
    originator: id(req.body.originator, "originator"),
    classId: idOrUndefined(req.body.class, "class"),
    state: "pending",
    createdBy: user,
  });

  if (!quote.can(user, "create")) {
    throw new ForbiddenError();
  }

  const publish = quote.can(user, "publish");

  if (publish) {
    quote.state = "public";
  }

  const saved = await quote.save();

  res.status(publish ? 201 : 202).json(saved.prepare(user));
}

export async function editQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const current = await Quote.findById(req.params["id"]).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  if (!current.can(user, "view")) {
    throw new NotFoundError();
  }

  if (!current.can(user, "edit")) {
    throw new ForbiddenError();
  }

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

  const saved = await current.save();

  res.json(await saved.prepare(user));
}

export async function publishRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const current = await Quote.findById(req.params["id"]).exec();
  if (current === null) {
    throw new NotFoundError();
  }

  if (!current.can(user, "view")) {
    throw new NotFoundError();
  }

  if (!current.can(user, "publish")) {
    throw new ForbiddenError();
  }

  current.state = "public";
  const saved = await current.save();

  res.json(await saved.prepare(user));
}

export async function randomQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const quotes = await Quote.find({
    state: "public",
    class: { $exists: false },
  }).exec();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (quote === undefined) {
    throw new ServerError("Quote randomization failed");
  }
  if (!quote.can(user, "view")) {
    throw new ServerError("Quote randomization failed");
  }

  res.json(await quote.prepare(user));
}

export async function deleteQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const quote = await Quote.findById(req.params["id"]).exec();

  if (quote === null) {
    throw new NotFoundError();
  }

  if (!quote.can(user, "view")) {
    throw new NotFoundError();
  }

  if (!quote.can(user, "delete")) {
    throw new ForbiddenError();
  }

  await quote.remove();
  res.sendStatus(204);
}

// Like route
export async function likeQuoteRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  const quote = await Quote.findById(req.params["id"]).exec();

  if (quote === null) {
    throw new NotFoundError();
  }

  if (!quote.can(user, "view")) {
    throw new NotFoundError();
  }

  const remove = stringOrUndefined(req.body.action, "action") === "remove";

  await quote.like(user, remove);

  res.json(await quote.prepare(user));
}
