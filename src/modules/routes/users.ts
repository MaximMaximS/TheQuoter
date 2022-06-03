import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import * as errors from "../errors";
const saltRounds = 12;

// Generate a JWT for the user
export function getToken(user: IUser) {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error("JWT_SECRET is undefined");
  }
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
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
    throw new errors.IncorrectLoginError();
  }
  const user = await User.findOne({
    $or: [{ email: { $eq: body.email } }, { username: { $eq: body.username } }],
  });
  if (user === null) {
    throw new errors.IncorrectLoginError();
  }
  // Verify password
  const result = await bcrypt.compare(body.password, user.hash);
  if (!result) {
    throw new errors.IncorrectLoginError();
  }
  return user;
}

export interface IRegisterBody {
  email?: string;
  username?: string;
  password?: string;
  class?: string;
}

export async function register(body: IRegisterBody): Promise<IUser> {
  const { password } = body;
  if (typeof password !== "string") {
    throw new errors.ValidatorError("password", "required");
  }
  if (password.length < 6) {
    throw new errors.ValidatorError("password", "minlength");
  }
  // Hash password
  const hash = await bcrypt.hash(password, saltRounds);
  // Create user
  const user = await User.create({
    username: body.username,
    hash,
    email: body.email,
    class: body.class,
  });
  return user;
}
