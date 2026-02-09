import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("DataBase Connected Successfully");
  } catch (error) {
    console.log("DataBase Connection Filed");
    console.log({ error });
  }
};
