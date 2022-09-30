import type { Request, Response } from "express";
import User from "../models/user";
import {
  ConflictError,
  ForbiddenError,
  IncorrectLoginError,
  NotFoundError,
  ValidatorError,
} from "../errors";
import { enforceUser, idOrUndefined, string } from "../utils";

export async function registerUserRoute(req: Request, res: Response) {
  // Try to create a new user
  const user = await User.create({
    username: string(req.body.username, "username"),
    password: string(req.body.password, "password"),
    email: string(req.body.email, "email"),
    class: idOrUndefined(req.body.class, "class"),
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
  if (!user.can(cUser, "view")) {
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
  // Find all guests that have a any class
  const guests = await User.find({
    role: "guest",
    class: {
      $exists: true,
    },
  }).exec();

  // Filter out guests that the user can't see
  const filtered = guests
    .filter((guest) => guest.can(user, "view"))
    .map((g) => g.prepare());
  res.json(filtered);
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

  if (!guest.can(user, "view")) {
    throw new NotFoundError();
  }

  if (guest.role !== "guest") {
    throw new ConflictError("User is not a guest");
  }
  if (guest.class === undefined) {
    throw new ConflictError("User has no class");
  }

  const { approve } = req.body;
  if (typeof approve !== "boolean") {
    throw new ValidatorError("approve", "boolean");
  }

  if (!guest.can(user, "promote")) {
    throw new ForbiddenError();
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
