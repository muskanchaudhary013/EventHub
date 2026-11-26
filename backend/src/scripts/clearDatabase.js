import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Event } from "../models/Event.js";
import { Pass } from "../models/Pass.js";
import { ScanLog } from "../models/ScanLog.js";
import { Attendee } from "../models/Attendee.js";
import { User } from "../models/User.js";

async function clearDatabase() {
  console.log("🔌 Connecting to MongoDB...");
  const conn = await connectDB();

  if (!conn || mongoose.connection.readyState !== 1) {
    console.error("\n❌ Could not connect to MongoDB.");
    console.error("Please verify that:");
    console.error(" 1. Your MONGO_URI in backend/.env is correct.");
    console.error(" 2. Your current public IP is whitelisted in MongoDB Atlas Network Access (or set to 0.0.0.0/0).");
    console.error(" 3. If using local MongoDB, ensure mongod is running (e.g. `brew services start mongodb-community`).\n");
    process.exit(1);
  }

  const dbName = mongoose.connection.name;
  console.log(` Connected to MongoDB database: [${dbName}] at ${mongoose.connection.host}`);
  console.log("⚠️  Deleting all data from all collections...\n");

  try {
    // 1. Explicitly clean known Mongoose models
    const models = [
      { name: "Event", model: Event },
      { name: "Pass", model: Pass },
      { name: "ScanLog", model: ScanLog },
      { name: "Attendee", model: Attendee },
      { name: "User", model: User },
    ];

    for (const { name, model } of models) {
      try {
        const count = await model.countDocuments();
        const res = await model.deleteMany({});
        console.log(`  - ${name}s: Deleted ${res.deletedCount} documents (was ${count})`);
      } catch (err) {
        console.warn(`  - Warning clearing ${name}: ${err.message}`);
      }
    }

    // 2. Clear any additional collections in the database
    const allCollections = await mongoose.connection.db.collections();
    for (const col of allCollections) {
      const knownCollectionNames = models.map(m => m.model.collection.collectionName);
      if (!knownCollectionNames.includes(col.collectionName) && !col.collectionName.startsWith("system.")) {
        const count = await col.countDocuments();
        const res = await col.deleteMany({});
        console.log(`  - Collection '${col.collectionName}': Deleted ${res.deletedCount} documents (was ${count})`);
      }
    }

    console.log("\n✅ Database cleanup complete: All data has been deleted from database:", dbName);
  } catch (err) {
    console.error("\n❌ Error during database cleanup:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

clearDatabase();
