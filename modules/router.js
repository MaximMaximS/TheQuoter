import express from "express";
import { asyncUtil } from "./middleware.js";
import * as auth from "./auth.js";
/*
import { verifyToken } from "./middleware.js";
import Quote from "./models/quote.js";
import { ServerError } from "./errors.js";
*/

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
router.get("/quotes", verifyToken, (req, res, next) => {
  const { text, originator } = req.query;
  // OR
  Quote.find({ originator: { $regex: `/${originator}/` } }, (err, quotes) => {
    if (err) {
      next(new ServerError(err));
    } else {
      res.json({ quotes });
    }
  });
});
*/

export default router;
