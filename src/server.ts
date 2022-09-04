import "dotenv/config";
import mongoose from "mongoose";
import app from "./modules/app";

let port = 3000;
if (process.env["PORT"] !== undefined) {
  port = Number.parseInt(process.env["PORT"], 10);
  if (Number.isNaN(port)) {
    throw new SyntaxError("PORT is not a number");
  }
}

async function main() {
  // No args - all arg passes with ENViroment
  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env["MONGODB_URI"]);

  // Run the server
  app.listen(port, async () => {
    console.info(`Server running on http://localhost:${port}`);
  });
}

main(); // Entry point
