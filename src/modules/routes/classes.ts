import type { Request, Response } from "express";
import Class from "../models/class";
import User from "../models/user";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
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

// List all users with role "guest", admins can see all users, moderators can see all guests guest.class == moderator.class
export async function listClassGuests(req: Request, res: Response) {
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
    }).exec();
    res.json(users.map((u) => u.prepare()));
  }
}

// Post allow or decline a guest to join a class become a user
export async function processGuest(req: Request, res: Response) {
  const user = await enforceUser(req.headers.authorization);
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new ForbiddenError();
  }
  const guest = await User.findById(req.params["id"]).exec();
  if (guest === null) {
    throw new NotFoundError();
  }
  if (guest.role !== "guest") {
    throw new ConflictError("User is not a guest");
  }
  if (user.role === "moderator" && user.class !== guest.class) {
    throw new ForbiddenError();
  }
  const { action } = req.body;
  if (action === "accept") {
    guest.role = "user";
    await guest.save();
    res.json(guest.prepare());
  }
}
