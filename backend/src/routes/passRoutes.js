import { Router } from "express";
import { getPasses, getPassByCode, createPass } from "../controllers/passController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", getPasses);
router.get("/:passCode", getPassByCode);
router.post("/", requireAuth, createPass);

export default router;
