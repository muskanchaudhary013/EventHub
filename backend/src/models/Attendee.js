import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    passId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    initials: {
      type: String,
      default: "AT",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    teamInfo: {
      type: String,
      default: "Solo Participant",
    },
    event: {
      type: String,
      required: true,
    },
    eventKey: {
      type: String,
      default: "general",
    },
    track: {
      type: String,
      default: "General Track",
    },
    type: {
      type: String,
      enum: ["Solo", "Team"],
      default: "Solo",
    },
    typeLabel: {
      type: String,
      default: "Solo Participant",
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Pending", "Blocked"],
      default: "Pending",
    },
    statusLabel: {
      type: String,
      default: "Pending",
    },
    scanTime: {
      type: String,
      default: "Unscanned",
    },
    gateLocation: {
      type: String,
      default: "Pending Verification",
    },
  },
  {
    timestamps: true,
  }
);

export const Attendee = mongoose.model("Attendee", attendeeSchema);
