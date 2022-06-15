import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Class from "../src/modules/models/class";
import Person from "../src/modules/models/person";
import Quote from "../src/modules/models/quote";
import User from "../src/modules/models/user";

let mongod: MongoMemoryServer | undefined;

export async function init() {
  mongod = await MongoMemoryServer.create();
  mongoose.connect(mongod.getUri());
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

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

export async function createUsers() {
  await User.create({
    username: "admin",
    email: "a.b@c.dd",
    hash: await bcrypt.hash("admin", 12),
    role: "admin",
  });
  await User.create({
    username: "user",
    email: "e.f@g.hh",
    hash: await bcrypt.hash("user", 12),
    role: "user",
  });
}

export async function createClasses() {
  await createUsers();
  const admin = await User.findOne({ username: "admin" });
  if (admin === null) {
    throw new Error("admin is null");
  }
  await Class.create({
    name: "Class 1",
    createdBy: admin._id,
  });
  await Class.create({
    name: "Class 2",
    createdBy: admin._id,
  });
}

export async function createPeople() {
  await createUsers();
  const admin = await User.findOne({ username: "admin" });
  if (admin === null) {
    throw new Error("admin is null");
  }
  await Person.create({
    name: "teacher",
    type: "teacher",
    createdBy: admin._id,
  });
  /*
  await Person.create({
    name: "student",
    type: "student",
    createdBy: admin._id,
  });
  */
}

export async function createQuotes() {
  await createUsers();
  const admin = await User.findOne({ username: "admin" });
  if (admin === null) {
    throw new Error("admin is null");
  }
  const teacher = await Person.findOne({ name: "teacher" });
  if (teacher === null) {
    throw new Error("teacher is null");
  }

  await Quote.create({
    text: "Quote 1",
    originator: teacher._id,
    createdBy: admin._id,
  });
}
