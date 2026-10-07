import { Router } from "express";

import {
  getStaffMe,
  getStaffOrder,
  getStaffOrders,
  updateStaffOrderStatus,
} from "../controllers/staffController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import staffMiddleware from "../middleware/staffMiddleware.js";

const router = Router();

router.use(authMiddleware, staffMiddleware);

router.get("/me", getStaffMe);
router.get("/orders", getStaffOrders);
router.get("/orders/:id", getStaffOrder);
router.patch("/orders/:id/status", updateStaffOrderStatus);

export default router;
