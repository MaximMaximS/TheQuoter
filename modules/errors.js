export class ValidationError extends Error {
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

export class ValidatorError extends Error {
  constructor(error) {
    let message = `Path ${error.path} is invalid (${error.kind})`;
    super(message);
    this.name = "ValidatorError";
    this.kind = error.kind;
    this.path = error.path;
  }
}

export class ServerError extends Error {
  constructor(error) {
    super(error.message || error);
    this.name = "ServerError";
    this.full = error || {};
  }
}

export class IncorrectLoginError extends Error {
  constructor() {
    super("Incorrect login");
    this.name = "IncorrectLoginError";
  }
}

