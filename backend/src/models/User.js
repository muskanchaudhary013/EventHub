import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      default: "Campus Attendee",
    },
    role: {
      type: String,
      enum: ["student", "volunteer", "organizer"],
      default: "student",
      required: true,
    },
    college: {
      type: String,
      default: "Engineering Campus",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    registeredEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
