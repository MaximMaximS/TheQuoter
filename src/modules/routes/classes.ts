import type { Request, Response } from "express";
import Class from "../models/class";
import User from "../models/user";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidatorError,
} from "../errors";
import { enforceUser, escapeRegExp, string, stringOrUndefined } from "../utils";

export async function getClassRoute(req: Request, res: Response) {
  const classFound = await Class.findById(req.params["id"]).exec();
  if (classFound === null) {
    throw new NotFoundError();
  }
  res.json(classFound.prepare());
}

export async function searchClassesRoute(req: Request, res: Response) {
  const name = stringOrUndefined(req.query["name"], "name");
  let query = Class.find();
  if (name !== undefined) {
    query = query.regex("name", new RegExp(escapeRegExp(name), "i"));
  }
  const classes = await query.exec();
  // Simplify all classes
  const classesFound = classes.map((c) => c.prepare());

  res.json(classesFound);
}

export async function createClassRoute(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  const name = string(req.body.name, "name");
  const clas = await Class.create({
    name,
    createdBy: user._id,
  });
  res.status(201).json(clas.prepare());
}

// List all users with role "new", admins can see all users, moderators can see all new users that have new.class == moderator.class
export async function listClassGuests(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new ForbiddenError();
  }
  if (user.role === "moderator") {
    const users = await User.find({
      role: "new",
      class: user.class,
    }).exec();
    res.json(users.map((u) => u.prepare()));
  } else {
    const users = await User.find({
      role: "new",
    }).exec();
    res.json(users.map((u) => u.prepare()));
  }
}

// Post allow or decline a new user to join a class become a user
export async function processGuest(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new ForbiddenError();
  }
  const { allow } = req.body;
  if (typeof allow !== "boolean") {
    throw new ValidatorError("accept", "boolean");
  }
  const newU = await User.findById(req.params["id"]).exec();
  if (newU === null) {
    throw new NotFoundError();
  }
  if (newU.role !== "new") {
    throw new ConflictError("User is not new");
  }
  if (user.role === "moderator" && user.class !== newU.class) {
    throw new ForbiddenError();
  }
  if (allow) {
    newU.role = "user";
    await newU.save();
    res.json(newU.prepare());
  } else {
    newU.role = "guest";
    await newU.save();
    res.json(newU.prepare());
  }
}
