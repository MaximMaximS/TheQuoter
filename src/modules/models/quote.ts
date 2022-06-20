import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import { ServerError } from "../errors";
import Class, { IReducedClass } from "./class";
import Person, { IReducedPerson } from "./person";

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
    unique: true,
  },
});

ReactionSchema.plugin(idValidator);

function countLikes(arr: IReaction[]): number {
  return arr.filter((el) => el.like).length;
}

interface IComment {
  text: string;
  user: Types.ObjectId;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

interface ICommentMethods {
  resolveLikes(): number;
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
  return countLikes(this.reactions);
});

export type State = "pending" | "public" | "archived";

interface IQuote {
  state: State;
  context?: string;
  text: string;
  note?: string;
  originator: Types.ObjectId;
  class?: Types.ObjectId;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReducedQuote {
  _id: Types.ObjectId;
  context?: string;
  text: string;
  note?: string;
  originator: IReducedPerson;
  class?: IReducedClass;
  state: State;
}

interface IQuoteMethodsAndOverrides {
  reduce(): Promise<IReducedQuote>;
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
  "reduce",
  async function () {
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
  }
);

QuoteSchema.method<IQuote>("resolveLikes", function () {
  return countLikes(this.reactions);
});

QuoteSchema.plugin(idValidator);

export default model<IQuote, QuoteModel>("Quote", QuoteSchema, "quotes");
