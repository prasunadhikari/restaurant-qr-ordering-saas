import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type Request, type Response } from "express";

import User from "../models/User.js";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
};

export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "restaurant_owner",
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const createDevelopmentAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "platform_admin",
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Development admin created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Development admin creation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create development admin",
    });
  }
};

export const resetDevelopmentAdminPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and new password are required",
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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      role: "platform_admin",
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Platform admin account not found",
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12,
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Development admin password reset successfully",
    });
  } catch (error) {
    console.error(
      "Development admin password reset error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reset development admin password",
    });
  }
};