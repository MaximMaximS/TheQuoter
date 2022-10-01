import request from "supertest";
import app from "../src/modules/app";
import {
  classId,
  clearDatabase,
  closeDatabase,
  fillDatabase,
  getToken,
  init,
} from "./db";

beforeAll(async () => {
  await init();
});

const env = process.env;
beforeEach(async () => {
  await fillDatabase();
  jest.resetModules();
  process.env = { ...env };
});

afterEach(async () => {
  await clearDatabase();
  process.env = env;
});

afterAll(async () => {
  await closeDatabase();
});

describe("people", () => {
  test("GET /people", async () => {
    // Expect empty array json

    const user = await getToken("user");
    let res = await request(app)
      .get("/people")
      .set("Authorization", `Bearer ${user}`)
      .expect("Content-Type", /json/)
      .expect(200);

    // Expect array of people
    expect(res.body).toHaveLength(1);

    res = await request(app)
      .get("/people")
      .set("Authorization", `Bearer ${user}`)
      .query({ name: "teacher" })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("teacher");

    // Expect empty array
    res = await request(app)
      .get("/people")
      .set("Authorization", `Bearer ${user}`)
      .query({ name: "student" })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(0);
  });

  test("POST /people", async () => {
    const token = await getToken("admin");

    // Expect 401 if not logged in
    await request(app).post("/people").expect(401);

    // Expect 400 if no name
    await request(app)
      .post("/people")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "teacher" })
      .expect(400);

    // Expect 400 if no type
    await request(app)
      .post("/people")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "obama" })
      .expect(400);

    // Expect 400 if invalid type
    await request(app)
      .post("/people")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "obama", type: "obama" })
      .expect(400);

    // Expect 201 if valid
    const res = await request(app)
      .post("/people")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "obama", type: "teacher" })
      .expect(201);

    expect(res.body.name).toBe("obama");
    expect(res.body.type).toBe("teacher");

    // Expect 400 if duplicate
    await request(app)
      .post("/people")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "teacher", type: "teacher" })
      .expect(400);
  });
});

describe("classes", () => {
  test("GET /classes", async () => {
    let res = await request(app)
      .get("/classes")
      .expect("Content-Type", /json/)
      .expect(200);

    // Expect array of classes
    expect(res.body).toHaveLength(2);

    res = await request(app)
      .get("/classes")
      .query({ name: "Class 1" })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Class 1");

    // Expect empty array
    res = await request(app)
      .get("/classes")
      .query({ name: "obama" })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(0);
  });
});

describe("users", () => {
  test("Registration flow", async () => {
    process.env["JWT_SECRET"] = "secret";
    // Expect 400 if duplicate email
    await request(app)
      .post("/register")
      .send({
        email: "example@example.com",
        username: "sus",
        password: "12345678",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect(400);

    // Expect 400 if duplicate username
    await request(app)
      .post("/register")
      .send({
        email: "example2@example.com",
        username: "pablo",
        password: "12345678",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect(400);

    // Expect 400 if invalid email
    await request(app)
      .post("/register")
      .send({
        email: "example",
        username: "pablo",
        password: "12345678",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect(400);

    // Expect 400 if invalid password
    await request(app)
      .post("/register")
      .send({
        email: "example3@example.com",
        username: "amogus",
        password: "1",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect(400);

    let res = await request(app)
      .post("/register")
      .send({
        email: "example4@example.com",
        username: "pablus",
        password: "12345678",
        class: classId,
      })
      .set("Content-Type", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body.user.username).toBe("pablus");
    expect(res.body.user.email).toBe("example4@example.com");
    expect(res.body.user.role).toBe("guest");
    expect(res.body.user.class).toBe(classId.toString());

    // Get list of guests
    // Expect 401
    await request(app).get("/guests").expect(401);

    let token = await getToken("user");

    // Expect 403
    await request(app)
      .get("/guests")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    token = await getToken("moderator2");
    // Expect no results
    res = await request(app)
      .get("/guests")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(0);

    token = await getToken("moderator1");
    // Expect 1 result
    res = await request(app)
      .get("/guests")
      .set("Authorization", `Bearer ${token}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].role).toBe("guest");
    expect(res.body[0].class).toBe(classId.toString());

    // Approve user
    const uid: string = res.body[0]._id;
    const uid2: string = res.body[1]._id;
    // Expect 401
    await request(app).post(`/users/${uid}/approve`).expect(401);

    token = await getToken("user");
    // Expect 403
    await request(app)
      .post(`/users/${uid}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    token = await getToken("moderator2");

    // Expect 404
    await request(app)
      .post(`/users/${uid}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    token = await getToken("moderator1");

    // Expect 400 if no approve boolean
    await request(app)
      .post(`/users/${uid}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    // Expect 200 if valid
    res = await request(app)
      .post(`/users/${uid}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .send({ approve: true })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.role).toBe("user");
    expect(res.body.class).toBe(classId.toString());

    // Decline
    res = await request(app)
      .post(`/users/${uid2}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .send({ approve: false })
      .expect(200);

    expect(res.body.role).toBe("guest");
    expect(res.body.class).toBeUndefined();
  });

  test("Login", async () => {
    process.env["JWT_SECRET"] = "secret";
    const res = await request(app)
      .post("/login")
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

    // Expect 401 if invalid username
    await request(app)
      .post("/login")
      .send({
        username: "obama",
        password: "adminadmin",
      })
      .set("Content-Type", "application/json")
      .expect(401);

    // Expect 401 if invalid password
    await request(app)
      .post("/login")
      .send({
        username: "admin",
        password: "obama",
      })
      .set("Content-Type", "application/json")
      .expect(401);
  });
});

describe("quotes", () => {
  test("GET /quotes", async () => {
    await request(app).get("/quotes").expect(401);
    const user = await getToken("user");
    let res = await request(app)
      .get("/quotes")
      .set("Authorization", `Bearer ${user}`)
      .expect("Content-Type", /json/)
      .expect(200);
    // Expect array of quotes
    expect(res.body).toHaveLength(1);

    // Expect array of two quotes if admin
    const admin = await getToken("admin");
    res = await request(app)
      .get("/quotes")
      .set("Authorization", `Bearer ${admin}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(res.body).toHaveLength(2);
  });
});
