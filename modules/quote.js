import * as errors from "./errors.js";
import Log from "./models/log.js";
import Tag from "./models/tag.js";
import Quote from "./models/quote.js";

export function search(query, user) {
  return new Promise((resolve, reject) => {
    const { text, originator, state } = query;
    let pattern = {};
    if (text) {
      if (typeof text !== "string") {
        return reject(new errors.ValidatorError("text", "notstring"));
      }
      if (text.length < 3) {
        return reject(new errors.ValidatorError("text", "minlength"));
      }
      pattern.text = { $regex: text, $options: "i" };
    }
    if (originator) {
      if (typeof originator !== "string") {
        return reject(new errors.ValidatorError("originator", "notstring"));
      }
      if (originator.length < 3) {
        return reject(new errors.ValidatorError("originator", "minlength"));
      }
      try {
        const tags = Tag.find({
          name: { $regex: originator, $options: "i" },
          type: "teacher",
        });
        const tagIds = tags.map((tag) => tag._id);
        pattern.originator = { $in: tagIds };
      } catch (err) {
        return reject(new errors.ServerError(err));
      }
    }
    if (state) {
      if (typeof state !== "string") {
        return reject(new errors.ValidatorError("state", "notstring"));
      }
      if (["approved", "pending", "rejected"].indexOf(state) === -1) {
        return reject(new errors.ValidatorError("state", "invalid"));
      }
      if (state === "approved") {
        pattern.state = "approved";
      } else {
        if (!user) {
          return reject(new errors.ValidatorError("state", "notallowed"));
        }
        let written = Log.find({
          type: "Quote",
          action: "create",
          user: user._id,
        });
        written = written.map((log) => log.item);
        pattern._id = { $in: written };
        pattern.state = state;
      }
    } else {
      pattern.state = "approved";
    }

    // Find quotes containing the text
    Quote.find(pattern).then((quotes) => {
      if (quotes.length === 0) {
        return reject(new errors.NotFoundError());
      }
      quotes = quotes.map((quote) => quote._id);
      return resolve({ quotes });
    });
  });
}
