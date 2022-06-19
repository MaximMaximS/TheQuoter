import { Model, Schema, Types, model } from "mongoose";
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

interface IQuote {
  state: "pending" | "public" | "archived";
  context?: string;
  text: string;
  note?: string;
  originator: Types.ObjectId;
  class?: Types.ObjectId;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IQuoteMethods {
  reduce(): Promise<IReducedQuote>;
}

type QuoteModel = Model<IQuote, unknown, IQuoteMethods>;

const QuoteSchema = new Schema<IQuote, QuoteModel, IQuoteMethods>(
  {
    state: {
      type: String,
      enum: ["pending", "public", "archived"],
      default: "pending",
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

QuoteSchema.method("reduce", async function () {
  const classDoc = await Class.findById(this.class).exec();
  const originatorDoc = await Person.findById(this.originator).exec();
  if (originatorDoc === null) {
    throw new ServerError(`Orginator for quote ${this._id} not found`);
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
});

QuoteSchema.plugin(idValidator);

export default model<IQuote, QuoteModel>("Quote", QuoteSchema, "quotes");
