import { Attendee } from "../models/Attendee.js";

// GET /api/attendees (Live Gate Manifest)
export const getAttendees = async (req, res, next) => {
  try {
    const { event, status, search } = req.query;
    const query = {};

    if (event && event !== "all") {
      query.event = { $regex: event, $options: "i" };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { passId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { teamInfo: { $regex: search, $options: "i" } },
      ];
    }

    const attendees = await Attendee.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: attendees.length, data: attendees });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/attendees/:passId/status (Manual status override by organizer/volunteer)
export const updateAttendeeStatus = async (req, res, next) => {
  try {
    const { passId } = req.params;
    const { status, gateLocation } = req.body;

    const attendee = await Attendee.findOneAndUpdate(
      { passId },
      {
        ...(status && { status, statusLabel: status }),
        ...(gateLocation && { gateLocation }),
      },
      { new: true }
    );

    if (!attendee) {
      return res.status(404).json({ success: false, message: "Attendee not found" });
    }

    res.json({ success: true, data: attendee });
  } catch (error) {
    next(error);
  }
};
