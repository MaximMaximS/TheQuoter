import { Schema, Types, model, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface IPerson extends Document{
  name: string;
  type: "teacher";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ["teacher" /*"student", "other"*/],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PersonSchema.plugin(uniqueValidator);

export default model("Person", PersonSchema, "people");
