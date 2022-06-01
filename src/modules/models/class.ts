import { Schema, Types, model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import idValidator from "mongoose-id-validator";

export interface IReducedClass {
  _id: Types.ObjectId;
  name: string;
}

export interface IClass extends Document {
  name: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  reduce(): IReducedClass;
}

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      maxlength: 8,
      trim: true,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ClassSchema.methods.reduce = function (): IReducedClass {
  return {
    _id: this._id,
    name: this.name,
  };
};

ClassSchema.plugin(uniqueValidator);
ClassSchema.plugin(idValidator);

export default model("Class", ClassSchema, "classes");
