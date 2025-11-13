/* eslint-disable no-console */
import mongoose from "mongoose";

export async function connectMongo(uri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Mongo connected");
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  console.log("Mongo disconnected");
}
