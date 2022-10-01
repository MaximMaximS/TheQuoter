import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";
import { ServerError, ValidatorError } from "../errors";

interface IUser {
  username: string;
  password: string;
  email: string;
  role: "admin" | "moderator" | "user" | "guest";
  class: Types.ObjectId | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPreparedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: "admin" | "moderator" | "user" | "guest";
  class: Types.ObjectId | undefined;
}

export type Operation = "view" | "promote" | "remove";

type UserTypeA = Document<Types.ObjectId, unknown, IUser> &
  IUser & { _id: Types.ObjectId };

interface IUserMethods {
  prepare(): IPreparedUser;
  isValidPassword(password: string): boolean;
  genToken(): string;
  can(user: UserTypeA, opertation: Operation): boolean;
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
      enum: ["admin", "moderator", "user", "guest"],
      default: "guest",
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required(this: IUser) {
        this.role !== "guest";
      },
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

export type UserType = UserTypeA & IUserMethods;

UserSchema.method<UserType>("prepare", function (): IPreparedUser {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    class: this.class,
  };
});

UserSchema.method<UserType>("isValidPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

UserSchema.method<UserType>("genToken", function () {
  const secret = process.env["JWT_SECRET"];
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

// Permissions resolver
UserSchema.method<UserType>(
  "can",
  function (user: UserTypeA, operation: Operation) {
    if (user.role === "admin") {
      return true;
    }
    if (this._id === user._id) {
      return operation !== "promote";
    }
    if (user.role !== "moderator") {
      return false;
    }
    if (user.class === undefined) {
      throw new ServerError(`Moderator ${user._id.toString()} has no class`);
    }
    if (this.class === undefined) {
      return false;
    }

    return user.class.equals(this.class);
  }
);

export default model<IUser, UserModel>("User", UserSchema, "users");
