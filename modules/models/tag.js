import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
const { Schema, model } = mongoose;

const TagSchema = new Schema(
  {
    archived: {
      type: Boolean,
      default: false,
    },
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
      enum: ["teacher", "class", "other"],
    },
  }
);

TagSchema.plugin(uniqueValidator);

export default model("Tag", TagSchema, "tags");
