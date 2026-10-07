import { Response } from "express";

import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";
import User from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getAdminOverview = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const [
      restaurants,
      activeRestaurants,
      pendingRestaurants,
      suspendedRestaurants,
      orders,
      pendingOrders,
      tables,
      owners,
      managers,
      staff,
      recentRestaurants,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: "active" }),
      Restaurant.countDocuments({ status: "pending" }),
      Restaurant.countDocuments({ status: "suspended" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "New"] } }),
      RestaurantTable.countDocuments(),
      User.countDocuments({ role: "restaurant_owner" }),
      User.countDocuments({ role: "restaurant_manager" }),
      User.countDocuments({ role: "restaurant_staff" }),
      Restaurant.find()
        .select("name slug address status plan createdAt")
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          restaurants,
          activeRestaurants,
          pendingRestaurants,
          suspendedRestaurants,
          orders,
          pendingOrders,
          tables,
          owners,
          managers,
          staff,
        },
        recentRestaurants,
      },
    });
  } catch (error) {
    console.error("Failed to load admin overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load platform overview",
    });
  }
};

export const getAdminOrders = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("restaurantId", "name slug")
      .populate("tableId", "tableNumber");

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Failed to load platform orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load platform orders",
    });
  }
};

export const getAdminUsers = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find({
      role: { $in: ["restaurant_owner", "restaurant_manager", "restaurant_staff"] },
    })
      .select("name email role restaurantId createdAt")
      .populate("restaurantId", "name slug")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error("Failed to load platform users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load platform users",
    });
  }
};
