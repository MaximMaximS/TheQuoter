import express, { Request, Response } from "express";
import asyncMiddleware from "middleware-async";
import * as auth from "./routes/auth";
import * as classes from "./routes/classes";
import { enforceRole } from "./middleware";
import { extractFromUnknownObject } from "./utils";

const router = express.Router();

// Auth
router.post(
  "/auth/login",
  asyncMiddleware(async (req: Request, res: Response) => {
    const user = await auth.login(req.body);
    const token = auth.getToken(user);
    res.json({
      token,
    });
  })
);

router.post(
  "/auth/register",
  asyncMiddleware(async (req: Request, res: Response) => {
    const user = await auth.register(req.body);
    const token = auth.getToken(user);
    res.status(201).json({
      token,
    });
  })
);

// Classes
router.get(
  "/classes",
  asyncMiddleware(async (req, res) => {
    const classesFound = await classes.search(extractFromUnknownObject(req.query, "name"));
    res.json({ classesFound });
  })
);

router.post(
  "/classes",
  asyncMiddleware(enforceRole("admin")),
  asyncMiddleware(async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const classCreated = await classes.create(req.body.name, req.user!);
    res.status(201).json(classCreated);
  })
);

export default router;
