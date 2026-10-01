import { Request, Response } from "express";

import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const createRestaurant = async (
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

    if (req.user.role !== "restaurant_owner") {
      res.status(403).json({
        success: false,
        message: "Only restaurant owners can create a restaurant",
      });

      return;
    }

    if (req.user.restaurantId) {
      res.status(409).json({
        success: false,
        message: "You already have a restaurant",
      });

      return;
    }

    const {
      name,
      slug,
      logo,
      coverImage,
      phone,
      address,
      openingHours,
      plan,
    } = req.body;

    if (!name || !slug) {
      res.status(400).json({
        success: false,
        message: "Restaurant name and slug are required",
      });

      return;
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingRestaurant = await Restaurant.findOne({
      slug: normalizedSlug,
    });

    if (existingRestaurant) {
      res.status(409).json({
        success: false,
        message: "This restaurant slug is already in use",
      });

      return;
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      slug: normalizedSlug,
      logo: logo || "",
      coverImage: coverImage || "",
      phone: phone || "",
      address: address || "",
      openingHours: openingHours || {
        open: "09:00",
        close: "22:00",
      },
      plan: plan || "starter",
      status: "active",
      ownerId: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      restaurantId: restaurant._id,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Create restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
    });
  }
};

export const getMyRestaurant = async (
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

    if (!req.user.restaurantId) {
      res.status(404).json({
        success: false,
        message: "No restaurant is associated with this account",
      });

      return;
    }

    const restaurant = await Restaurant.findById(
      req.user.restaurantId,
    );

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Get my restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
    });
  }
};
export const getAllRestaurants = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .populate("ownerId", "name email");

    res.status(200).json({
      success: true,
      data: {
        restaurants,
      },
    });
  } catch (error) {
    console.error("Get all restaurants error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
    });
  }
};