import type { Request, Response } from "express";
import { NotFoundError } from "../errors";

export function its5Route(_req: Request, res: Response) {
  res.status(418).json({ message: "It's 5!" });
}

export function echoRoute(req: Request, res: Response) {
  if (process.env["NODE_ENV"] !== "development") {
    throw new NotFoundError();
  }
  let response = "Hello, world!";
  if (typeof req.body.message === "string") {
    response = req.body.message;
  } else if (typeof req.query["message"] === "string") {
    response = req.query["message"];
  }

  res.json({ response });
}
