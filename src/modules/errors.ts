export class ValidatorError extends Error {
  name;
  kind;
  path;
  constructor(path: string, kind: string) {
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
  full: Error;
  constructor(error: Error | string) {
    if (error instanceof Error) {
      super(error.message);
      this.full = error;
    } else {
      super(error);
      this.full = new Error(error);
    }
    this.name = "ServerError";
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

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}
