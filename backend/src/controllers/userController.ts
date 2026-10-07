import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    restaurantId?: string;
  };
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load current user",
    });
  }
};

export const getRestaurantOwners = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform admin access required",
      });
      return;
    }

    const owners = await User.find({
      role: "restaurant_owner",
    })
      .select("-password")
      .populate("restaurantId", "name slug");

    res.status(200).json({
      success: true,
      owners,
    });
  } catch (error) {
    console.error("Get restaurant owners error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load restaurant owners",
    });
  }
};

export const assignRestaurantOwner = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform admin access required",
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

    const owner = await User.findById(ownerId);

    if (!owner || owner.role !== "restaurant_owner") {
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
      res.status(400).json({
        success: false,
        message: "This owner is already assigned to another restaurant",
      });
      return;
    }

    if (restaurant.ownerId) {
      const previousOwner = await User.findById(restaurant.ownerId);

      if (
        previousOwner &&
        previousOwner._id.toString() !== owner._id.toString()
      ) {
        previousOwner.restaurantId = undefined;
        await previousOwner.save();
      }
    }

    restaurant.ownerId = owner._id;
    await restaurant.save();

    owner.restaurantId = restaurant._id;
    await owner.save();

    const updatedRestaurant = await Restaurant.findById(restaurant._id)
      .populate("ownerId", "name email");

    res.status(200).json({
      success: true,
      message: "Restaurant owner assigned successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Assign restaurant owner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign restaurant owner",
    });
  }
};

export const createRestaurantOwner = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform admin access required",
      });
      return;
    }

    const {
      name,
      email,
      password,
      restaurantId,
    } = req.body;

    if (!name || !email || !password || !restaurantId) {
      res.status(400).json({
        success: false,
        message: "Name, email, password, and restaurant are required",
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

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    if (restaurant.ownerId) {
      res.status(400).json({
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
      res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
      return;
    }

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

    const ownerResponse = await User.findById(owner._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Restaurant owner created successfully",
      owner: ownerResponse,
    });
  } catch (error) {
    console.error("Create restaurant owner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant owner",
    });
  }
};

export const updateRestaurantOwner = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "platform_admin") {
      res.status(403).json({
        success: false,
        message: "Platform admin access required",
      });
      return;
    }

    const { ownerId } = req.params;
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
      return;
    }

    if (password !== undefined && password !== "" && password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const owner = await User.findById(ownerId);

    if (!owner || owner.role !== "restaurant_owner") {
      res.status(404).json({
        success: false,
        message: "Restaurant owner not found",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: owner._id },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Another user already uses this email address",
      });
      return;
    }

    owner.name = name.trim();
    owner.email = normalizedEmail;

    if (password && password.trim()) {
      owner.password = await bcrypt.hash(password, 10);
    }

    await owner.save();

    const ownerResponse = await User.findById(owner._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Restaurant owner updated successfully",
      owner: ownerResponse,
    });
  } catch (error) {
    console.error("Update restaurant owner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update restaurant owner",
    });
  }
};

export const changeAdminPassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.user?.role !== "platform_admin" || !req.user.id) {
      res.status(403).json({
        success: false,
        message: "Platform admin access required",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      res.status(400).json({
        success: false,
        message: "Current and new passwords are required",
      });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
      return;
    }
    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: "Choose a new password different from the current one",
      });
      return;
    }

    const admin = await User.findOne({
      _id: req.user.id,
      role: "platform_admin",
    });
    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Platform admin account not found",
      });
      return;
    }
    if (!(await bcrypt.compare(currentPassword, admin.password))) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();
    res.json({
      success: true,
      message: "Admin password changed successfully",
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change admin password",
    });
  }
};