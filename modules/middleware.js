import jwt from "jsonwebtoken";
import * as errors from "./errors.js";
import User from "./models/user.js";

export const asyncUtil = (fn) =>
  function asyncUtilWrap(req, res, next) {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
  };

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof errors.ValidatorError) {
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
  } else if (err instanceof errors.IncorrectLoginError) {
    res.sendStatus(401);
  } else if (err instanceof errors.ServerError) {
    res.status(500).json({
      message: err.message,
    });
  } else {
    res.sendStatus(500);
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, id) => {
      if (err) {
        next();
        // return next(new errors.IncorrectLoginError());
      } else {
        User.findById(id.id, (err, user) => {
          if (err) {
            return next(new errors.ServerError(err));
          }
          req.user = user;
          next();
        });
      }
    });
  } else {
    next();
    // next(new errors.IncorrectLoginError());
  }
};
