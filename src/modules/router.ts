import express, { Request, Response } from "express";
import asyncMiddleware from "middleware-async";
import { enforceRole, getUser, methodNotAllowed } from "./middleware";
import { extractFromUnknownObject } from "./utils";
import * as users from "./routes/users";
import * as classes from "./routes/classes";
import * as people from "./routes/people";
import * as quotes from "./routes/quotes";
import { IncorrectLoginError, ServerError } from "./errors";
import { Types } from "mongoose";

const router = express.Router();

// Users Register
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

// Users Login
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
      res.json({ classes: classesFound });
    })
  )
  .post(
    asyncMiddleware(enforceRole("admin")),
    asyncMiddleware(async (req, res) => {
      const classCreated = await classes.create(
        req.body.name,
        await getUser(req.headers.authorization)
      );
      res.status(201).json(classCreated);
    })
  )
  .all(methodNotAllowed);

// People
router
  .route("/people")
  .get(
    // Query people
    asyncMiddleware(async (req, res) => {
      const peopleFound = await people.search(
        extractFromUnknownObject(req.query, "name"),
        extractFromUnknownObject(req.query, "type")
      );
      res.json({ people: peopleFound });
    })
  )
  .post(
    // New person
    asyncMiddleware(enforceRole("admin")),
    asyncMiddleware(async (req, res) => {
      const personCreated = await people.create(
        req.body.name,
        req.body.type,
        req.user
      );
      res.status(201).json(personCreated);
    })
  )
  .all(methodNotAllowed);

// Quotes
router
  .route("/quotes")
  .get(
    // Query
    asyncMiddleware(enforceRole("user")),
    asyncMiddleware(async (req, res) => {
      let state = req.query.state;
      // Approved is fine, but if it's not, we need to check if the user is an admin
      if (state !== "approved") {
        if (typeof state !== "string") {
          state = "approved";
        } else {
          if (req.user === null) {
            throw new ServerError("This should never happen");
          }
          // TODO: Permissions
          throw new IncorrectLoginError();
        }
      }

      // Parsing the query
      const originatorId =
        typeof req.query.originator === "string" ? req.query.originator : null;

      const classId =
        typeof req.query.class === "string" ? req.query.class : null;

      const text = typeof req.query.text === "string" ? req.query.text : null;

      const quotesFound = await quotes.search(
        originatorId !== null ? new Types.ObjectId(originatorId) : null,
        classId !== null ? new Types.ObjectId(classId) : null,
        text,
        state
      );

      res.json({ quotes: quotesFound }); // Send the found enteries
    })
  )
  .all(methodNotAllowed);

export default router;
