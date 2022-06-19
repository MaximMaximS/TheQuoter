import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";
import { ServerError, ValidatorError } from "../errors";

export interface IReducedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: "admin" | "moderator" | "user";
  class: Types.ObjectId;
}

interface IUser {
  username: string;
  password: string;
  email: string;
  role: "admin" | "moderator" | "user";
  class: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  reduce(): IReducedUser;
  isValidPassword(password: string): boolean;
  genToken(): string;
}

export type UserModel = Model<IUser, unknown, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^\w+$/,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Match email format
      match:
        /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "moderator", "user"],
      default: "user",
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(idValidator);

UserSchema.pre("save", function (next) {
  if (this.password.length < 6) {
    throw new ValidatorError("password", "minlength");
  }
  const hash = bcrypt.hashSync(this.password, 12);
  this.password = hash;
  next();
});

UserSchema.method("reduce", function (): IReducedUser {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    class: this.class,
  };
});

UserSchema.method("isValidPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

UserSchema.method("genToken", function () {
  const secret = process.env.JWT_SECRET;
  if (secret === undefined) {
    throw new ServerError("JWT_SECRET is undefined");
  }
  return jwt.sign(
    {
      id: this._id,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );
});

export type UserType = Document<Types.ObjectId, unknown, IUser> &
  IUser & { _id: Types.ObjectId } & IUserMethods;

export default model<IUser, UserModel>("User", UserSchema, "users");
