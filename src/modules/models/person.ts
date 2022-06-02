import { Schema, Types, model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import idValidator from "mongoose-id-validator";

export interface IReducedPerson {
  _id: Types.ObjectId;
  name: string;
  type: string;
}

export interface IPerson extends Document {
  name: string;
  type: "teacher" | "student" | "other";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  reduce(): IReducedPerson;
}

const PersonSchema = new Schema<IPerson>(
  {
    name: {
      type: String,
      maxlength: 32,
      trim: true,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["teacher", "student", "other"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PersonSchema.methods.reduce = function (): IReducedPerson {
  return {
    _id: this._id,
    name: this.name,
    type: this.type,
  };
};

PersonSchema.plugin(uniqueValidator);
PersonSchema.plugin(idValidator);

export default model("Person", PersonSchema, "people");
