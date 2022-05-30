import express from "express";
import * as auth from "./auth.js";

import { asyncUtil } from "./middleware.js";

const router = express.Router();

// Auth
router.post(
  "/auth/login",
  asyncUtil(async (req, res) => {
    let user = await auth.login(req.body);
    let token = auth.getToken(user);
    res.json({
      token,
    });
  })
);

router.post(
  "/auth/register",
  asyncUtil(async (req, res) => {
    let user = await auth.register(req.body);
    let token = auth.getToken(user);
    res.status(201).json({
      token,
    });
  })
);

/*
// GET quotes
router.get(
  "/quotes",
  verifyToken,
  asyncUtil(async (req, res, next) => {
    const { text, originator, state } = req.query;
    let query = {};
    if (text) {
      if (typeof text !== "string") {
        return next(new errors.ValidatorError("text", "notstring"));
      }
      if (text.length < 3) {
        return next(new errors.ValidatorError("text", "minlength"));
      }
      query.text = { $regex: text, $options: "i" };
    }
    if (originator) {
      if (typeof originator !== "string") {
        return next(new errors.ValidatorError("originator", "notstring"));
      }
      if (originator.length < 3) {
        return next(new errors.ValidatorError("originator", "minlength"));
      }
      try {
        const tags = await Tag.find({
          name: { $regex: originator, $options: "i" },
          type: "teacher",
        });
        const tagIds = tags.map((tag) => tag._id);
        query.originator = { $in: tagIds };
      } catch (err) {
        return next(new errors.ServerError(err));
      }
    }
    if (state) {
      if (typeof state !== "string") {
        return next(new errors.ValidatorError("state", "notstring"));
      }
      if (["approved", "pending", "rejected"].indexOf(state) === -1) {
        return next(new errors.ValidatorError("state", "invalid"));
      }
      if (state === "approved") {
        query.state = "approved";
      } else {
        if (!req.user) {
          return next(new errors.ValidatorError("state", "notallowed"));
        }
        let written = await Log.find({
          type: "Quote",
          action: "create",
          user: req.user._id,
        });
        written = written.map((log) => log.item);
        query._id = { $in: written };
        query.state = state;
      }
    } else {
      query.state = "approved";
    }

    // Find quotes containing the text
    Quote.find(query).then((quotes) => {
      if (quotes.length === 0) {
        return next(new errors.NotFoundError());
      }
      quotes = quotes.map((quote) => quote._id);
      res.json({ quotes });
    });
  })
);

router.get(
  "/quotes/:id",
  verifyToken,
  asyncUtil(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new errors.ValidatorError("id", "notobjectid"));
    }
    const quote = await Quote.findById(id);
    if (!quote) {
      return next(new errors.NotFoundError());
    }
    if 
    delete quote.archived;
    delete quote.__v;

    res.json({ quote });
  })
);

// Create quote
router.post(
  "/quotes",
  verifyToken,
  asyncUtil(async (req, res, next) => {
    // Check if the user is logged in
    const user = req.user;
    if (!user) {
      return next(new errors.IncorrectLoginError());
    }
    const quote = await Quote.create(req.body);
    await Log.create({
      type: "Quote",
      action: "create",
      user: user._id,
      item: quote._id,
    });

    res.status(201).json({
      quote,
    });
  })
);

// Update quote
router.patch(
  "/quotes/:id",
  verifyToken,
  asyncUtil(async (req, res) => {
    res.sendStatus(501);
  })
);

// Delete quote
router.delete(
  "/quote/:id",
  verifyToken,
  asyncUtil(async (req, res) => {
    res.sendStatus(501);
  })
);

*/

export default router;
