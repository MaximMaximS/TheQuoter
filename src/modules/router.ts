import { Router } from "express";
import asyncMiddleware from "middleware-async";
import * as classes from "./routes/classes";
import * as misc from "./routes/misc";
import * as people from "./routes/people";
import * as quotes from "./routes/quotes";
import * as users from "./routes/users";
import { methodNotAllowed } from "./middleware";

const router = Router();

router
  .route("/users")
  // Register
  .post(asyncMiddleware(users.registerRoute))
  // Delete OWN user (development only)
  .delete(asyncMiddleware(users.deleteRoute))
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
  // Create a class
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
  .route("/quotes/random")
  // Get random quote
  .get(asyncMiddleware(quotes.randomRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id")
  // Get a quote by id
  .get(asyncMiddleware(quotes.getRoute))
  // Edit a quote
  .put(asyncMiddleware(quotes.editRoute))
  // Delete a quote
  .delete(asyncMiddleware(quotes.deleteRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id/state")
  // Publish (TODO: change to publish)
  .post(asyncMiddleware(quotes.stateRoute))
  .all(methodNotAllowed);

// It's 5!
router.route("/its5").all(misc.its5Route);

// Echo (development only)
router.route("/echo").all(misc.echoRoute);

export default router;
