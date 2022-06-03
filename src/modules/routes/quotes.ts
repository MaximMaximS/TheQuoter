import { FilterQuery, Types } from "mongoose";
import Quote, { IQuote, IReducedQuote } from "../models/quote";
import { IUser } from "../models/user";
import { IncorrectLoginError, ValidatorError } from "../errors";

export async function search(
  originator: Types.ObjectId | null,
  classId: Types.ObjectId | null,
  text: string | null,
  state: string | null
): Promise<IReducedQuote[]> {
  const query: FilterQuery<IQuote> = {};
  if (originator !== null) {
    query["originator"] = originator;
  }
  if (classId) {
    query["class"] = classId;
  }
  if (text) {
    query["text"] = { $regex: text, $options: "i" };
  }
  if (state) {
    query["state"] = state;
  }
  const quotes = await Quote.find(query);

  // Simplify all quotes
  return Promise.all(quotes.map((q) => q.reduce()));
}

// TODO Not Implemented
export async function create(name: unknown, user: IUser | null) {
  if (user === null) {
    throw new IncorrectLoginError();
  }
  if (typeof name !== "string") {
    throw new ValidatorError("name", "required");
  }
  const result = await Quote.create({
    name: name,
    createdBy: user._id,
  });
  return result.reduce();
}
