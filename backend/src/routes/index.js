import { Router } from "express";
import eventRoutes from "./eventRoutes.js";
import passRoutes from "./passRoutes.js";
import scanRoutes from "./scanRoutes.js";
import userRoutes from "./userRoutes.js";
import attendeeRoutes from "./attendeeRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EventHub MERN API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/events", eventRoutes);
router.use("/passes", passRoutes);
router.use("/scans", scanRoutes);
router.use("/users", userRoutes);
router.use("/attendees", attendeeRoutes);
router.use("/notifications", notificationRoutes);

export default router;
