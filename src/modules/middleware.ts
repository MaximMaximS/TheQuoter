import jwt from "jsonwebtoken";
import * as errors from "./errors";
import User, { IUser } from "./models/user";
import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response) => {
  if (err instanceof errors.ValidatorError) {
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
  } else if (err instanceof errors.IncorrectLoginError) {
    res.sendStatus(401);
  } else if (err instanceof mongoose.Error.ValidationError) {
    const first = err.errors[Object.keys(err.errors)[0]];
    res.status(400).json({
      message: first.message,
      path: first.path,
      kind: first.kind,
    });
  } else if (err instanceof errors.ServerError) {
    res.status(500).json({
      message: err.message,
    });
  } else if (err instanceof errors.NotFoundError) {
    res.sendStatus(404);
  } else if (err instanceof errors.ForbiddenError) {
    res.sendStatus(403);
  } else {
    res.sendStatus(500);
  }
};

export const setUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await getUser(req.headers.authorization);
  if (user instanceof Error) {
    return next(user);
  }
  req.user = user;
};

export const enforceRole =
  (admin: boolean) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Verify token
    const user = await getUser(req.headers.authorization);
    if (user instanceof Error) {
      return next(user);
    }
    // If admin false then enforce moderator or admin, otherwise enforce admin
    if (user === null) {
      return next(new errors.IncorrectLoginError());
    }
    (admin ? ["admin"] : ["admin", "moderator"]).includes(user.role)
      ? next()
      : next(new errors.ForbiddenError());
  };

async function getUser(authHeader: string | undefined): Promise<IUser | null> {
  if (authHeader !== undefined) {
    const token = authHeader.split(" ")[1];
    if (process.env.JWT_SECRET === undefined) {
      console.log("JWT_SECRET is not defined");
      process.exit(1);
    }
    const id = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id);
  }
  return null;
}
