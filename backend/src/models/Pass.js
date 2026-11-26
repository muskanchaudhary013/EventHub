import mongoose from "mongoose";

const teammateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Teammate" },
    icon: { type: String, enum: ["palette", "terminal", "cpu"], default: "terminal" },
  },
  { _id: false }
);

const passSchema = new mongoose.Schema(
  {
    passCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    eventTitle: {
      type: String,
      required: true,
    },
    trackLabel: {
      type: String,
      default: "General Track",
    },
    shortTabLabel: {
      type: String,
      default: "",
    },
    dateRange: {
      type: String,
      default: "",
    },
    gateTime: {
      type: String,
      default: "Gates open 09:00 AM",
    },
    venue: {
      type: String,
      required: true,
    },
    teamName: {
      type: String,
      default: "Solo Participant",
    },
    booth: {
      type: String,
      default: "",
    },
    tierLabel: {
      type: String,
      default: "Standard Admission",
    },
    holderName: {
      type: String,
      required: true,
    },
    holderEmail: {
      type: String,
      required: true,
      index: true,
    },
    userUid: {
      type: String,
      index: true,
    },
    teammates: [teammateSchema],
    countdownLabel: {
      type: String,
      default: "",
    },
    sigHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Check-In Ready", "Checked In", "Cancelled"],
      default: "Confirmed",
    },
    dotColor: {
      type: String,
      enum: ["coral", "emerald", "amber"],
      default: "emerald",
    },
    checkedInAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Pass = mongoose.model("Pass", passSchema);
