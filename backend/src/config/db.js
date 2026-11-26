import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventhub";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[EventHub] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[EventHub] MongoDB Connection Warning: ${error.message}`);
    console.warn(`[EventHub] Server running with fallback memory/mock capabilities until MongoDB is connected.`);
    return null;
  }
};
