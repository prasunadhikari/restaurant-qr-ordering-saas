import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Response } from "express";

import User from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const staffFields = "name email role restaurantId createdAt";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidId = (value: string): boolean =>
  mongoose.Types.ObjectId.isValid(value);

const getRestaurantId = (req: AuthenticatedRequest): string | undefined =>
  req.user?.restaurantId;

const handleError = (error: unknown, res: Response, message: string): void => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "A user with this email already exists",
    });
    return;
  }

  console.error(message, error);
  res.status(500).json({ success: false, message });
};

export const getRestaurantStaff = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant owner account is not assigned to a restaurant",
    });
    return;
  }

  try {
    const staff = await User.find({
      role: "restaurant_staff",
      restaurantId,
    })
      .select(staffFields)
      .sort({ name: 1 });

    res.json({ success: true, data: { staff } });
  } catch (error) {
    handleError(error, res, "Failed to load restaurant staff");
  }
};

export const createRestaurantStaff = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = getRestaurantId(req);
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant owner account is not assigned to a restaurant",
    });
    return;
  }
  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
    return;
  }
  if (!emailPattern.test(email)) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email address",
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

  try {
    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "restaurant_staff",
      restaurantId,
    });
    const staff = await User.findById(user._id).select(staffFields);

    res.status(201).json({
      success: true,
      data: { staff },
    });
  } catch (error) {
    handleError(error, res, "Failed to create restaurant staff account");
  }
};

export const updateRestaurantStaff = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = getRestaurantId(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant owner account is not assigned to a restaurant",
    });
    return;
  }
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid staff account ID" });
    return;
  }

  const updates: { name?: string; email?: string; password?: string } = {};
  let newPassword: string | undefined;
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string" || !req.body.name.trim()) {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }
    updates.name = req.body.name.trim();
  }
  if (req.body.email !== undefined) {
    if (typeof req.body.email !== "string") {
      res.status(400).json({ success: false, message: "Enter a valid email address" });
      return;
    }
    const normalizedEmail = req.body.email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      res.status(400).json({ success: false, message: "Enter a valid email address" });
      return;
    }
    updates.email = normalizedEmail;
  }
  if (req.body.password !== undefined && req.body.password !== "") {
    if (typeof req.body.password !== "string" || req.body.password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }
    newPassword = req.body.password;
  }
  if (Object.keys(updates).length === 0 && !newPassword) {
    res.status(400).json({
      success: false,
      message: "Provide a name, email, or new password",
    });
    return;
  }

  try {
    if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);
    const staff = await User.findOneAndUpdate(
      { _id: id, restaurantId, role: "restaurant_staff" },
      updates,
      { new: true, runValidators: true, projection: staffFields },
    );
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff account not found" });
      return;
    }
    res.json({ success: true, data: { staff } });
  } catch (error) {
    handleError(error, res, "Failed to update restaurant staff account");
  }
};

export const deleteRestaurantStaff = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = getRestaurantId(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Restaurant owner account is not assigned to a restaurant",
    });
    return;
  }
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid staff account ID" });
    return;
  }

  try {
    const staff = await User.findOneAndDelete({
      _id: id,
      restaurantId,
      role: "restaurant_staff",
    });
    if (!staff) {
      res.status(404).json({ success: false, message: "Staff account not found" });
      return;
    }
    res.json({ success: true, message: "Staff account removed" });
  } catch (error) {
    handleError(error, res, "Failed to remove restaurant staff account");
  }
};
