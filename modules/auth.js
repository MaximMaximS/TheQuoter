import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import * as errors from "./errors.js";
const saltRounds = 12;

export function getToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function login(body) {
  return new Promise((resolve, reject) => {
    if ((!body.email && !body.username) || !body.password) {
      return reject(new errors.IncorrectLoginError());
    }
    User.findOne(
      {
        $or: [{ email: body.email }, { username: body.username }],
      },
      (err, user) => {
        if (err) {
          return reject(new errors.ServerError(err));
        }
        if (!user) {
          return reject(new errors.IncorrectLoginError());
        }
        bcrypt.compare(body.password, user.hash, (err2, result) => {
          if (err2) {
            return reject(new errors.ServerError(err));
          }
          if (!result) {
            return reject(new errors.IncorrectLoginError());
          }
          return resolve(user);
        });
      }
    );
  });
}

export function register(body) {
  return new Promise((resolve, reject) => {
    const password = body.password;
    // Check if password is 6 characters or more
    if (password.length < 6) {
      return reject(new errors.ValidatorError("password", "minlength"));
    }
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        return reject(new errors.ServerError(err));
      }
      const user = new User({
        username: body.username,
        hash,
        email: body.email,
      });
      user.save(function (err) {
        if (err) {
          if (err instanceof mongoose.Error.ValidationError) {
            return reject(
              new errors.ValidatorError(err.errors[0].path, err.errors[0].kind)
            );
          }
          return reject(new errors.ServerError(err));
        }
        resolve(user);
      });
    });
  });
}
