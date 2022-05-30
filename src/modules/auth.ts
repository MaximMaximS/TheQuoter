import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "./models/user";
import * as errors from "./errors";
const saltRounds = 12;

export function getToken(user: IUser) {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error("JWT_SECRET is undefined");
  }
  return jwt.sign(user._id, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

export async function login(body): Promise<IUser> {
  if ((!body.email && !body.username) || !body.password) {
    throw new errors.IncorrectLoginError();
  }
  const user = await User.findOne({
    $or: [{ email: { $eq: body.email } }, { username: { $eq: body.username } }],
  });
  if (user === null) {
    throw new errors.IncorrectLoginError();
  }
  const result = await bcrypt.compare(body.password, user.hash);
  if (!result) {
    throw new errors.IncorrectLoginError();
  }
  return user;
}

export async function register(body): Promise<IUser> {
  const { username, password, email } = body;
  if (typeof password !== "string") {
    throw new errors.ValidatorError("password", "required");
  }
  // Check if password is 6 characters or more
  if (password.length < 6) {
    throw new errors.ValidatorError("password", "minlength");
  }
  const hash = await bcrypt.hash(password, saltRounds);
  const user = await User.create({
    username: username,
    hash,
    email: email,
  });
  return user;
}
