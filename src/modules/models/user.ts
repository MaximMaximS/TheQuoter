import { Document, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";

export interface IUser extends Document {
  username: string;
  hash: string;
  email: string;
  role: "admin" | "moderator" | "user";
  class: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(idValidator);

export default model("User", UserSchema, "users");
