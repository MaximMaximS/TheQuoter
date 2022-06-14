import { Request, Response } from "express";
import { NotFoundError } from "../errors";

export function its5Route(req: Request, res: Response) {
  res.status(418).json({ message: "It's 5!" });
}

export function echoRoute(req: Request, res: Response) {
  if (process.env.NODE_ENV !== "development") {
    throw new NotFoundError();
  }
  const message =
    typeof req.body.message === "string"
      ? req.body.message
      : typeof req.query.message === "string"
      ? req.query.message
      : "Hello World!";

  res.json({ message });
}
