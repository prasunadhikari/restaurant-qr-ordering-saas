import { Response } from "express";
import { unlink } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";

import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { isRestaurantOpen } from "../utils/restaurantStatus.js";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { uploadPath } from "../utils/uploadStorage.js";

const paymentQrFields = {
  esewa: "esewaQrImage",
  khalti: "khaltiQrImage",
  bank: "bankQrImage",
} as const;

type PaymentQrProvider = keyof typeof paymentQrFields;
const isPaymentQrProvider = (value: unknown): value is PaymentQrProvider =>
  typeof value === "string" && Object.hasOwn(paymentQrFields, value);

const removeStoredPaymentQr = async (imagePath: string): Promise<void> => {
  const filename = basename(imagePath);
  if (!filename || filename.includes("\\")) return;
  const directory = uploadPath("payment-qr");
  const filePath = resolve(directory, filename);
  if (!filePath.startsWith(`${directory}${sep}`)) return;
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
};

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
    if (!req.user || req.user.role !== "restaurant_owner") {
      res.status(401).json({
        success: false,
        message: "Restaurant owner access required",
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
        restaurant: {
          ...restaurant.toObject(),
          isOpen: isRestaurantOpen(restaurant),
        },
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

export const updateMyRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (
      !req.user ||
      !req.user.restaurantId ||
      req.user.role !== "restaurant_owner"
    ) {
      res.status(403).json({
        success: false,
        message: "Restaurant account access required",
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

    const {
      name,
      slug,
      logo,
      coverImage,
      phone,
      address,
      restaurantType,
      openingHours,
      acceptingOrders,
      paymentSettings,
      qrLocation,
    } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({
          success: false,
          message: "Restaurant name is required",
        });
        return;
      }
      restaurant.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== "string" || !slug.trim()) {
        res.status(400).json({
          success: false,
          message: "Restaurant slug is required",
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
      restaurant.slug = normalizedSlug;
    }

    for (const field of [
      "logo",
      "coverImage",
      "phone",
      "address",
      "restaurantType",
    ] as const) {
      if (typeof req.body[field] === "string") {
        restaurant[field] = req.body[field].trim();
      }
    }

    if (openingHours !== undefined) {
      if (
        typeof openingHours?.open !== "string" ||
        typeof openingHours?.close !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openingHours.open) ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openingHours.close)
      ) {
        res.status(400).json({
          success: false,
          message: "Valid opening and closing times are required",
        });
        return;
      }
      restaurant.openingHours = {
        open: openingHours.open,
        close: openingHours.close,
      };
    }

    if (typeof acceptingOrders === "boolean") {
      restaurant.acceptingOrders = acceptingOrders;
    }

    if (qrLocation !== undefined) {
      if (qrLocation === null) {
        restaurant.qrLocation = undefined;
      } else if (
        typeof qrLocation !== "object" ||
        qrLocation === null ||
        typeof qrLocation.latitude !== "number" ||
        !Number.isFinite(qrLocation.latitude) ||
        qrLocation.latitude < -90 ||
        qrLocation.latitude > 90 ||
        typeof qrLocation.longitude !== "number" ||
        !Number.isFinite(qrLocation.longitude) ||
        qrLocation.longitude < -180 ||
        qrLocation.longitude > 180
      ) {
        res.status(400).json({
          success: false,
          message: "Enter a valid restaurant latitude and longitude",
        });
        return;
      } else {
        restaurant.qrLocation = {
          latitude: qrLocation.latitude,
          longitude: qrLocation.longitude,
        };
      }
    }

    if (paymentSettings !== undefined) {
      const imageFields = ["esewaQrImage", "khaltiQrImage", "bankQrImage"] as const;
      const textLimits = {
        bankName: 100,
        bankAccountName: 100,
        bankAccountNumber: 50,
      } as const;
      if (typeof paymentSettings !== "object" || paymentSettings === null || Array.isArray(paymentSettings)) {
        res.status(400).json({
          success: false,
          message: "Valid payment settings are required",
        });
        return;
      }
      const current = restaurant.paymentSettings;
      const next = { ...current };
      for (const field of ["cashEnabled", "esewaEnabled", "khaltiEnabled", "bankEnabled"] as const) {
        if (paymentSettings[field] !== undefined) {
          if (typeof paymentSettings[field] !== "boolean") {
            res.status(400).json({
              success: false,
              message: `Invalid ${field} payment setting`,
            });
            return;
          }
          next[field] = paymentSettings[field];
        }
      }
      for (const field of imageFields) {
        if (paymentSettings[field] !== undefined) {
          const value = paymentSettings[field];
          if (
            typeof value !== "string" ||
            value.length > 2000 ||
            (value !== "" && !/^(https?:\/\/|\/)/i.test(value))
          ) {
            res.status(400).json({
              success: false,
              message: `Invalid ${field} image URL`,
            });
            return;
          }
          next[field] = value.trim();
        }
      }
      for (const [field, maxLength] of Object.entries(textLimits) as Array<
        [keyof typeof textLimits, number]
      >) {
        if (paymentSettings[field] !== undefined) {
          const value = paymentSettings[field];
          if (typeof value !== "string" || value.length > maxLength) {
            res.status(400).json({
              success: false,
              message: `Invalid ${field} payment setting`,
            });
            return;
          }
          next[field] = value.trim();
        }
      }
      restaurant.paymentSettings = next;
    }

    await restaurant.save();
    res.json({
      success: true,
      message: "Restaurant settings updated",
      data: { restaurant },
    });
  } catch (error) {
    console.error("Update my restaurant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant settings",
    });
  }
};

export const uploadMyRestaurantPaymentQr = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user?.restaurantId || req.user.role !== "restaurant_owner") {
    if (req.file) {
      await unlink(req.file.path).catch((error: unknown) =>
        console.error("Unable to remove unauthorized payment QR upload:", error),
      );
    }
    res.status(403).json({ success: false, message: "Restaurant owner access required" });
    return;
  }

  const provider = req.params.provider;
  if (!isPaymentQrProvider(provider)) {
    if (req.file) {
      await unlink(req.file.path).catch((error: unknown) =>
        console.error("Unable to remove invalid payment QR upload:", error),
      );
    }
    res.status(400).json({ success: false, message: "Choose a valid payment QR provider" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ success: false, message: "Choose a QR image to upload" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      await unlink(req.file.path);
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }

    const field = paymentQrFields[provider];
    const previousImage = restaurant.paymentSettings?.[field] ?? "";
    const image = `/uploads/payment-qr/${req.file.filename}`;
    restaurant.paymentSettings = {
      cashEnabled: restaurant.paymentSettings?.cashEnabled ?? true,
      esewaEnabled: restaurant.paymentSettings?.esewaEnabled ?? false,
      esewaQrImage: restaurant.paymentSettings?.esewaQrImage ?? "",
      khaltiEnabled: restaurant.paymentSettings?.khaltiEnabled ?? false,
      khaltiQrImage: restaurant.paymentSettings?.khaltiQrImage ?? "",
      bankEnabled: restaurant.paymentSettings?.bankEnabled ?? false,
      bankQrImage: restaurant.paymentSettings?.bankQrImage ?? "",
      bankName: restaurant.paymentSettings?.bankName ?? "",
      bankAccountName: restaurant.paymentSettings?.bankAccountName ?? "",
      bankAccountNumber: restaurant.paymentSettings?.bankAccountNumber ?? "",
      [field]: image,
    };
    await restaurant.save();

    if (previousImage.startsWith("/uploads/payment-qr/")) {
      try {
        await removeStoredPaymentQr(previousImage.slice("/uploads/payment-qr/".length));
      } catch (error) {
        console.error("Failed to remove replaced payment QR image:", error);
      }
    }
    res.json({ success: true, data: { image } });
  } catch (error) {
    await unlink(req.file.path).catch((cleanupError: unknown) =>
      console.error("Failed to clean up payment QR upload:", cleanupError),
    );
    console.error("Upload restaurant payment QR error:", error);
    res.status(500).json({ success: false, message: "Failed to upload payment QR image" });
  }
};

