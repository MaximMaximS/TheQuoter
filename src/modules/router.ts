import express, { Request, Response } from "express";
import asyncMiddleware from "middleware-async";
import * as users from "./routes/users";
import * as classes from "./routes/classes";
import * as people from "./routes/people";
import { enforceRole, methodNotAllowed } from "./middleware";
import { extractFromUnknownObject } from "./utils";

const router = express.Router();

router
  .route("/users")
  .post(
    asyncMiddleware(async (req: Request, res: Response) => {
      const user = await users.register(req.body);
      const token = users.getToken(user);
      res.status(201).json({
        token,
      });
    })
  )
  .all(methodNotAllowed);

// Users
router
  .route("/users/login")
  .post(
    asyncMiddleware(async (req: Request, res: Response) => {
      const user = await users.login(req.body);
      const token = users.getToken(user);
      res.json({
        token,
      });
    })
  )
  .all(methodNotAllowed);

// Classes
router
  .route("/classes")
  .get(
    asyncMiddleware(async (req, res) => {
      const classesFound = await classes.search(
        extractFromUnknownObject(req.query, "name")
      );
      res.json({ classesFound });
    })
  )
  .post(
    asyncMiddleware(enforceRole("admin")),
    asyncMiddleware(async (req, res) => {
      const classCreated = await classes.create(req.body.name, req.user);
      res.status(201).json(classCreated);
    })
  )
  .all(methodNotAllowed);

// People
router
  .route("/people")
  .get(
    asyncMiddleware(async (req, res) => {
      const peopleFound = await people.search(
        extractFromUnknownObject(req.query, "name"),
        extractFromUnknownObject(req.query, "type")
      );
      res.json({ peopleFound });
    })
  )
  .post(
    asyncMiddleware(enforceRole("admin")),
    asyncMiddleware(async (req, res) => {
      const classCreated = await classes.create(req.body.name, req.user);
      res.status(201).json(classCreated);
    })
  )
  .all(methodNotAllowed);

export default router;
