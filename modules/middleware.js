import jwt from "jsonwebtoken";
import * as errors from "./errors.js";

export const asyncUtil = (fn) =>
  function asyncUtilWrap(req, res, next) {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof errors.ValidationError) {
    res.status(400).json({
      error: err.message,
    });
  } else if (err instanceof errors.IncorrectLoginError) {
    res.status(401).json({
      error: err.message,
    });
  } else if (err instanceof errors.ServerError) {
    res.status(500).json({
      error: err.message,
    });
  } else {
    res.status(500).json({
      error: "Something went wrong...",
    });
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(new errors.IncorrectLoginError());
      }

      req.user = user;
      next();
    });
  } else {
    next(new errors.IncorrectLoginError());
  }
};
