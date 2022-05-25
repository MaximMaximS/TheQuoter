import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const TagSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 32,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ["teacher", "class", "other"],
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Tag", TagSchema, "tags");
