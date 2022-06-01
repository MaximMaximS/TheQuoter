import { Schema, Types, model, Document } from "mongoose";
import { IReducedClass } from "./class";
import { IReducedPerson } from "./person";
import idValidator from "mongoose-id-validator";

export interface IReducedQuote {
  _id: Types.ObjectId;
  context?: string;
  text: string;
  note?: string;
  originator: IReducedPerson;
  class?: IReducedClass;
  state?: string;
}

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

  // Instance methods
  reduce(): IReducedQuote;
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

QuoteSchema.plugin(idValidator);

QuoteSchema.methods.reduce = function (keepState = false): IReducedQuote {
  this.populate("originator").populate("class");
  // Keep only id, context, text, note, originator, class, and optionally state
  return {
    _id: this._id,
    context: this.context,
    text: this.text,
    note: this.note,
    originator: this.originator.reduce(),
    class: this.class.reduce(),
    state: keepState ? this.state : undefined,
  };
};

export default model("Quote", QuoteSchema, "quotes");
