/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Error } from "mongoose";
import Person from "../src/modules/models/person";
import User from "../src/modules/models/user";
import {
  clearDatabase,
  closeDatabase,
  createPeople,
  init,
  personId,
} from "./db";

jest.setTimeout(30_000);

beforeAll(async () => {
  await init();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("person", () => {
  test("Same name", async () => {
    await createPeople();
    const admin = await User.findOne({ username: "admin" }).exec();
    expect(admin).not.toBeNull();
    await expect(
      Person.create({
        name: "teacher",
        type: "teacher",
        createdBy: admin!._id,
      })
    ).rejects.toThrow(Error.ValidationError);
  });
  test("Same id", async () => {
    await createPeople();
    const admin = await User.findOne({ username: "admin" }).exec();
    expect(admin).not.toBeNull();
    await expect(
      Person.create({
        _id: personId,
        name: "asd",
        type: "teacher",
        createdBy: admin!._id,
      })
    ).rejects.toThrow(Error.ValidationError);
  });
});
