import { Router } from "express";

import authMiddleware, {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getRestaurantOwners,
  createRestaurantOwner,
} from "../controllers/userController.js";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  },
);

// Get restaurant owners for the admin panel
router.get(
  "/admin/restaurant-owners",
  authMiddleware,
  adminMiddleware,
  getRestaurantOwners,
);

// Create an owner account for a restaurant
router.post(
  "/admin/restaurants/:id/owner",
  authMiddleware,
  adminMiddleware,
  createRestaurantOwner,
);

export default router;