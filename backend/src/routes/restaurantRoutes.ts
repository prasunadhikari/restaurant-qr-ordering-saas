import { Router } from "express";

import {
  createRestaurant,
  createRestaurantAsAdmin,
  getMyRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantAsAdmin,
} from "../controllers/restaurantController.js";

import {
  assignRestaurantOwner,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

// Restaurant owner creates their restaurant
router.post(
  "/",
  authMiddleware,
  createRestaurant,
);

// Platform admin creates a restaurant
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  createRestaurantAsAdmin,
);

// Get the restaurant belonging to the logged-in user
router.get(
  "/me",
  authMiddleware,
  getMyRestaurant,
);

// Get all restaurants for the admin dashboard
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllRestaurants,
);

// Get one restaurant for the admin management page
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getRestaurantById,
);

// Update restaurant information from the admin panel
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  updateRestaurantAsAdmin,
);

// Assign an owner to a restaurant
router.put(
  "/admin/:id/owner",
  authMiddleware,
  adminMiddleware,
  assignRestaurantOwner,
);

export default router;