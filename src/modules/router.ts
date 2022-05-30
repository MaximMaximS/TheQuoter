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


export default router;
