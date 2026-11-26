import { Router } from "express";
import { getAttendees, updateAttendeeStatus } from "../controllers/attendeeController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", getAttendees);
router.patch("/:passId/status", requireAuth, requireRole("volunteer", "organizer"), updateAttendeeStatus);

export default router;
