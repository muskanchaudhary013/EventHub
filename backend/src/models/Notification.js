import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      default: "all",
      index: true,
      // Can be a specific userUid, email, 'role:student', 'role:volunteer', 'role:organizer', or 'all'
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "urgent", "pass", "gate", "event"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["general", "registration", "gate_scan", "announcement", "security", "system"],
      default: "general",
    },
    link: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readBy: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast retrieval of user and broadcast notifications sorted by newest
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
