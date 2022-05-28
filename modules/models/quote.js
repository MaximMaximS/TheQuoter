import mongoose from "mongoose";
import Tag from "./tag.js";
const { Schema, Types, model } = mongoose;

/*
const CommentSchema = new Schema({
  archived: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    maxlength: 500,
    required: true,
  },
  author: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
});
*/

const QuoteSchema = new Schema({
  archived: {
    type: Boolean,
    default: false,
  },
  context: {
    type: String,
    maxlength: 70,
    trim: true,
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
  },
  originator: {
    type: Types.ObjectId,
    ref: "Tag",
    required: true,
    validate: {
      validator: function () {
        return new Promise((resolve, reject) => {
          Tag.findById(this.originator, (err, tag) => {
            if (err) {
              reject(err);
            } else if (!tag) {
              reject(new Error("Tag not found"));
            } else {
              if (tag.type === "teacher") {
                resolve();
              } else {
                reject(new Error("Tag is not a teacher"));
              }
            }
          });
        });
      },
    },
  },
  class: {
    type: Types.ObjectId,
    ref: "Tag",
    validate: {
      validator: function () {
        return new Promise((resolve, reject) => {
          Tag.findById(this.originator, (err, tag) => {
            if (err) {
              reject(err);
            } else if (!tag) {
              reject(new Error("Tag not found"));
            } else {
              if (tag.type === "class") {
                resolve();
              } else {
                reject(new Error("Tag is not a class"));
              }
            }
          });
        });
      },
    },
  },
  // comments: [CommentSchema],
});

export default model("Quote", QuoteSchema, "quotes");
