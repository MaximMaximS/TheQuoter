import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

/*
const CommentSchema = new Schema({
  archived: {
    type: Boolean,
    default: false,
  },
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
});
*/

const QuoteSchema = new Schema(
  {
    state: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
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
      ref: "Person",
      required: true,
    },
    class: {
      type: Types.ObjectId,
      ref: "Class",
    },
    // comments: [CommentSchema],
    createdBy: {
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
