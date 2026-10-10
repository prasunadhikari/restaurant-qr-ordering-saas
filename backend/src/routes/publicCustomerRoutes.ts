import { Router } from "express";

import {
  createCustomerOrder,
  getCustomerOrder,
  getOrCreatePublicTableSession,
  getPublicRestaurantMenu,
  updateCustomerOrderPayment,
} from "../controllers/publicCustomerController.js";
import { createPublicStaffCall } from "../controllers/staffCallController.js";

const router = Router();

router.get(
  "/restaurants/:restaurantSlug/t/:tableNumber/menu",
  getPublicRestaurantMenu,
);
router.get(
  "/restaurants/:restaurantSlug/t/:tableNumber/session",
  getOrCreatePublicTableSession,
);
router.post(
  "/restaurants/:restaurantSlug/t/:tableNumber/session",
  getOrCreatePublicTableSession,
);
router.post(
  "/restaurants/:restaurantSlug/t/:tableNumber/orders",
  createCustomerOrder,
);
router.post(
  "/restaurants/:restaurantSlug/t/:tableNumber/staff-calls",
  createPublicStaffCall,
);
router.get("/orders/:trackingToken", getCustomerOrder);
router.post("/orders/:trackingToken/payment", updateCustomerOrderPayment);

export default router;
