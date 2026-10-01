import { Router } from "express";

import {
  createRestaurant,
  getMyRestaurant,
  getAllRestaurants,
} from "../controllers/restaurantController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createRestaurant,
);

router.get(
  "/me",
  authMiddleware,
  getMyRestaurant,
);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllRestaurants,
);

export default router;