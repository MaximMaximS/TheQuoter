import { ErrorRequestHandler, Request, Response } from "express";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import mongoose from "mongoose";

import * as errors from "./errors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof errors.ValidatorError) {
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
  } else if (
    err instanceof errors.IncorrectLoginError ||
    err instanceof TokenExpiredError ||
    err instanceof NotBeforeError ||
    err instanceof JsonWebTokenError
  ) {
    res.sendStatus(401);
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Extract first, possible TODO to send all of them
    const first = err.errors[Object.keys(err.errors)[0]];
    res.status(400).json({
      message: errors.genValidatorMessage(first.path, first.kind),
      path: first.path,
      kind: first.kind,
    });
  } else if (err instanceof errors.NotFoundError) {
    res.sendStatus(404);
  } else if (err instanceof errors.ForbiddenError) {
    res.sendStatus(403);
  } else if (err instanceof errors.ConflictError) {
    res.sendStatus(409);
  } else {
    // Unhandled error
    console.error(err);
    res.sendStatus(500);
  }
};

export function notFound(req: Request, res: Response) {
  res.sendStatus(404);
}

export function methodNotAllowed(req: Request, res: Response) {
  res.sendStatus(405);
  console.log("Not allowed API call...");
}
