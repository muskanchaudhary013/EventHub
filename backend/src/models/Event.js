import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    trackCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["hackathon", "robotics", "design", "cultural", "esports"],
      required: true,
    },
    categoryLabel: {
      type: String,
      default: "",
    },
    statusBadge: {
      type: String,
      default: "Registration Open",
    },
    statusTone: {
      type: String,
      enum: ["amber", "crimson", "emerald", "neutral"],
      default: "emerald",
    },
    teamSpec: {
      type: String,
      default: "Solo or Team",
    },
    teamType: {
      type: String,
      enum: ["solo", "team", "both"],
      default: "both",
    },
    entryType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    prizeLabel: {
      type: String,
      default: "Certificates & Medals",
    },
    prizeTone: {
      type: String,
      enum: ["primary", "tertiary", "neutral"],
      default: "primary",
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacityCount: {
      type: Number,
      required: true,
      default: 100,
    },
    quotaLabel: {
      type: String,
      default: "Allocation Quota",
    },
    quotaUnit: {
      type: String,
      default: "Spots Claimed",
    },
    progressColor: {
      type: String,
      default: "bg-primary-container",
    },
    dateShort: {
      type: String,
      default: "",
    },
    dateFilter: {
      type: String,
      enum: ["fri", "sat", "sun"],
      default: "fri",
    },
    dateFull: {
      type: String,
      default: "",
    },
    venue: {
      type: String,
      required: true,
    },
    ctaLabel: {
      type: String,
      default: "Register Pass",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    organizerNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);
