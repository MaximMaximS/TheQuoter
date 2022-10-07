import cors from "cors";
import express from "express";
import ratelimit from "express-rate-limit";
import slowdown from "express-slow-down";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware";
import router from "./router";
import { number } from "./utils";

const app = express();

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (
  process.env["NODE_ENV"] !== "development" &&
  process.env["NODE_ENV"] !== "test"
) {
  // Rate limiting
  const RATELIMIT_WINDOW_MS = number(
    process.env["RATELIMIT_WINDOW_MS"],
    "RATELIMIT_WINDOW_MS"
  );
  const RATELIMIT_DELAY_AFTER = number(
    process.env["RATELIMIT_DELAY_AFTER"],
    "RATELIMIT_DELAY_AFTER"
  );
  const RATELIMIT_DELAY_MS = number(
    process.env["RATELIMIT_DELAY_MS"],
    "RATELIMIT_DELAY_MS"
  );
  const RATELIMIT_MAX = number(process.env["RATELIMIT_MAX"], "RATELIMIT_MAX");

  // Slowdown every request after 100 requests in 5 minutes
  app.use(
    slowdown({
      windowMs: RATELIMIT_WINDOW_MS,
      delayAfter: RATELIMIT_DELAY_AFTER,
      delayMs: RATELIMIT_DELAY_MS,
    })
  );

  // Ignore all requests after 200 requests in 5 minutes
  app.use(
    ratelimit({
      windowMs: RATELIMIT_WINDOW_MS,
      max: RATELIMIT_MAX,
    })
  );
}

// Routes
app.use(router);

// Error handling
app.use(errorHandler);

// Send plain text 404 for all other routes
app.use(notFound);

export default app;
