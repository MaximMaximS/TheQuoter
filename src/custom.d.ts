import { IUser } from "./modules/models/user";

// Ensures that request allows user property to be set
declare module "express-serve-static-core" {
  export interface Request {
    user: IUser | null;
  }
}
