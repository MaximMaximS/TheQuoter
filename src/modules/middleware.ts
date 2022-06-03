import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import * as errors from "./errors";
import User, { IUser } from "./models/user";
import mongoose from "mongoose";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

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
  } else {
    // Unhandled error
    console.error(err);
    res.sendStatus(500);
  }
};

// Add user to the request (req.user)
export const setUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await getUser(req.headers.authorization);
  req.user = user;
  next();
};

// Add user to the request (req.user) and enforce role
export const enforceRole =
  (role: "admin" | "moderator" | "user") =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Verify token
    const user = await getUser(req.headers.authorization);
    // If admin false then enforce moderator or admin, otherwise enforce admin
    if (user === null) {
      return next(new errors.IncorrectLoginError());
    }
    // User is always at least "user" so no need to check
    switch (role) {
      case "admin":
        if (user.role !== "admin") {
          return next(new errors.ForbiddenError());
        }
        break;
      case "moderator":
        if (user.role !== "admin" && user.role !== "moderator") {
          return next(new errors.ForbiddenError());
        }
        break;
    }
    req.user = user;
    next();
  };

// Get user from authorization header
async function getUser(authHeader: string | undefined): Promise<IUser | null> {
  if (authHeader !== undefined) {
    // Slice off Bearer prefix
    const token = authHeader.split(" ")[1];
    if (process.env.JWT_SECRET === undefined) {
      console.log("JWT_SECRET is not defined");
      process.exit(1);
    }
    const id = jwt.verify(token, process.env.JWT_SECRET);
    // Check if id is not an object
    if (typeof id === "string") {
      return null;
    }
    return await User.findById(id.id);
  }
  return null;
}

export function notFound(req: Request, res: Response) {
  res.sendStatus(404);
}

export function methodNotAllowed(req: Request, res: Response) {
  res.sendStatus(405);
}
