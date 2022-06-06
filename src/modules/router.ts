import { Router } from "express";
import asyncMiddleware from "middleware-async";
import { methodNotAllowed } from "./middleware";
import * as users from "./routes/users";
import * as classes from "./routes/classes";
import * as people from "./routes/people";
import * as quotes from "./routes/quotes";

const router = Router();

router
  .route("/users")
  // Register
  .post(asyncMiddleware(users.registerRoute))
  .all(methodNotAllowed);

router
  .route("/users/login")
  // Login
  .post(asyncMiddleware(users.loginRoute))
  .all(methodNotAllowed);

router
  .route("/classes")
  // Search classes
  .get(asyncMiddleware(classes.getRoute))
  // Create class
  .post(asyncMiddleware(classes.postRoute))
  .all(methodNotAllowed);

router
  .route("/people")
  // Search people
  .get(asyncMiddleware(people.getRoute))
  // Create person
  .post(asyncMiddleware(people.postRoute))
  .all(methodNotAllowed);

router
  .route("/quotes")
  // Search quotes
  .get(asyncMiddleware(quotes.getRoute))
  // Create quote
  .post(asyncMiddleware(quotes.postRoute))
  .all(methodNotAllowed);

export default router;
