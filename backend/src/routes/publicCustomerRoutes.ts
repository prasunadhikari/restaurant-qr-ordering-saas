import { Router } from "express";

import {
  createCustomerOrder,
  getCustomerOrder,
  getPublicRestaurantMenu,
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

export default router;
