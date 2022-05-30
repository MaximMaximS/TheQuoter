import { Schema, Types, model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface IClass extends Document {
  name: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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

ClassSchema.plugin(uniqueValidator);

export default model("Class", ClassSchema, "classes");
