import jwt from "jsonwebtoken";
import * as errors from "./errors.js";
import User from "./models/user.js";
import mongoose from "mongoose";

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
  } else if (err instanceof mongoose.Error.ValidationError) {
    const first = err.errors[Object.keys(err.errors)[0]];
    res.status(400).json({
      message: first.message,
      path: first.path,
      kind: first.kind,
    });
  } else if (err instanceof errors.ServerError) {
    res.status(500).json({
      message: err.message,
    });
  } else if (err instanceof errors.NotFoundError) {
    res.sendStatus(404);
  } else if (err instanceof errors.ForbiddenError) {
    res.sendStatus(403);
  } else {
    res.sendStatus(500);
  }
};

export const setUser = (req, res, next) => {
  const user = getUser(req.headers.authorization);
  if (user instanceof Error) {
    return next(user);
  }
  req.user = user;
};

export const enforceRole = (admin) => (req, res, next) => {
  // Verify token
  const user = getUser(req.headers.authorization);
  if (user instanceof Error) {
    return next(user);
  }
  // If admin false then enforce moderator or admin, otherwise enforce admin
  (admin ? ["admin"] : ["admin", "moderator"]).includes(req.user.role)
    ? next()
    : next(new errors.ForbiddenError());
};

function getUser(authHeader) {
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, id) => {
      if (err) {
        return err;
      }
      User.findById(id.id, (err, user) => {
        if (err) {
          return err;
        }
        return user;
      });
    });
  } else {
    return null;
  }
}
