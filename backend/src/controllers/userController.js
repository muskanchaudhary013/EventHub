import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Pass } from "../models/Pass.js";
import { ScanLog } from "../models/ScanLog.js";

// POST /api/users/sync (sync Firebase authenticated user with MongoDB)
export const syncUser = async (req, res, next) => {
  try {
    const { firebaseUid, email, name, role = "student", college, avatarUrl } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ success: false, message: "firebaseUid and email are required" });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      {
        $setOnInsert: { firebaseUid, role: role || "student" },
        $set: {
          email,
          ...(name && { name }),
          ...(college && { college }),
          ...(avatarUrl && { avatarUrl }),
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:uid
export const getUserProfile = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ $or: [{ firebaseUid: uid }, { _id: uid }] });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:uid/role
export const updateUserRole = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!["student", "volunteer", "organizer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const user = await User.findOneAndUpdate(
      { $or: [{ firebaseUid: uid }, { _id: uid }] },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/stats/overview (for Organizer & Volunteer dashboards)
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalEvents, totalPasses, checkedInCount, totalScans] = await Promise.all([
      Event.countDocuments(),
      Pass.countDocuments(),
      Pass.countDocuments({ status: "Checked In" }),
      ScanLog.countDocuments(),
    ]);

    const attendanceRate = totalPasses > 0 ? Math.round((checkedInCount / totalPasses) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalEvents,
        totalPasses,
        checkedInCount,
        pendingCount: Math.max(0, totalPasses - checkedInCount),
        totalScans,
        attendanceRate: `${attendanceRate}%`,
      },
    });
  } catch (error) {
    next(error);
  }
};
