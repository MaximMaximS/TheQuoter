import { Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";

export interface IReducedPerson {
  _id: Types.ObjectId;
  name: string;
  type: string;
}

interface IPerson {
  name: string;
  type: "teacher" | "student" | "other";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IPersonMethods {
  reduce(): IReducedPerson;
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PersonSchema.method("reduce", function (): IReducedPerson {
  return {
    _id: this._id,
    name: this.name,
    type: this.type,
  };
});

PersonSchema.plugin(uniqueValidator);
PersonSchema.plugin(idValidator);

export default model<IPerson, PersonModel>("Person", PersonSchema, "people");
