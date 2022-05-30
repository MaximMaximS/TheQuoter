import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const { Schema, Types, model } = mongoose;

const PersonSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 32,
      trim: true,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["teacher" /*"student", "other"*/],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PersonSchema.plugin(uniqueValidator);

export default model("Person", PersonSchema, "people");
