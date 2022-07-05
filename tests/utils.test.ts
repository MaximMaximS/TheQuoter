import { JsonWebTokenError } from "jsonwebtoken";
import { Types } from "mongoose";
import { ServerError, ValidatorError } from "../src/modules/errors";
import * as utils from "../src/modules/utils";

jest.setTimeout(30_000);

describe("utils", () => {
  // Mock environment variables
  const env = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  // Restore environment variables
  afterEach(() => {
    process.env = env;
  });

  test("function getUser", async () => {
    // User is undefined if no auth header
    await expect(utils.getUser()).resolves.toBeUndefined();

    // Throw error if JWT_SECRET is not defined
    await expect(utils.getUser("Bearer foobar")).rejects.toThrow(ServerError);

    // Throw error if token is invalid
    process.env["JWT_SECRET"] = "secret";
    await expect(utils.getUser("Bearer foobar")).rejects.toThrow(
      JsonWebTokenError
    );
  });

  test("function stringOrUndefined", () => {
    expect(utils.stringOrUndefined("foo", "bar")).toBe("foo");
    expect(utils.stringOrUndefined(undefined, "bar")).toBeUndefined();
    expect(() => utils.stringOrUndefined(1, "bar")).toThrow(ValidatorError);
    expect(() => utils.stringOrUndefined(true, "bar")).toThrow(ValidatorError);
  });

  test("function string", () => {
    expect(utils.string("foo", "bar")).toBe("foo");
    expect(() => utils.string(undefined, "bar")).toThrow(ValidatorError);
  });

  test("function idOrUndefined", () => {
    expect(utils.idOrUndefined(undefined, "bar")).toBeUndefined();
    expect(() => utils.idOrUndefined("foo", "bar")).toThrow(ValidatorError);
    const id = utils.idOrUndefined("62a755f9f91dea1d89620b11", "bar");
    expect(id).toBeInstanceOf(Types.ObjectId);
    expect(id?.toString()).toBe("62a755f9f91dea1d89620b11");
  });

  test("function id", () => {
    expect(() => utils.id(undefined, "bar")).toThrow(ValidatorError);
    expect(() => utils.id("foo", "bar")).toThrow(ValidatorError);
    expect(utils.id("62a755f9f91dea1d89620b11", "bar").toString()).toBe(
      "62a755f9f91dea1d89620b11"
    );
  });
});
