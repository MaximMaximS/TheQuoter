import "dotenv/config";
import mongoose from "mongoose";
import app from "./modules/app";
import { number } from "./modules/utils";

async function main() {
  const PORT = number(process.env["PORT"], "PORT");
  // No args - all arg passes with ENViroment
  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env["MONGODB_URI"]);

  // Run the server
  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

void main(); // Entry point
