import cors from "cors";
import express from "express";
import ratelimit from "express-rate-limit";
import slowdown from "express-slow-down";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware";
import router from "./router";

const app = express();

// Security headers
app.use(helmet());
app.use(cors());
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

export default app;
