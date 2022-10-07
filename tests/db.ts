import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Class from "../src/modules/models/class";
import Person from "../src/modules/models/person";
import Quote from "../src/modules/models/quote";
import User from "../src/modules/models/user";

let mongod: MongoMemoryServer | undefined;

export async function init() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod === undefined) {
    throw new Error("mongod is not initialized");
  }
  await mongod.stop();
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const [, value] of Object.entries(collections)) {
    await value.deleteMany({});
  }
}

export async function getToken(who: string) {
  process.env["JWT_SECRET"] = "secret";
  const user = await User.findOne({ username: who }).exec();
  if (user === null) {
    throw new Error("User not found");
  }
  return user.genToken();
}

export const classId = new mongoose.Types.ObjectId();

export const personId = new mongoose.Types.ObjectId();

export const quoteId = new mongoose.Types.ObjectId();

export async function fillDatabase() {
  await Class.create({
    _id: classId,
    name: "Class 1",
  });
  const classId2 = new mongoose.Types.ObjectId();
  await Class.create({
    name: "Class 2",
    _id: classId2,
  });
  const admin = await User.create({
    username: "admin",
    email: "a.b@c.dd",
    password: "adminadmin",
    role: "admin",
    class: classId,
  });
  const user = await User.create({
    username: "user",
    email: "e.f@g.hh",
    password: "useruser",
    role: "user",
    class: classId,
  });
  await User.create({
    email: "example@example.com",
    username: "pablo",
    password: "12345678",
    class: classId,
  });
  // Moderator from class
  await User.create({
    email: "example.moderator1@example.com",
    username: "moderator1",
    password: "12345678",
    class: classId,
    role: "moderator",
  });
  // Moderator from another class
  await User.create({
    email: "example.moderator2@example.com",
    username: "moderator2",
    password: "12345678",
    class: classId2,
    role: "moderator",
  });
  const teacher = await Person.create({
    _id: personId,
    name: "teacher",
    type: "teacher",
  });
  await Quote.create({
    _id: quoteId,
    text: "Quote 1",
    state: "public",
    originator: teacher._id,
    createdBy: admin._id,
    approvedBy: admin._id,
  });

  await Quote.create({
    text: "Quote 2",
    originator: teacher._id,
    createdBy: user._id,
  });
}
