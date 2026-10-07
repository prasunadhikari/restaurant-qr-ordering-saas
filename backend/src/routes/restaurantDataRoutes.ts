import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  createCategory,
  createMenuItem,
  createTable,
  addCatalogMenuItems,
  deleteCategory,
  deleteMenuItem,
  deleteTable,
  getAnalytics,
  getCategories,
  getMenuItems,
  getOrders,
  getTables,
  updateCategory,
  updateMenuItem,
  updateOrderStatus,
  updateTable,
} from "../controllers/restaurantDataController.js";

const router = Router();

router.use(authMiddleware);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/menu", getMenuItems);
router.post("/menu", createMenuItem);
router.post("/menu/catalog", addCatalogMenuItems);
router.patch("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

router.get("/tables", getTables);
router.post("/tables", createTable);
router.patch("/tables/:id", updateTable);
router.delete("/tables/:id", deleteTable);

router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/analytics", getAnalytics);

export default router;
