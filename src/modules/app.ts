import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware";
import router from "./router";

const app = express();

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);

// Error handling
app.use(errorHandler);

// Send plain text 404 for all other routes
app.use(notFound);

export default app;
