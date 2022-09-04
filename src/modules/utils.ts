import { verify } from "jsonwebtoken";
import { Types } from "mongoose";
import User from "./models/user";
import { IncorrectLoginError, ServerError, ValidatorError } from "./errors";

// Get user from authorization header
export async function getUser(authHeader?: string) {
  if (authHeader !== undefined) {
    // Slice off Bearer prefix
    const token = authHeader.split(" ")[1] || "";
    if (process.env["JWT_SECRET"] === undefined) {
      throw new ServerError("JWT_SECRET is not defined");
    }
    const uid = verify(token, process.env["JWT_SECRET"]);
    // Check if id is not an object
    if (typeof uid === "string") {
      return;
    }
    const user = await User.findById(uid["id"]).exec();
    if (user !== null) {
      return user;
    }
  }
  // Required due to typescript
  // eslint-disable-next-line sonarjs/no-redundant-jump
  return;
}

// Get user from request and check if user has permit
export async function enforcePermit(
  authHeader: string | undefined,
  permit: "user" | "moderator" | "admin" | Types.ObjectId
) {
  // Verify token
  const user = await getUser(authHeader);
  // If admin false then enforce moderator or admin, otherwise enforce admin
  if (user === undefined) {
    throw new IncorrectLoginError();
  }
  if (permit !== "user") {
    user.requirePermit(permit);
  }
  return user;
}

// Return string, undefined, or throw error
export function stringOrUndefined(
  str: unknown,
  path: string
): string | undefined {
  if (str === undefined) {
    return;
  }
  if (typeof str === "string") {
    return str;
  }
  throw new ValidatorError(path, "string");
}

// Return string or throw error
export function string(str: unknown, path: string): string {
  if (typeof str === "string") {
    return str;
  }
  throw new ValidatorError(path, "required");
}

// Return id, undefined, or throw error
export function idOrUndefined(
  id: unknown,
  path: string
): Types.ObjectId | undefined {
  const soru = stringOrUndefined(id, path);
  if (soru === undefined) {
    return undefined;
  }
  if (!Types.ObjectId.isValid(soru)) {
    throw new ValidatorError(path, "ObjectId");
  }
  return new Types.ObjectId(soru);
}

// Return id or throw error
export function id(id: unknown, path: string): Types.ObjectId {
  const soru = string(id, path);
  if (!Types.ObjectId.isValid(soru)) {
    throw new ValidatorError(path, "ObjectId");
  }
  return new Types.ObjectId(soru);
}

export function escapeRegExp(query: string) {
  const chars = /[$()*+.?[\\\]^{|}]/g;

  return new RegExp(chars.source).test(query)
    ? query.replace(chars, "\\$&")
    : query;
}
