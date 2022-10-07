import { Document, Error, Model, Schema, Types, model } from "mongoose";
import mongooseIdValidator from "mongoose-id-validator2";
import { ConflictError, ServerError } from "../errors";
import Class, { IPreparedClass } from "./class";
import Person, { IPreparedPerson } from "./person";
import type { UserType } from "./user";

type State = "pending" | "public";
type Operation = "create" | "view" | "edit" | "publish" | "delete";

interface IQuote {
  state: State;
  context: string | undefined;
  text: string;
  note: string | undefined;
  originator: Types.ObjectId;
  class: Types.ObjectId | undefined;
  createdBy: Types.ObjectId;
  approvedBy: Types.ObjectId | undefined;
  likes: Types.ObjectId[];
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
  likes: number;
  liked: boolean;
}

interface IQuoteMethods {
  prepare(user: UserType): Promise<IPreparedQuote>;
  can(user: UserType, opertation: Operation): boolean;
  like(user: UserType, remove?: boolean): Promise<void>;
}

type QuoteModel = Model<IQuote, unknown, IQuoteMethods>;

export type QuoteType = Document<Types.ObjectId, unknown, IQuote> &
  IQuote & { _id: Types.ObjectId } & IQuoteMethods;

const QuoteSchema = new Schema<IQuote, QuoteModel, IQuoteMethods>(
  {
    state: {
      type: String,
      enum: ["pending", "public"],
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
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

QuoteSchema.method<IQuote & { _id: Types.ObjectId }>(
  "prepare",
  async function (user: UserType) {
    const classDoc = await Class.findById(this.class).exec();
    const originatorDoc = await Person.findById(this.originator).exec();
    if (originatorDoc === null) {
      throw new ServerError(
        `Orginator for quote ${this._id.toString()} not found`
      );
    }
    const doc: IPreparedQuote = {
      _id: this._id,
      context: this.context,
      text: this.text,
      note: this.note,
      originator: originatorDoc.prepare(),
      class: classDoc !== null ? classDoc.prepare() : undefined,
      state: this.state,
      likes: this.likes.length,
      liked: this.likes.includes(user._id),
    };
    return doc;
  }
);

// Cognitive Complexity ._.
function canModerator(
  user: UserType,
  quote: IQuote,
  operation: "create" | "view" | "edit" | "delete"
) {
  switch (operation) {
    case "create": {
      return (
        (quote.state === "public" && quote.class === user.class) ||
        (quote.state === "pending" && quote.class === undefined)
      );
    }

    case "view": {
      return (
        (quote.state === "public" &&
          (quote.class === undefined || quote.class === user.class)) ||
        (quote.state === "pending" &&
          (quote.class === user.class || quote.originator === user._id))
      );
    }

    default: {
      return (
        quote.state === "pending" &&
        (quote.class === user.class || quote.originator === user._id)
      );
    }
  }
}

function canUser(
  user: UserType,
  quote: IQuote,
  operation: "create" | "view" | "edit" | "delete"
) {
  switch (operation) {
    case "create": {
      return (
        quote.state === "pending" &&
        (quote.class === user.class || quote.class === undefined)
      );
    }
    case "view": {
      return (
        (quote.state === "public" &&
          (quote.class === user.class || quote.class === undefined)) ||
        (quote.state === "pending" && quote.originator === user._id)
      );
    }

    default: {
      return quote.state === "pending" && quote.originator === user._id;
    }
  }
}

// Permissions resolver
QuoteSchema.method<IQuote>(
  "can",
  function (user: UserType, operation: Operation) {
    if (user.role === "admin") {
      return true;
    }
    if (user.role === "guest") {
      return this.state === "public" && this.class === undefined;
    }
    if (operation === "publish") {
      return (
        user.role === "moderator" &&
        this.state === "pending" &&
        this.class === user.class
      );
    }
    if (user.role === "moderator") {
      return canModerator(user, this, operation);
    }
    return canUser(user, this, operation);
  }
);

QuoteSchema.method<QuoteType>(
  "like",
  async function (user: UserType, remove = false) {
    if (remove) {
      this.likes = this.likes.filter((id) => !id.equals(user._id));
    } else {
      this.likes.push(user._id);
    }
    try {
      await this.save();
    } catch (error) {
      if (
        error instanceof Error.ValidationError &&
        error.message.includes("Invalid ID")
      ) {
        throw new ConflictError("user");
      }

      throw error;
    }
  }
);

QuoteSchema.plugin(mongooseIdValidator, {
  message: "Invalid ID",
});

export default model<IQuote, QuoteModel>("Quote", QuoteSchema, "quotes");
