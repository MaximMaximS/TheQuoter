import { Document, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import { ServerError } from "../errors";
import Class, { IReducedClass } from "./class";
import Person, { IReducedPerson } from "./person";

export interface IReducedQuote {
  _id: Types.ObjectId;
  context?: string;
  text: string;
  note?: string;
  originator: IReducedPerson;
  class?: IReducedClass;
  state: "pending" | "public";
}

export interface IQuote extends Document {
  state: "pending" | "public";
  context?: string;
  text: string;
  note?: string;
  originator: Types.ObjectId;
  class?: Types.ObjectId;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  reduce(): Promise<IReducedQuote>;
}

const QuoteSchema = new Schema<IQuote>(
  {
    state: {
      type: String,
      enum: ["pending", "public"],
      required: true,
    },
    context: {
      type: String,
      maxlength: 70,
      trim: true,
      // No empty string
      validate: {
        validator: (v: string) => v !== "",
        message: "Note cannot be empty",
      },
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
      // No empty string
      validate: {
        validator: (v: string) => v !== "",
        message: "Note cannot be empty",
      },
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
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required(this: IQuote) {
        return this.state === "public";
      },
    },
  },
  {
    timestamps: true,
  }
);

QuoteSchema.plugin(idValidator);

QuoteSchema.methods.reduce = async function (): Promise<IReducedQuote> {
  // Keep only id, context, text, note, originator, class, and optionally state
  const classDoc = await Class.findById(this.class).exec();
  const originatorDoc = await Person.findById(this.originator).exec();
  if (originatorDoc === null) {
    throw new ServerError("Not found");
  }
  const doc: IReducedQuote = {
    _id: this._id,
    context: this.context,
    text: this.text,
    note: this.note,
    originator: originatorDoc.reduce(),
    class: classDoc !== null ? classDoc.reduce() : undefined,
    state: this.state,
  };
  return doc;
};

export default model("Quote", QuoteSchema, "quotes");
