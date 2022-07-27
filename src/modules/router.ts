import { Router } from "express";
import asyncMiddleware from "middleware-async";
import {
  createClassRoute,
  getClassRoute,
  searchClassesRoute,
} from "./routes/classes";
import { echoRoute, its5Route, susRoute } from "./routes/misc";
import {
  createPersonRoute,
  getPersonRoute,
  searchPeopleRoute,
} from "./routes/people";
import {
  createQuoteRoute,
  deleteQuoteRoute,
  editQuoteRoute,
  getQuoteRoute,
  randomQuoteRoute,
  searchQuotesRoute,
  setQuoteStateRoute,
} from "./routes/quotes";
import {
  deleteUserRoute,
  getUserRoute,
  loginUserRoute,
  registerUserRoute,
} from "./routes/users";
import { methodNotAllowed } from "./middleware";

const router = Router();

router
  .route("/users")
  // Register
  .post(asyncMiddleware(registerUserRoute))
  // Delete OWN user (development only)
  .delete(asyncMiddleware(deleteUserRoute))
  .all(methodNotAllowed);

router.route("/users/:id").get(asyncMiddleware(getUserRoute));

router
  .route("/users/login")
  // Login
  .post(asyncMiddleware(loginUserRoute))
  .all(methodNotAllowed);

router
  .route("/classes")
  // Search classes
  .get(asyncMiddleware(searchClassesRoute))
  // Create a class
  .post(asyncMiddleware(createClassRoute))
  .all(methodNotAllowed);

router
  .route("/classes/:id")
  // Get class
  .get(asyncMiddleware(getClassRoute))
  .all(methodNotAllowed);

router
  .route("/people")
  // Search people
  .get(asyncMiddleware(searchPeopleRoute))
  // Create person
  .post(asyncMiddleware(createPersonRoute))
  .all(methodNotAllowed);

router
  .route("/people/:id")
  // Get person
  .get(asyncMiddleware(getPersonRoute))
  .all(methodNotAllowed);

router
  .route("/quotes")
  // Search quotes
  .get(asyncMiddleware(searchQuotesRoute))
  // Create quote
  .post(asyncMiddleware(createQuoteRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/random")
  // Get random quote
  .get(asyncMiddleware(randomQuoteRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id")
  // Get a quote by id
  .get(asyncMiddleware(getQuoteRoute))
  // Edit a quote
  .put(asyncMiddleware(editQuoteRoute))
  // Delete a quote
  .delete(asyncMiddleware(deleteQuoteRoute))
  .all(methodNotAllowed);

router
  .route("/quotes/:id/state")
  .post(asyncMiddleware(setQuoteStateRoute))
  .all(methodNotAllowed);

// It's 5!
router.route("/its5").all(its5Route);

// Echo (development only)
router.route("/echo").all(echoRoute);

// Nothing
router.route("/").all(susRoute);

export default router;
