import mongoose from "mongoose";

const scanLogSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      default: () => new Date().toLocaleTimeString("en-US", { hour12: false }),
    },
    attendee: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    event: {
      type: String,
      required: true,
    },
    passId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Valid", "Duplicate", "Manual", "Late"],
      required: true,
      default: "Valid",
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
    scannedByUid: {
      type: String,
    },
    gateLocation: {
      type: String,
      default: "Main Gate",
    },
  },
  {
    timestamps: true,
  }
);

export const ScanLog = mongoose.model("ScanLog", scanLogSchema);
