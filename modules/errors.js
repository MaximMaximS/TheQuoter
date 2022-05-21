class ValidationError extends Error {
  constructor(array) {
    super("Validation failed");
    this.name = "ValidationError";
    this.message = "Validation failed";
    this.errors = array;
  }
}

class ValidatorError extends Error {
  constructor(error) {
    let message = `Path ${error.path} is invalid (${error.kind})`;
    super(message);
    this.message = message;
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

module.exports = {
  ValidationError,
  ValidatorError,
  ServerError,
};
