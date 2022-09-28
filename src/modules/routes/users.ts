import type { Request, Response } from "express";
import User from "../models/user";
import {
  ConflictError,
  ForbiddenError,
  IncorrectLoginError,
  NotFoundError,
  ServerError,
  ValidatorError,
} from "../errors";
import { enforceUser, id, string } from "../utils";

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
  const cUser = await enforceUser(req.headers.authorization);
  const user = await User.findById(req.params["id"]).exec();
  if (user === null) {
    throw new NotFoundError();
  }
  if (!user._id.equals(cUser._id) && cUser.role !== "admin") {
    throw new NotFoundError();
  }
  res.json(user.prepare());
}

// List all users with role "guest", admins can see all guests, moderators can see all guests that have new.class == moderator.class
export async function listGuests(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new ForbiddenError();
  }
  if (user.role === "moderator") {
    const users = await User.find({
      role: "guest",
      class: user.class,
    }).exec();
    res.json(users.map((u) => u.prepare()));
  } else {
    const users = await User.find({
      role: "guest",
      class: { $ne: undefined },
    }).exec();
    res.json(users.map((u) => u.prepare()));
  }
}

// Post allow or decline a guest to join a class become a user
export async function approveGuest(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new ForbiddenError();
  }

  const guest = await User.findById(req.params["id"]).exec();

  // 404 If guest not found
  if (guest === null) {
    throw new NotFoundError();
  }
  // 500 if moderator does not have class
  if (user.class === undefined) {
    throw new ServerError("Database anomaly");
  }
  // When guest doesn't request to join a class, do 409, but only if moderator can view them, otherwise 404
  if (guest.class === undefined) {
    if (user.role === "moderator") {
      throw new NotFoundError();
    }
    throw new ConflictError("class");
  } else {
    if (user.role === "moderator" && !guest.class.equals(user.class)) {
      throw new NotFoundError();
    }
  }
  const { approve } = req.body;
  if (typeof approve !== "boolean") {
    throw new ValidatorError("approve", "boolean");
  }
  if (guest.role !== "guest") {
    throw new ConflictError("User is not guest");
  }
  if (approve) {
    guest.role = "user";
    await guest.save();
    res.json(guest.prepare());
  } else {
    guest.class = undefined;
    await guest.save();
    res.json(guest.prepare());
  }
}
