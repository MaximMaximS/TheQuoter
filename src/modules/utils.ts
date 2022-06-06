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
import User from "./models/user";
import { ForbiddenError, IncorrectLoginError, ValidatorError } from "./errors";
import { Types } from "mongoose";

// Get user from authorization header
export async function getUser(authHeader: string | undefined) {
  if (authHeader !== undefined) {
    // Slice off Bearer prefix
    const token = authHeader.split(" ")[1];
    if (process.env.JWT_SECRET === undefined) {
      console.log("JWT_SECRET is not defined");
      process.exit(1);
    }
    const id = verify(token, process.env.JWT_SECRET);
    // Check if id is not an object
    if (typeof id === "string") {
      return null;
    }
    return await User.findById(id.id);
  }
  return null;
}

export async function enforceRole(
  authHeader: string | undefined,
  role: "user" | "moderator" | "admin"
) {
  // Verify token
  const user = await getUser(authHeader);
  // If admin false then enforce moderator or admin, otherwise enforce admin
  if (user === null) {
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
  id: string | undefined
): Types.ObjectId | undefined {
  if (id === undefined) {
    return undefined;
  }
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;
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
