import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", requireAuth, requireRole("organizer"), createEvent);
router.put("/:id", requireAuth, requireRole("organizer"), updateEvent);
router.delete("/:id", requireAuth, requireRole("organizer"), deleteEvent);

export default router;
