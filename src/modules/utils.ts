/*
// Used in some cases where linter complains about extracting from unknown type
export function extractFromUnknownObject(obj: unknown, key: string): unknown {
  if (isObject(obj)) {
    return obj[key as keyof typeof obj];
  }
  return null;
}

// Check if the unknown is an object
export function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}
*/
import { verify } from "jsonwebtoken";
import { Types } from "mongoose";
import User from "./models/user";
import {
  ForbiddenError,
  IncorrectLoginError,
  ServerError,
  ValidatorError,
} from "./errors";

// Get user from authorization header
export async function getUser(authHeader: string | undefined) {
  if (authHeader !== undefined) {
    // Slice off Bearer prefix
    const token = authHeader.split(" ")[1];
    if (process.env.JWT_SECRET === undefined) {
      throw new ServerError("JWT_SECRET is not defined");
    }
    const uid = verify(token, process.env.JWT_SECRET);
    // Check if id is not an object
    if (typeof uid === "string") {
      return;
    }
    return (await User.findById(uid.id)) || undefined;
  }
  return;
}

export async function enforceRole(
  authHeader: string | undefined,
  role: "user" | "moderator" | "admin"
) {
  // Verify token
  const user = await getUser(authHeader);
  // If admin false then enforce moderator or admin, otherwise enforce admin
  if (user === undefined) {
    throw new IncorrectLoginError();
  }
  // User is always at least "user" so no need to check
  switch (role) {
    case "admin":
      if (user.role !== "admin") {
        throw new ForbiddenError();
      }
      break;
    case "moderator":
      if (user.role !== "admin" && user.role !== "moderator") {
        throw new ForbiddenError();
      }
      break;
  }
  return user;
}

export function stringOrUndefined(str: unknown): string | undefined {
  if (typeof str === "string") {
    return str;
  }
  return undefined;
}

export function string(str: unknown, path: string): string {
  if (typeof str === "string") {
    return str;
  }
  throw new ValidatorError(path, "required");
}

export function idOrUndefined(
  id: unknown,
  path: string
): Types.ObjectId | undefined {
  if (id === undefined) {
    return undefined;
  }
  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw new ValidatorError(path, "ObjectId");
  }
  return new Types.ObjectId(id);
}

export function id(id: string | undefined, path: string): Types.ObjectId {
  if (id === undefined) {
    throw new ValidatorError(path, "required");
  }
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidatorError(path, "ObjectId");
  }
  return new Types.ObjectId(id);
}
