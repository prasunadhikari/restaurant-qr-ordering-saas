import { Router } from "express";

import {
  createCustomerOrder,
  getCustomerOrder,
  getPublicRestaurantMenu,
  updateCustomerOrderPayment,
} from "../controllers/publicCustomerController.js";

const router = Router();

router.get(
  "/restaurants/:restaurantSlug/t/:tableNumber/menu",
  getPublicRestaurantMenu,
);
router.post(
  "/restaurants/:restaurantSlug/t/:tableNumber/orders",
  createCustomerOrder,
);
router.get("/orders/:trackingToken", getCustomerOrder);
router.post("/orders/:trackingToken/payment", updateCustomerOrderPayment);

export default router;
