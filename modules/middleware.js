require("dotenv").config({ path: "../.env" });
const jwt = require("jsonwebtoken");
const errors = require("./errors");

const asyncUtil = (fn) =>
  function asyncUtilWrap(req, res, next) {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
  };

module.exports = {
  asyncUtil,
  // Verify JWT
  // eslint-disable-next-line no-unused-vars
  errorHandler: (err, _req, res, _next) => {
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
  },

  verifyToken: (req, res, next) => {
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
  },
};
