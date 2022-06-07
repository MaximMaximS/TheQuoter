import { Schema, Types, model, Document } from "mongoose";
import Class, { IReducedClass } from "./class";
import Person, { IReducedPerson } from "./person";
import idValidator from "mongoose-id-validator";
import { ServerError } from "../errors";

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
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IQuote) {
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
  const classDoc = await Class.findById(this.class);
  const originatorDoc = await Person.findById(this.originator);
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
