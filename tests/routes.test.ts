import request from "supertest";
import app from "../src/modules/app";
import { clearDatabase, closeDatabase, createPeople, init } from "./db";

beforeAll(async () => {
  await init();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("people", () => {
  test("GET /people", async () => {
    await createPeople();
    // Expect empty array json

    const res = await request(app)
      .get("/people")
      .expect("Content-Type", /json/)
      .expect(200);

    // Expect array of people
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("teacher");
  });
});
