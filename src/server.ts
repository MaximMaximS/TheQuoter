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

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    slowdown({
      windowMs: 5 * 60 * 1000, // 15 minutes
      delayAfter: 50,
      delayMs: 500,
    })
  );

  app.use(
    ratelimit({
      windowMs: 5 * 60 * 1000, // 15 minutes
      max: 100,
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
