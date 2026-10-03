import { Response } from "express";

import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

/*
|--------------------------------------------------------------------------
| CREATE RESTAURANT — RESTAURANT OWNER
|--------------------------------------------------------------------------
*/

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
        message: "Only restaurant owners can create restaurants",
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

    const existingOwnerRestaurant = await Restaurant.findOne({
      ownerId: req.user.id,
    });

    if (existingOwnerRestaurant) {
      res.status(409).json({
        success: false,
        message: "You already have a restaurant",
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


/*
|--------------------------------------------------------------------------
| CREATE RESTAURANT — PLATFORM ADMIN
|--------------------------------------------------------------------------
|
| Used by the Aagan Admin Dashboard.
| This creates the restaurant first without assigning an owner.
|
*/

export const createRestaurantAsAdmin = async (
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
  ownerId: null,
});

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Admin create restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET MY RESTAURANT
|--------------------------------------------------------------------------
*/

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
        message: "No restaurant found for this account",
      });
      return;
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);

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


/*
|--------------------------------------------------------------------------
| GET ALL RESTAURANTS — PLATFORM ADMIN
|--------------------------------------------------------------------------
*/

export const getAllRestaurants = async (
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

    const restaurants = await Restaurant.find()
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

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

/*
|--------------------------------------------------------------------------
| GET SINGLE RESTAURANT — PLATFORM ADMIN
|--------------------------------------------------------------------------
*/

export const getRestaurantById = async (
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

    const restaurant = await Restaurant.findById(id).populate(
      "ownerId",
      "name email",
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
    console.error("Get restaurant by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant",
    });
  }
};

// Update restaurant information from the admin panel
export const updateRestaurantAsAdmin = async (
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

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
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
      status,
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
      _id: { $ne: restaurant._id },
    });

    if (existingRestaurant) {
      res.status(409).json({
        success: false,
        message: "This restaurant slug is already in use",
      });
      return;
    }

    restaurant.name = name.trim();
    restaurant.slug = normalizedSlug;
    restaurant.logo = logo?.trim() || "";
    restaurant.coverImage = coverImage?.trim() || "";
    restaurant.phone = phone?.trim() || "";
    restaurant.address = address?.trim() || "";

    if (openingHours) {
      restaurant.openingHours = {
        open: openingHours.open || "09:00",
        close: openingHours.close || "22:00",
      };
    }

    if (
      plan === "starter" ||
      plan === "professional" ||
      plan === "custom"
    ) {
      restaurant.plan = plan;
    }

    if (
      status === "active" ||
      status === "pending" ||
      status === "suspended"
    ) {
      restaurant.status = status;
    }

    await restaurant.save();

    const updatedRestaurant = await Restaurant.findById(
      restaurant._id,
    ).populate("ownerId", "name email");

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: {
        restaurant: updatedRestaurant,
      },
    });
  } catch (error) {
    console.error("Admin update restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
    });
  }
};