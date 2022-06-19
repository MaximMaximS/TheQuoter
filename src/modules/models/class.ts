import { Document, Model, Schema, Types, model } from "mongoose";
import idValidator from "mongoose-id-validator";
import uniqueValidator from "mongoose-unique-validator";

export interface IReducedClass {
  _id: Types.ObjectId;
  name: string;
}

interface IClass {
  name: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IClassMethods {
  reduce(): IReducedClass;
}

type ClassModel = Model<IClass, unknown, IClassMethods>;

const ClassSchema = new Schema<IClass, ClassModel, IClassMethods>(
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

ClassSchema.method("reduce", function (): IReducedClass {
  return {
    _id: this._id,
    name: this.name,
  };
});

ClassSchema.plugin(uniqueValidator);
ClassSchema.plugin(idValidator);

export type ClassType = Document<Types.ObjectId, unknown, IClass> &
  IClass & { _id: Types.ObjectId } & IClassMethods;

export default model<IClass, ClassModel>("Class", ClassSchema, "classes");
