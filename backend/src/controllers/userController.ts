import { Response } from "express";

import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// Get restaurant owner accounts for the admin panel
export const getRestaurantOwners = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (req.user.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform administrator access required",
      });
      return;
    }

    const owners = await User.find({
      role: "restaurant_owner",
    })
      .select("_id name email restaurantId")
      .populate("restaurantId", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        owners,
      },
    });
  } catch (error) {
    console.error("Get restaurant owners error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant owners",
    });
  }
};

// Assign an existing owner to a restaurant
export const assignRestaurantOwner = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (req.user.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform administrator access required",
      });
      return;
    }

    const { id } = req.params;
    const { ownerId } = req.body;

    if (!ownerId) {
      res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
      return;
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    const owner = await User.findOne({
      _id: ownerId,
      role: "restaurant_owner",
    });

    if (!owner) {
      res.status(404).json({
        success: false,
        message: "Restaurant owner not found",
      });
      return;
    }

    if (
      owner.restaurantId &&
      owner.restaurantId.toString() !== restaurant._id.toString()
    ) {
      res.status(409).json({
        success: false,
        message: "This owner is already assigned to another restaurant",
      });
      return;
    }

    if (restaurant.ownerId) {
      await User.findByIdAndUpdate(restaurant.ownerId, {
        $unset: {
          restaurantId: "",
        },
      });
    }

    restaurant.ownerId = owner._id;
    await restaurant.save();

    owner.restaurantId = restaurant._id;
    await owner.save();

    const updatedRestaurant = await Restaurant.findById(
      restaurant._id,
    ).populate("ownerId", "name email");

    res.status(200).json({
      success: true,
      message: "Restaurant owner assigned successfully",
      data: {
        restaurant: updatedRestaurant,
      },
    });
  } catch (error) {
    console.error("Assign restaurant owner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign restaurant owner",
    });
  }
};

// Create a restaurant owner and connect them to a restaurant
export const createRestaurantOwner = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (req.user.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform administrator access required",
      });
      return;
    }

    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    if (restaurant.ownerId) {
      res.status(409).json({
        success: false,
        message: "This restaurant already has an owner",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    const bcrypt = await import("bcryptjs");

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "restaurant_owner",
      restaurantId: restaurant._id,
    });

    restaurant.ownerId = owner._id;
    await restaurant.save();

    const updatedRestaurant = await Restaurant.findById(
      restaurant._id,
    ).populate("ownerId", "name email");

    res.status(201).json({
      success: true,
      message: "Restaurant owner created successfully",
      data: {
        restaurant: updatedRestaurant,
        owner: {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
        },
      },
    });
  } catch (error) {
    console.error("Create restaurant owner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant owner",
    });
  }
};