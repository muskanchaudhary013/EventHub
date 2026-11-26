import { Event } from "../models/Event.js";

// GET /api/events
export const getEvents = async (req, res, next) => {
  try {
    const { category, search, day } = req.query;
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (day && ["fri", "sat", "sun"].includes(day)) {
      query.dateFilter = day;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { trackCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = (await Event.findById(id).catch(() => null)) || (await Event.findOne({ trackCode: id }));

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event removed successfully" });
  } catch (error) {
    next(error);
  }
};
