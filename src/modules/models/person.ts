import { Document, Model, Schema, Types, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

interface IPerson {
  name: string;
  type: "teacher" | "student" | "other";
  createdAt: Date;
  updatedAt: Date;
}

export interface IPreparedPerson {
  _id: Types.ObjectId;
  name: string;
  type: string;
}

interface IPersonMethods {
  prepare(): IPreparedPerson;
}

type PersonModel = Model<IPerson, unknown, IPersonMethods>;

const PersonSchema = new Schema<IPerson, PersonModel, IPersonMethods>(
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
  },
  { timestamps: true }
);

PersonSchema.method("prepare", function (): IPreparedPerson {
  return {
    _id: this._id,
    name: this.name,
    type: this.type,
  };
});

PersonSchema.plugin(uniqueValidator);

export type PersonType = Document<Types.ObjectId, unknown, IPerson> &
  IPerson & { _id: Types.ObjectId } & IPersonMethods;

export default model<IPerson, PersonModel>("Person", PersonSchema, "people");
