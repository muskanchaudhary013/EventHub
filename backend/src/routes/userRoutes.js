import { Router } from "express";
import {
  syncUser,
  getUserProfile,
  updateUserRole,
  getDashboardStats,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/sync", syncUser);
router.get("/stats/overview", getDashboardStats);
router.get("/:uid", getUserProfile);
router.patch("/:uid/role", requireAuth, updateUserRole);

export default router;
