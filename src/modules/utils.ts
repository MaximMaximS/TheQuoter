import { verify } from "jsonwebtoken";
import { Types } from "mongoose";
import User from "./models/user";
import { IncorrectLoginError, ServerError, ValidatorError } from "./errors";

// Get user from authorization header
export async function getUser(authHeader: string) {
  // Check if token begins with "Bearer "
  if (!authHeader.startsWith("Bearer ")) {
    throw new IncorrectLoginError();
  }
  const token = authHeader.slice(7);

  if (process.env["JWT_SECRET"] === undefined) {
    throw new ServerError("JWT_SECRET is not defined");
  }
  const uid = verify(token, process.env["JWT_SECRET"]);
  // Check if id is not an object
  if (typeof uid === "string") {
    throw new ServerError("JWT Payload is not an object");
  }
  const user = await User.findById(uid["id"]).exec();
  return user !== null ? user : undefined;
}

// Get user from request and check if user has permit
export async function enforceUser(authHeader: string | undefined) {
  // Verify token
  const user = authHeader !== undefined ? await getUser(authHeader) : undefined;
  // If admin false then enforce moderator or admin, otherwise enforce admin
  if (user === undefined) {
    throw new IncorrectLoginError();
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

export function number(num: unknown, path: string): number {
  if (typeof num === "number") {
    return num;
  }
  if (typeof num === "string") {
    const parsed = Number.parseInt(num, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  throw new ValidatorError(path, "number");
}
