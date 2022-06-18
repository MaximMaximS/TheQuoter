import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import {
  ForbiddenError,
  IncorrectLoginError,
  NotFoundError,
  ValidatorError,
} from "../errors";
import { enforceRole, id, string } from "../utils";

export interface IRegisterBody {
  email?: string;
  username?: string;
  password?: string;
  class?: string;
}

export async function register(body: IRegisterBody): Promise<IUser> {
  const { password, username, email } = body;
  if (typeof password !== "string") {
    throw new ValidatorError("password", "required");
  }
  if (password.length < 6) {
    throw new ValidatorError("password", "minlength");
  }

  // Create user
  return await User.create({
    username: string(username, "username"),
    password,
    email: string(email, "email"),
    class: id(body.class, "class"),
  });
}

export async function registerRoute(req: Request, res: Response) {
  const user = await register(req.body);
  res.status(201).json({
    token: user.genToken(),
    user: user.reduce(),
  });
}

export interface ILoginBody {
  email?: string;
  username?: string;
  password?: string;
}

export async function login(body: ILoginBody): Promise<IUser> {
  // Check if <email or username> and <password> is provided
  if ((!body.email && !body.username) || !body.password) {
    throw new IncorrectLoginError();
  }
  const user = await User.findOne({
    $or: [{ email: { $eq: body.email } }, { username: { $eq: body.username } }],
  });
  if (user === null) {
    throw new IncorrectLoginError();
  }
  // Verify password

  if (!user.isValidPassword(body.password)) {
    throw new IncorrectLoginError();
  }
  return user;
}

export async function loginRoute(req: Request, res: Response) {
  const user = await login(req.body);
  res.json({
    token: user.genToken(),
    user: user.reduce(),
  });
}

export async function getRoute(req: Request, res: Response) {
  const cUser = await enforceRole(req.headers.authorization, "user");
  const user = await User.findById(req.params.id);
  if (user === null) {
    throw new NotFoundError();
  }
  if (!user._id.equals(cUser._id) && cUser.role !== "admin") {
    throw new ForbiddenError();
  }
  res.json(user.reduce());
}

// TODO
export async function deleteRoute(req: Request, res: Response) {
  if (process.env.NODE_ENV !== "development") {
    throw new NotFoundError();
  }
  const user = await login(req.body);
  user.remove();
  res.sendStatus(204);
}
