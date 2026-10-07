import { Router } from "express";

import {
  getAdminOrders,
  getAdminOverview,
  getAdminUsers,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/overview", getAdminOverview);
router.get("/orders", getAdminOrders);
router.get("/users", getAdminUsers);

export default router;
