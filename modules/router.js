import express from "express";
import { asyncUtil } from "./middleware.js";
import * as auth from "./auth.js";

const router = express.Router();

// Auth
router.post(
  "/login",
  asyncUtil(async (req, res) => {
    let user = await auth.login(req.body);
    let token = auth.getToken(user);
    res.json({
      token,
    });
  })
);

router.post(
  "/register",
  asyncUtil(async (req, res) => {
    let user = await auth.register(req.body);
    let token = auth.getToken(user);
    res.status(201).json({
      token,
    });
  })
);

export default router;
