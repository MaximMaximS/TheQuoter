import type { ErrorRequestHandler, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { Error } from "mongoose";
import {
  ConflictError,
  ForbiddenError,
  IncorrectLoginError,
  NotFoundError,
  ValidatorError,
  genValidatorMessage,
} from "./errors";
import { string } from "./utils";

export const checkJwt = auth({
  audience: string(process.env["JWT_AUDIENCE"], "JWT_AUDIENCE"),
  issuerBaseURL: string(
    process.env["JWT_ISSUER_BASE_URL"],
    "JWT_ISSUER_BASE_URL"
  ),
  tokenSigningAlg: "RS256",
});

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof ValidatorError) {
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
  } else if (
    err instanceof IncorrectLoginError ||
    err instanceof TokenExpiredError ||
    err instanceof NotBeforeError ||
    err instanceof JsonWebTokenError
  ) {
    res.sendStatus(401);
  } else if (err instanceof Error.ValidationError) {
    // Extract first, possible TODO to send all of them
    const name = Object.keys(err.errors)[0];
    if (name === undefined) {
      res.status(500).json({
        message: "Error returning broken in validation",
      });
    } else {
      const first = err.errors[name];
      if (first === undefined) {
        res.status(500).json({
          message: "Error returning broken in validation",
        });
      } else {
        res.status(400).json({
          message: genValidatorMessage(first.path, first.kind),
          path: first.path,
          kind: first.kind,
        });
      }
    }
  } else if (err instanceof NotFoundError) {
    next();
  } else if (err instanceof ForbiddenError) {
    res.sendStatus(403);
  } else if (err instanceof ConflictError) {
    res.sendStatus(409);
  } else {
    // Unhandled error
    console.error(err);
    res.sendStatus(500);
  }
};

export function notFound(_req: Request, res: Response) {
  res.sendStatus(404);
}

export function methodNotAllowed(_req: Request, res: Response) {
  res.sendStatus(405);
}
