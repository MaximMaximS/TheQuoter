import "dotenv/config";
import mongoose from "mongoose";
import app from "./modules/app";

async function main() {
  // No args - all arg passes with ENViroment
  if (process.env.MONGODB_URI === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const PORT = process.env.PORT || 3000; // If no port is supplied, run on 3000

  // Run the server
  app.listen(PORT, async () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

main(); // Entry point
