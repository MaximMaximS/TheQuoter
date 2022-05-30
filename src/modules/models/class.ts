import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const { Schema, Types, model } = mongoose;

const ClassSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 8,
      trim: true,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ClassSchema.plugin(uniqueValidator);

export default model("Class", ClassSchema, "classes");
