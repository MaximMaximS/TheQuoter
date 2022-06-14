import request from "supertest";
import app from "../src/modules/app";
import * as dbHandler from "./db";

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe("people", () => {
  test("GET /people", (done) => {
    // Expect empty array
    request(app)
      .get("/people")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(done);
  });
});
