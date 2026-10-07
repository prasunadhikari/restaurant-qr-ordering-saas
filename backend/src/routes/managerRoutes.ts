import { Router } from "express";

import {
  createManagerCategory,
  createManagerMenuItem,
  createManagerTable,
  deleteManagerCategory,
  deleteManagerMenuItem,
  deleteManagerTable,
  getManagerBills,
  getManagerCategories,
  getManagerDashboard,
  getManagerMenu,
  getManagerOrder,
  getManagerOrders,
  getManagerPayments,
  getManagerProfile,
  getManagerTables,
  updateManagerCategory,
  updateManagerMenuItem,
  updateManagerOrder,
  updateManagerPayment,
  updateManagerTable,
  uploadManagerMenuItemImage,
} from "../controllers/managerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import managerMiddleware from "../middleware/managerMiddleware.js";
import { uploadMenuImage } from "../middleware/menuImageUpload.js";

const router = Router();

router.use(authMiddleware, managerMiddleware);
router.get("/me", getManagerProfile);
router.get("/dashboard", getManagerDashboard);
router.get("/orders", getManagerOrders);
router.get("/orders/:id", getManagerOrder);
router.patch("/orders/:id/status", updateManagerOrder);
router.get("/menu", getManagerMenu);
router.get("/menu/categories", getManagerCategories);
router.post("/menu/categories", createManagerCategory);
router.patch("/menu/categories/:id", updateManagerCategory);
router.delete("/menu/categories/:id", deleteManagerCategory);
router.post("/menu/items", createManagerMenuItem);
router.post("/menu/items/:id/image", uploadMenuImage, uploadManagerMenuItemImage);
router.patch("/menu/items/:id", updateManagerMenuItem);
router.delete("/menu/items/:id", deleteManagerMenuItem);
router.get("/tables", getManagerTables);
router.post("/tables", createManagerTable);
router.patch("/tables/:id", updateManagerTable);
router.delete("/tables/:id", deleteManagerTable);
router.get("/payments", getManagerPayments);
router.patch("/payments/:id", updateManagerPayment);
router.get("/bills", getManagerBills);

export default router;
