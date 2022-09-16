import { Error } from "mongoose";
import Person from "../src/modules/models/person";
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
    const admin = await User.findOne({ username: "admin" }).exec();
    if (admin === null) {
      throw new Error("Admin not found");
    }
    await expect(
      Person.create({
        name: "teacher",
        type: "teacher",
        createdBy: admin._id,
      })
    ).rejects.toThrow(Error.ValidationError);
  });
  test("Same id", async () => {
    const admin = await User.findOne({ username: "admin" }).exec();
    if (admin === null) {
      throw new Error("Admin not found");
    }
    await expect(
      Person.create({
        _id: personId,
        name: "asd",
        type: "teacher",
        createdBy: admin._id,
      })
    ).rejects.toThrow(Error.ValidationError);
  });
});
