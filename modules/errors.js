class ValidationError extends Error {
  constructor(array) {
    let messages = [];
    let paths = [];
    array.forEach((element) => {
      paths.push(element.path);
      messages.push(`${element.path}: ${element.kind}`);
    });
    super(`Validation error: ${messages.join(", ")}`);
    this.name = "ValidationError";
    this.paths = paths;
    this.errors = array;
  }
}

class ValidatorError extends Error {
  constructor(error) {
    let message = `Path ${error.path} is invalid (${error.kind})`;
    super(message);
    this.name = "ValidatorError";
    this.kind = error.kind;
    this.path = error.path;
  }
}

class ServerError extends Error {
  constructor(error) {
    super(error.message || error);
    this.name = "ServerError";
    this.full = error || {};
  }
}

class IncorrectLoginError extends Error {
  constructor() {
    super("Incorrect login");
    this.name = "IncorrectLoginError";
  }
}

module.exports = {
  handler: (err, _req, res) => {
    if (err instanceof ValidationError) {
      res.status(400).json({
        error: err.message,
      });
    } else if (err instanceof IncorrectLoginError) {
      res.status(401).json({
        error: err.message,
      });
    } else if (err instanceof ServerError) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.status(500).json({
        error: "Something went wrong...",
      });
    }
  },

  ValidationError,
  ValidatorError,
  ServerError,
  IncorrectLoginError,
};
