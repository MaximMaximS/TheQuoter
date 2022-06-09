import { Router } from "express";
import asyncMiddleware from "middleware-async";
import * as classes from "./routes/classes";
import * as people from "./routes/people";
import * as quotes from "./routes/quotes";
import * as users from "./routes/users";
import { methodNotAllowed } from "./middleware";

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
  .get(asyncMiddleware(classes.searchRoute))
  // Create class
  .post(asyncMiddleware(classes.createRoute))
  .all(methodNotAllowed);

router
  .route("/classes/:id")
  // Get class
  .get(asyncMiddleware(classes.getRoute))
  .all(methodNotAllowed);

router
  .route("/people")
  // Search people
  .get(asyncMiddleware(people.searchRoute))
  // Create person
  .post(asyncMiddleware(people.createRoute))
  .all(methodNotAllowed);

router
  .route("/people/:id")
  // Get person
  .get(asyncMiddleware(people.getRoute))
  .all(methodNotAllowed);

router
  .route("/quotes")
  // Search quotes
  .get(asyncMiddleware(quotes.searchRoute))
  // Create quote
  .post(asyncMiddleware(quotes.createRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id")
  // Get quote
  .get(asyncMiddleware(quotes.getRoute))
  // Edit quote
  .put(asyncMiddleware(quotes.editRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id/state")
  .post(asyncMiddleware(quotes.stateRoute))
  .all(methodNotAllowed);

export default router;
