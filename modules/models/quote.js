import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const CommentSchema = new Schema(
  {
    text: {
      type: String,
      maxlength: 500,
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const QuoteSchema = new Schema(
  {
    context: {
      type: String,
      maxlength: 70,
      trim: true,
    },
    text: {
      type: String,
      maxlength: 500,
      trim: true,
      required: true,
    },
    note: {
      type: String,
      maxlength: 70,
      trim: true,
    },
    originator: {
      type: Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    tags: [
      {
        type: Types.ObjectId,
        ref: "Tag",
      },
    ],
    comments: [CommentSchema],
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

export default model("Quote", QuoteSchema, "quotes");
