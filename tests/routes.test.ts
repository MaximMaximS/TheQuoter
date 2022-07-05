import request from "supertest";
import app from "../src/modules/app";
import {
  classId,
  clearDatabase,
  closeDatabase,
  createClasses,
  createPeople,
  createUsers,
  init,
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

describe("people", () => {
  test("GET /people", async () => {
    await createPeople();
    // Expect empty array json

    let res = await request(app)
      .get("/people")
      .expect("Content-Type", /json/)
      .expect(200);

    // Expect array of people
    expect(res.body).toHaveLength(1);

    res = await request(app)
      .get("/people")
      .query({ name: "teacher" })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("teacher");
  });
});

describe("classes", () => {
  test("GET /classes", async () => {
    await createClasses();
    const res = await request(app)
      .get("/classes")
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("users", () => {
  test("Register", async () => {
    await createClasses();
    process.env["JWT_SECRET"] = "secret";
    const res = await request(app)
      .post("/users")
      .send({
        email: "example@example.com",
        username: "pablo",
        password: "12345678",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body.user.username).toBe("pablo");
    expect(res.body.user.email).toBe("example@example.com");
    expect(res.body.user.role).toBe("user");
    expect(res.body.user.class.toString()).toBe(classId.toString());
  });

  test("Login", async () => {
    await createUsers();
    process.env["JWT_SECRET"] = "secret";
    const res = await request(app)
      .post("/users/login")
      .send({
        username: "admin",
        password: "adminadmin",
      })
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.user.username).toBe("admin");
    expect(res.body.user.email).toBe("a.b@c.dd");
    expect(res.body.user.role).toBe("admin");
  });
});
