import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import helmet from "helmet";
import slowdown from "express-slow-down";
import ratelimit from "express-rate-limit";
import { errorHandler, notFound } from "./modules/middleware";
import router from "./modules/router";

main();

async function main() {
  if (process.env.MONGODB_URI === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const PORT = process.env.PORT || 3000;

  const app = express();

  // Security headers
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Slowdown every request after 100 requests in 5 minutes
  app.use(
    slowdown({
      windowMs: 5 * 60 * 1000,
      delayAfter: 100,
      delayMs: 500,
    })
  );

  // Ignore all requests after 200 requests in 5 minutes
  app.use(
    ratelimit({
      windowMs: 5 * 60 * 1000,
      max: 200,
    })
  );

  // Routes
  app.use(router);

  // Error handling
  app.use(errorHandler);

  // Send plain text 404 for all other routes
  app.use(notFound);

  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
