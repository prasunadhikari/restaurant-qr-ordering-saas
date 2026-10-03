import { Router } from "express";

import {
  createRestaurant,
  createRestaurantAsAdmin,
  getMyRestaurant,
  getAllRestaurants,
} from "../controllers/restaurantController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| RESTAURANT OWNER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createRestaurant,
);


/*
|--------------------------------------------------------------------------
| PLATFORM ADMIN
|--------------------------------------------------------------------------
|
| Admin Dashboard → Add Restaurant
|
*/

router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  createRestaurantAsAdmin,
);


/*
|--------------------------------------------------------------------------
| CURRENT USER RESTAURANT
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authMiddleware,
  getMyRestaurant,
);


/*
|--------------------------------------------------------------------------
| ADMIN — ALL RESTAURANTS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllRestaurants,
);


export default router;