import { Router } from "express";

import {
  getCurrentUser,
  getRestaurantOwners,
  createRestaurantOwner,
  updateRestaurantOwner,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// Get the currently authenticated user
router.get(
  "/me",
  authMiddleware,
  getCurrentUser,
);

// Platform admin: restaurant owners
router.get(
  "/restaurant-owners",
  authMiddleware,
  adminMiddleware,
  getRestaurantOwners,
);

router.post(
  "/restaurant-owners",
  authMiddleware,
  adminMiddleware,
  createRestaurantOwner,
);

router.put(
  "/restaurant-owners/:ownerId",
  authMiddleware,
  adminMiddleware,
  updateRestaurantOwner,
);

export default router;