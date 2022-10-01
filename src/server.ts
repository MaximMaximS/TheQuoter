import "dotenv/config";
import ratelimit from "express-rate-limit";
import slowdown from "express-slow-down";
import mongoose from "mongoose";
import app from "./modules/app";
import { number } from "./modules/utils";

async function main() {
  const PORT = number(process.env["PORT"], "PORT");
  // No args - all arg passes with ENViroment
  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

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

  await mongoose.connect(process.env["MONGODB_URI"]);

  // Run the server
  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

void main(); // Entry point
