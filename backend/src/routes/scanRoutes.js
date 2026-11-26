import { Router } from "express";
import { getScanLogs, logScan } from "../controllers/scanController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", getScanLogs);
router.post("/", requireAuth, requireRole("volunteer", "organizer"), logScan);

export default router;
