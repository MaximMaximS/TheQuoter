import { Document, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";

export interface IReducedUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: "admin" | "moderator" | "user";
  class: Types.ObjectId;
}

export interface IUser extends Document {
  username: string;
  hash: string;
  email: string;
  role: "admin" | "moderator" | "user";
  class: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  reduce(): IReducedUser;
}

const UserSchema = new Schema<IUser>(
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
    hash: {
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

UserSchema.methods.reduce = function (): IReducedUser {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    class: this.class,
  };
};

export default model("User", UserSchema, "users");
