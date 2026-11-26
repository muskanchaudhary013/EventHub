import { Router } from "express";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/read-all", markAllAsRead);
router.delete("/clear-read", clearReadNotifications);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
