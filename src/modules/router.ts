/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import asyncMiddleware from "middleware-async";
import { auth0test, echoRoute, its5Route, susRoute } from "./routes/misc";
import { checkJwt } from "./middleware";

const router = Router();

// It's 5!
router.route("/its5").all(its5Route);

// Echo (development only)
router.route("/echo").all(echoRoute);

// Nothing
router.route("/").all(susRoute);

router.route("/authtest").all(checkJwt, asyncMiddleware(auth0test));

export default router;
