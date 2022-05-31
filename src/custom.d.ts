import { IUser } from "./modules/models/user";

declare module "express-serve-static-core" {
  export interface Request {
    user: IUser | null;
  }
}
