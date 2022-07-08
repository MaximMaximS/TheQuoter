import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import { ServerError } from "../errors";
import Class, { IPreparedClass } from "./class";
import Person, { IPreparedPerson } from "./person";

interface IReaction {
  like: boolean;
  user: Types.ObjectId;
}

type ReactionModel = Model<IReaction>;

const ReactionSchema = new Schema<IReaction, ReactionModel>({
  like: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

ReactionSchema.plugin(idValidator);

interface IComment {
  text: string;
  user: Types.ObjectId;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

interface ICommentMethods {
  resolveLikes(): number;

  reactions: Types.DocumentArray<IReaction>;
}

type CommentModel = Model<IComment, unknown, ICommentMethods>;

const CommentSchema = new Schema<IComment, CommentModel, ICommentMethods>(
  {
    text: {
      type: String,
      maxlength: 256,
      trim: true,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

CommentSchema.plugin(idValidator);

CommentSchema.method<IComment>("resolveLikes", function () {
  return this.reactions.filter((el) => el.like).length;
});

export type State = "pending" | "public" | "archived";

interface IQuote {
  state: State;
  context?: string | undefined;
  text: string;
  note?: string | undefined;
  originator: Types.ObjectId;
  class?: Types.ObjectId | undefined;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId | undefined;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPreparedQuote {
  _id: Types.ObjectId;
  context: string | undefined;
  text: string;
  note: string | undefined;
  originator: IPreparedPerson;
  class: IPreparedClass | undefined;
  state: State;
}

interface IQuoteMethodsAndOverrides {
  prepare(): Promise<IPreparedQuote>;
  resolveLikes(): number;

  reactions: Types.DocumentArray<IReaction>;
}

type QuoteModel = Model<IQuote, unknown, IQuoteMethodsAndOverrides>;

export type QuoteType = Document<Types.ObjectId, unknown, IQuote> &
  IQuote & { _id: Types.ObjectId } & IQuoteMethodsAndOverrides;

const QuoteSchema = new Schema<IQuote, QuoteModel, IQuoteMethodsAndOverrides>(
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
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

QuoteSchema.method<IQuote & { _id: Types.ObjectId }>(
  "prepare",
  async function () {
    const classDoc = await Class.findById(this.class).exec();
    const originatorDoc = await Person.findById(this.originator).exec();
    if (originatorDoc === null) {
      throw new ServerError(`Orginator for quote ${this._id} not found`);
    }
    const doc: IPreparedQuote = {
      _id: this._id,
      context: this.context,
      text: this.text,
      note: this.note,
      originator: originatorDoc.prepare(),
      class: classDoc !== null ? classDoc.prepare() : undefined,
      state: this.state,
    };
    return doc;
  }
);

QuoteSchema.method<IQuote>("resolveLikes", function () {
  return this.reactions.filter((el) => el.like).length;
});

QuoteSchema.plugin(idValidator);

export default model<IQuote, QuoteModel>("Quote", QuoteSchema, "quotes");
