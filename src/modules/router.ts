/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { auth0test, susRoute } from "./routes/misc";
import { checkJwt } from "./middleware";

const router = Router();

/**
router
  .route("/account")
  // Get the user's own profile
  .get(asyncMiddleware(getProfileRoute))
  .all(methodNotAllowed);

// /register
router
  .route("/account/register")
  // Register a new user
  .post(asyncMiddleware(registerUserRoute))
  .all(methodNotAllowed);

router
  .route("/account/login")
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

// Like a quote
router
  .route("/quotes/:id/like")
  .post(asyncMiddleware(likeQuoteRoute))
  .all(methodNotAllowed);

// It's 5!
router.route("/its5").all(its5Route);

// Echo (development only)
router.route("/echo").all(echoRoute);
*/

// Nothing
router.route("/").all(susRoute);

router.route("/authtest").all(checkJwt, auth0test);

export default router;
