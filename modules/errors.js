/*
export class ValidationError extends Error {
  constructor(array) {
    const messages = [];
    const paths = [];
    array.forEach((element) => {
      paths.push(element.path);
      messages.push(`${element.path}: ${element.kind}`);
    });
    super(`Validation error: ${messages.join(", ")}`);
    this.name = "ValidationError";
    this.errors = array;
  }
}
*/

export class ValidatorError extends Error {
  name;
  kind;
  path;
  constructor(path, kind) {
    switch (kind) {
      case "notallowed":
        super("To use state 'pending' or 'rejected' you must be logged in.");
        break;
      case "required":
        super(`${path} is required`);
        break;
      case "maxlength":
        super(`${path} is too long`);
        break;
      case "minlength":
        super(`${path} is too short`);
        break;
      case "unique":
        super(`${path} is already taken`);
        break;
      case "match":
        super(`${path} does not match the pattern`);
        break;
      default:
        super(`${path} is not valid (${kind})`);
        break;
    }
    this.name = "ValidatorError";

    this.kind = kind;
    this.path = path;
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

export class NotFoundError extends Error {
  constructor() {
    super("Not found");
    this.name = "NotFoundError";
  }
}
