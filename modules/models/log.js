import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const LogSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["User", "Quote", "Tag"],
  },
  action: {
    type: String,
    required: true,
    enum: [
      "draft",
      "request",
      "cancel",
      "approve",
      "reject",
      "delete",
      "create",
      "update",
    ],
    validate: {
      validator: function (v) {
        if (this.type !== "Quote") {
          return ["create", "update", "delete"].includes(v);
        }
      },
    },
  },

  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  before: {
    type: Types.ObjectId,
    refPath: "type",
    required: function () {
      ["update", "delete"].includes(this.action);
    },
    validate: {
      validator: function (v) {
        return ["update", "delete"].includes(this.action)
          ? v !== null
          : v === null;
      },
    },
  },
  item: {
    type: Types.ObjectId,
    refPath: "type",
    required: function () {
      return this.type !== "User";
    },
    validate: {
      validator: function (v) {
        return this.type !== "User" ? v !== null : v === null;
      },
    },
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

export default model("Log", LogSchema, "logs");
