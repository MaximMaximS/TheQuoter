import { Error, Types } from "mongoose";
import Person from "../src/modules/models/person";
import Quote from "../src/modules/models/quote";
import User from "../src/modules/models/user";
import {
  clearDatabase,
  closeDatabase,
  fillDatabase,
  init,
  personId,
} from "./db";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await fillDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("person", () => {
  test("Same name", async () => {
    await expect(
      Person.create({
        name: "teacher",
        type: "teacher",
      })
    ).rejects.toThrow(Error.ValidationError);
  });
  test("Same id", async () => {
    await expect(
      Person.create({
        _id: personId,
        name: "asd",
        type: "teacher",
      })
    ).rejects.toThrow(Error.ValidationError);
  });
});

describe("quote", () => {
  test("Non existing originator", async () => {
    const admin = await User.findOne({ username: "admin" }).exec();
    if (admin === null) {
      throw new Error("User not found");
    }
    await expect(
      Quote.create({
        originator: new Types.ObjectId(),
        text: "asd",
        createdBy: admin._id,
        approvedBy: admin._id,
      })
    ).rejects.toThrow(Error.ValidationError);
  });
});
