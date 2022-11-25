import type { ErrorRequestHandler, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidatorError,
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
  // Database Errors
  if (err instanceof ValidatorError) {
    // Validator Error
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
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
