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
  uploadMenuItemImage,
} from "../controllers/restaurantDataController.js";
import { uploadMenuImage } from "../middleware/menuImageUpload.js";
import restaurantOwnerMiddleware from "../middleware/restaurantOwnerMiddleware.js";
import {
  createRestaurantStaff,
  deleteRestaurantStaff,
  getRestaurantStaff,
  updateRestaurantStaff,
} from "../controllers/restaurantStaffController.js";
import {
  createManager,
  deleteRestaurantManager,
  getRestaurantManagers,
} from "../controllers/managerController.js";

const router = Router();

router.use(authMiddleware);

router.get("/staff", restaurantOwnerMiddleware, getRestaurantStaff);
router.post("/staff", restaurantOwnerMiddleware, createRestaurantStaff);
router.patch("/staff/:id", restaurantOwnerMiddleware, updateRestaurantStaff);
router.delete("/staff/:id", restaurantOwnerMiddleware, deleteRestaurantStaff);
router.get("/managers", restaurantOwnerMiddleware, getRestaurantManagers);
router.post("/managers", restaurantOwnerMiddleware, createManager);
router.delete("/managers/:id", restaurantOwnerMiddleware, deleteRestaurantManager);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/menu", getMenuItems);
router.post("/menu", createMenuItem);
router.post("/menu/catalog", addCatalogMenuItems);
router.post(
  "/menu/:id/image",
  uploadMenuImage,
  uploadMenuItemImage,
);
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
