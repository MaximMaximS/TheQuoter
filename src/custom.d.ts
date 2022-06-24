import { IUser } from "./modules/models/user";

// Ensures that request allows user property to be set
declare namespace Express {
  export interface Request {
    user: IUser | null;
  }
}
