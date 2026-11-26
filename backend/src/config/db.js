import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cachedPromise = null;
let lastAttempt = 0;
const RETRY_INTERVAL_MS = 10000;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  // Throttle reconnection attempts so incoming HTTP requests don't hang if Atlas is unreachable
  const now = Date.now();
  if (now - lastAttempt < RETRY_INTERVAL_MS) {
    return null;
  }
  lastAttempt = now;

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventhub";
  cachedPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`[EventHub] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      console.warn(`[EventHub] MongoDB Connection Warning: ${error.message}`);
      console.warn(
        `[EventHub] Server running with fallback memory/mock capabilities until MongoDB is connected.`
      );
      return null;
    });

  return cachedPromise;
};
