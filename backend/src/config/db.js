import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventhub", {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[EventHub] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[EventHub] MongoDB Connection Warning: ${error.message}`);
    console.warn(`[EventHub] Server running with fallback memory/mock capabilities until MongoDB is connected.`);
    return null;
  }
};
