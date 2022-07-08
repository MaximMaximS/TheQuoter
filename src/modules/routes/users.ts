import type { Request, Response } from "express";
import User from "../models/user";
import { ForbiddenError, IncorrectLoginError, NotFoundError } from "../errors";
import { enforcePermit, id, string } from "../utils";

export async function registerUserRoute(req: Request, res: Response) {
  // Try to create a new user
  const user = await User.create({
    username: string(req.body.username, "username"),
    password: string(req.body.password, "password"),
    email: string(req.body.email, "email"),
    class: id(req.body.class, "class"),
  });
  // Successfully created a new user
  res.status(201).json({
    token: user.genToken(),
    user: user.prepare(),
  });
}

async function login(username: string, password: string) {
  const user = await User.findOne({
    username,
  }).exec();
  if (user === null) {
    throw new IncorrectLoginError();
  }
  if (!user.isValidPassword(password)) {
    throw new IncorrectLoginError();
  }
  return user;
}

export async function loginUserRoute(req: Request, res: Response) {
  const user = await login(
    string(req.body.username, "username"),
    string(req.body.password, "password")
  );
  res.json({
    token: user.genToken(),
    user: user.prepare(),
  });
}

export async function getUserRoute(req: Request, res: Response) {
  const cUser = await enforcePermit(req.headers.authorization, "user");
  const user = await User.findById(req.params["id"]).exec();
  if (user === null) {
    throw new NotFoundError();
  }
  if (!user._id.equals(cUser._id) && cUser.role !== "admin") {
    throw new ForbiddenError();
  }
  res.json(user.prepare());
}

// TODO
export async function deleteUserRoute(req: Request, res: Response) {
  if (process.env["NODE_ENV"] !== "development") {
    throw new NotFoundError();
  }
  const user = await login(
    string(req.body.username, "username"),
    string(req.body.password, "password")
  );
  user.remove();
  res.sendStatus(204);
}
