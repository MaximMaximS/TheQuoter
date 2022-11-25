import { ValidatorError } from "../src/modules/errors";
import * as utils from "../src/modules/utils";

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
});
