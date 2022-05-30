import { Schema, Types, model, Document } from "mongoose";

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

export interface IQuote extends Document {
  state: "draft" | "pending" | "approved" | "rejected";
  context?: string;
  text: string;
  note?: string;
  originator: Types.ObjectId;
  class: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
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
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },
    // comments: [CommentSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Quote", QuoteSchema, "quotes");
