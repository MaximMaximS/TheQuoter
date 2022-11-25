import "dotenv/config";
import app from "./modules/app";
import { number } from "./modules/utils";

function main() {
  const PORT = number(process.env["PORT"], "PORT");

  // Run the server
  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

main(); // Entry point
