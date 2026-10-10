import { Router } from "express";

import {
  getStaffMe,
  getStaffOrder,
  getStaffOrders,
  getStaffTables,
  updateStaffOrderStatus,
} from "../controllers/staffController.js";
import { closeManagerTableSession } from "../controllers/managerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import staffMiddleware from "../middleware/staffMiddleware.js";
import { attendStaffCallRequest, getStaffCallRequests } from "../controllers/staffCallController.js";

const router = Router();

router.use(authMiddleware, staffMiddleware);

router.get("/me", getStaffMe);
router.get("/orders", getStaffOrders);
router.get("/tables", getStaffTables);
router.get("/orders/:id", getStaffOrder);
router.patch("/orders/:id/status", updateStaffOrderStatus);
router.post("/tables/:id/session/close", closeManagerTableSession);
router.get("/staff-calls", getStaffCallRequests);
router.patch("/staff-calls/:id/attend", attendStaffCallRequest);

export default router;
