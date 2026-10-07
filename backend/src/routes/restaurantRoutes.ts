import { Router } from "express";

import {
  createRestaurant,
  createRestaurantAsAdmin,
  getMyRestaurant,
  updateMyRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantAsAdmin,
  uploadMyRestaurantPaymentQr,
  deleteMyRestaurantPaymentQr,
} from "../controllers/restaurantController.js";

import {
  assignRestaurantOwner,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import restaurantOwnerMiddleware from "../middleware/restaurantOwnerMiddleware.js";
import { uploadPaymentQrImage } from "../middleware/paymentQrUpload.js";

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

router.put(
  "/me",
  authMiddleware,
  updateMyRestaurant,
);
router.post(
  "/me/payment-qr/:provider",
  authMiddleware,
  restaurantOwnerMiddleware,
  uploadPaymentQrImage,
  uploadMyRestaurantPaymentQr,
);
router.delete(
  "/me/payment-qr/:provider",
  authMiddleware,
  restaurantOwnerMiddleware,
  deleteMyRestaurantPaymentQr,
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