import { Router } from "express";

import {
  getRestaurantOwners,
  createRestaurantOwner,
  updateRestaurantOwner,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

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