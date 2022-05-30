import express, { Request, Response } from "express";
import * as auth from "./auth";

import { asyncUtil } from "./middleware";

const router = express.Router();

// Auth
router.post(
  "/auth/login",
  asyncUtil(async (req: Request, res: Response) => {
    const user = await auth.login(req.body);
    const token = auth.getToken(user);
    res.json({
      token,
    });
  })
);

router.post(
  "/auth/register",
  asyncUtil(async (req: Request, res: Response) => {
    const user = await auth.register(req.body);
    const token = auth.getToken(user);
    res.status(201).json({
      token,
    });
  })
);

export default router;