export const deleteMyRestaurantPaymentQr = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user?.restaurantId || req.user.role !== "restaurant_owner") {
    res.status(403).json({ success: false, message: "Restaurant owner access required" });
    return;
  }
  const provider = req.params.provider;
  if (!isPaymentQrProvider(provider)) {
    res.status(400).json({ success: false, message: "Choose a valid payment QR provider" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }
    const field = paymentQrFields[provider];
    const previousImage = restaurant.paymentSettings?.[field] ?? "";
    restaurant.paymentSettings = {
      cashEnabled: restaurant.paymentSettings?.cashEnabled ?? true,
      esewaEnabled: restaurant.paymentSettings?.esewaEnabled ?? false,
      esewaQrImage: restaurant.paymentSettings?.esewaQrImage ?? "",
      khaltiEnabled: restaurant.paymentSettings?.khaltiEnabled ?? false,
      khaltiQrImage: restaurant.paymentSettings?.khaltiQrImage ?? "",
      bankEnabled: restaurant.paymentSettings?.bankEnabled ?? false,
      bankQrImage: restaurant.paymentSettings?.bankQrImage ?? "",
      bankName: restaurant.paymentSettings?.bankName ?? "",
      bankAccountName: restaurant.paymentSettings?.bankAccountName ?? "",
      bankAccountNumber: restaurant.paymentSettings?.bankAccountNumber ?? "",
      [field]: "",
    };
    await restaurant.save();

    if (previousImage.startsWith("/uploads/payment-qr/")) {
      try {
        await removeStoredPaymentQr(previousImage.slice("/uploads/payment-qr/".length));
      } catch (error) {
        console.error("Failed to remove deleted payment QR image:", error);
      }
    }
    res.json({ success: true, data: { image: "" } });
  } catch (error) {
    console.error("Delete restaurant payment QR error:", error);
    res.status(500).json({ success: false, message: "Failed to remove payment QR image" });
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