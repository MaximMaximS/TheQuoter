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
  publishRoute,
  randomQuoteRoute,
  searchQuotesRoute,
} from "./routes/quotes";
import {
  approveGuest,
  getUserRoute,
  listGuests,
  loginUserRoute,
  registerUserRoute,
} from "./routes/users";
import { methodNotAllowed } from "./middleware";

const router = Router();

// /register
router
  .route("/register")
  // Register a new user
  .post(asyncMiddleware(registerUserRoute))
  .all(methodNotAllowed);

router
  .route("/login")
  // Login
  .post(asyncMiddleware(loginUserRoute))
  .all(methodNotAllowed);

router
  .route("/guests")
  // List all guests that have pending class
  .get(asyncMiddleware(listGuests))
  .all(methodNotAllowed);

router
  .route("/users/:id")
  .get(asyncMiddleware(getUserRoute))
  .all(methodNotAllowed);

router
  .route("/users/:id/approve")
  .post(asyncMiddleware(approveGuest))
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
  .route("/randquote")
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
  .route("/quotes/:id/publish")
  .post(asyncMiddleware(publishRoute))
  .all(methodNotAllowed);

// It's 5!
router.route("/its5").all(its5Route);

// Echo (development only)
router.route("/echo").all(echoRoute);

// Nothing
router.route("/").all(susRoute);

export default router;
