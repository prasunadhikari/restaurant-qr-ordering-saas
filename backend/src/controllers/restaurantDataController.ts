import { Response } from "express";
import mongoose from "mongoose";
import { unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";

import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";
import Order, { OrderStatus } from "../models/Order.js";
import RestaurantTable from "../models/RestaurantTable.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { isGeneratedDishImage } from "../utils/menuImages.js";

type OwnerRequest = AuthenticatedRequest & {
  restaurantId: string;
};

const getOwnerRequest = (
  req: AuthenticatedRequest,
  res: Response,
): OwnerRequest | null => {
  if (
    !req.user ||
    !req.user.restaurantId ||
    req.user.role !== "restaurant_owner"
  ) {
    res.status(403).json({
      success: false,
      message: "Restaurant account access required",
    });
    return null;
  }

  return Object.assign(req, {
    restaurantId: req.user.restaurantId,
  });
};

const isValidId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);

const isValidImageUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.trim().length > 2048) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const handleError = (
  error: unknown,
  res: Response,
  message: string,
): void => {
  console.error(message, error);
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "A record with that name or number already exists",
    });
    return;
  }

  res.status(500).json({ success: false, message });
};

export const getCategories = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  try {
    const categories = await MenuCategory.find({
      restaurantId: owner.restaurantId,
    }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    handleError(error, res, "Failed to load menu categories");
  }
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ success: false, message: "Category name is required" });
    return;
  }

  try {
    const category = await MenuCategory.create({
      restaurantId: owner.restaurantId,
      name,
      description:
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "",
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    handleError(error, res, "Failed to create menu category");
  }
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid category ID" });
    return;
  }

  const updates: { name?: string; description?: string } = {};
  if (typeof req.body.name === "string") {
    updates.name = req.body.name.trim();
    if (!updates.name) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }
  }
  if (typeof req.body.description === "string") {
    updates.description = req.body.description.trim();
  }

  try {
    const category = await MenuCategory.findOneAndUpdate(
      { _id: id, restaurantId: owner.restaurantId },
      updates,
      { new: true, runValidators: true },
    );
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    handleError(error, res, "Failed to update menu category");
  }
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid category ID" });
    return;
  }

  try {
    const hasItems = await MenuItem.exists({
      categoryId: id,
      restaurantId: owner.restaurantId,
    });
    if (hasItems) {
      res.status(409).json({
        success: false,
        message: "Move or delete this category's menu items first",
      });
      return;
    }
    const category = await MenuCategory.findOneAndDelete({
      _id: id,
      restaurantId: owner.restaurantId,
    });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    handleError(error, res, "Failed to delete menu category");
  }
};

export const getMenuItems = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  try {
    const items = await MenuItem.find({
      restaurantId: owner.restaurantId,
    })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        items:             items.map((item) => {
          return {
            ...item.toObject(),
            image: isGeneratedDishImage(item.image) ? "" : item.image,
          };
        }),
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load menu items");
  }
};

export const createMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body.price);
  const categoryId = String(req.body.categoryId || "");
  if (
    !name ||
    !Number.isFinite(price) ||
    price < 0 ||
    !isValidId(categoryId) ||
    (req.body.image !== undefined &&
      req.body.image !== "" &&
      !isValidImageUrl(req.body.image))
  ) {
    res.status(400).json({
      success: false,
      message:
        "Name, a valid category, and a non-negative price are required; dish photo must be a valid HTTP(S) URL",
    });
    return;
  }

  try {
    const category = await MenuCategory.findOne({
      _id: categoryId,
      restaurantId: owner.restaurantId,
    });
    if (!category) {
      res.status(400).json({ success: false, message: "Select a valid category" });
      return;
    }
    const item = await MenuItem.create({
      restaurantId: owner.restaurantId,
      categoryId,
      name,
      price,
      description:
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "",
      image: isValidImageUrl(req.body.image) ? req.body.image.trim() : "",
      available: req.body.available !== false,
    });
    await item.populate("categoryId", "name");
    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    handleError(error, res, "Failed to create menu item");
  }
};

export const addCatalogMenuItems = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  const requested = req.body.items;
  if (
    !Array.isArray(requested) ||
    requested.length === 0 ||
    requested.length > 100
  ) {
    res.status(400).json({
      success: false,
      message: "Select between 1 and 100 menu items",
    });
    return;
  }

  const items: Array<{
    name: string;
    category: string;
    price: number;
    image?: string;
  }> = [];
  for (const item of requested) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    const category =
      typeof item?.category === "string" ? item.category.trim() : "";
    const price = Number(item?.price);
    const image = item?.image;
    if (
      !name ||
      name.length > 100 ||
      !category ||
      category.length > 60 ||
      !Number.isFinite(price) ||
      price < 0 ||
      (image !== undefined && image !== "" && !isValidImageUrl(image))
    ) {
      res.status(400).json({
        success: false,
        message:
          "Each dish needs a name, category, and non-negative price; photo URLs must use HTTP(S)",
      });
      return;
    }
    items.push({
      name,
      category,
      price,
      image: isValidImageUrl(image) ? image.trim() : undefined,
    });
  }

  const uniqueNames = new Set<string>();
  if (items.some((item) => {
    const normalizedName = item.name.toLocaleLowerCase();
    if (uniqueNames.has(normalizedName)) return true;
    uniqueNames.add(normalizedName);
    return false;
  })) {
    res.status(400).json({
      success: false,
      message: "Remove duplicate dishes from your selection",
    });
    return;
  }

  try {
    const existing = await MenuItem.find({
      restaurantId: owner.restaurantId,
      name: { $in: items.map((item) => new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) },
    }).select("name");
    const existingNames = new Set(
      existing.map((item) => item.name.toLocaleLowerCase()),
    );
    const newItems = items.filter(
      (item) => !existingNames.has(item.name.toLocaleLowerCase()),
    );

    const categoryNames = [...new Set(newItems.map((item) => item.category))];
    const categories = new Map<string, mongoose.Types.ObjectId>();
    for (const name of categoryNames) {
      const existingCategory = await MenuCategory.findOne({
        restaurantId: owner.restaurantId,
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      const category = existingCategory || await MenuCategory.create({
        restaurantId: owner.restaurantId,
        name,
      });
      categories.set(name.toLocaleLowerCase(), category._id);
    }

    if (newItems.length > 0) {
      await MenuItem.insertMany(
        newItems.map((item) => ({
          restaurantId: owner.restaurantId,
          categoryId: categories.get(item.category.toLocaleLowerCase()),
          name: item.name,
          price: item.price,
          image: item.image || "",
          available: true,
        })),
      );
    }

    res.status(201).json({
      success: true,
      message: `${newItems.length} dishes added to your menu`,
      data: {
        added: newItems.length,
        skipped: items.length - newItems.length,
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to add selected menu items");
  }
};

export const updateMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid menu item ID" });
    return;
  }

  const updates: Record<string, string | number | boolean> = {};
  if (typeof req.body.name === "string") {
    const name = req.body.name.trim();
    if (!name) {
      res.status(400).json({ success: false, message: "Item name is required" });
      return;
    }
    updates.name = name;
  }
  if (req.body.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ success: false, message: "Price must be zero or greater" });
      return;
    }
    updates.price = price;
  }
  if (typeof req.body.description === "string") {
    updates.description = req.body.description.trim();
  }
  if (typeof req.body.image === "string" && req.body.image.trim()) {
    if (!isValidImageUrl(req.body.image)) {
      res.status(400).json({
        success: false,
        message: "Dish photo must be a valid HTTP(S) URL",
      });
      return;
    }
    updates.image = req.body.image.trim();
  }
  if (typeof req.body.available === "boolean") {
    updates.available = req.body.available;
  }
  try {
    const existingItem = await MenuItem.findOne({
      _id: id,
      restaurantId: owner.restaurantId,
    });
    if (!existingItem) {
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }

    if (req.body.categoryId !== undefined) {
      const categoryId = String(req.body.categoryId);
      if (
        !isValidId(categoryId) ||
        !(await MenuCategory.exists({
          _id: categoryId,
          restaurantId: owner.restaurantId,
        }))
      ) {
        res.status(400).json({ success: false, message: "Select a valid category" });
        return;
      }
      updates.categoryId = categoryId;
    }

    if (req.body.image === "") updates.image = "";

    const item = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: owner.restaurantId },
      updates,
      { new: true, runValidators: true },
    ).populate("categoryId", "name");
    if (!item) {
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }
    res.json({
      success: true,
      data: {
        item: {
          ...item.toObject(),
          image: isGeneratedDishImage(item.image) ? "" : item.image,
        },
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to update menu item");
  }
};

export const uploadMenuItemImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) {
    if (req.file) {
      await unlink(req.file.path).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          console.error("Failed to remove unauthorized menu photo upload:", error);
        }
      });
    }
    return;
  }

  const id = String(req.params.id);
  if (!isValidId(id)) {
    if (req.file) await unlink(req.file.path);
    res.status(400).json({ success: false, message: "Invalid menu item ID" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ success: false, message: "Choose a dish photo to upload" });
    return;
  }

  try {
    const item = await MenuItem.findOne({
      _id: id,
      restaurantId: owner.restaurantId,
    });
    if (!item) {
      await unlink(req.file.path);
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }

    const previousImage = item.image;
    item.image = `/uploads/menu/${req.file.filename}`;
    await item.save();
    await item.populate("categoryId", "name");

    if (previousImage.startsWith("/uploads/menu/")) {
      const previousPath = resolve(
        process.cwd(),
        "uploads",
        "menu",
        basename(previousImage),
      );
      if (previousPath !== req.file.path) {
        await unlink(previousPath).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOENT") {
            console.error("Failed to remove replaced menu photo:", error);
          }
        });
      }
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    console.error("Failed to upload menu item photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload dish photo",
    });
  }
};

export const deleteMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid menu item ID" });
    return;
  }

  try {
    const item = await MenuItem.findOneAndDelete({
      _id: id,
      restaurantId: owner.restaurantId,
    });
    if (!item) {
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }
    if (item.image.startsWith("/uploads/menu/")) {
      const imagePath = resolve(
        process.cwd(),
        "uploads",
        "menu",
        basename(item.image),
      );
      await unlink(imagePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          console.error("Failed to remove deleted menu photo:", error);
        }
      });
    }
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    handleError(error, res, "Failed to delete menu item");
  }
};

export const getTables = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  try {
    const tables = await RestaurantTable.find({
      restaurantId: owner.restaurantId,
    }).sort({ tableNumber: 1 });
    res.json({ success: true, data: { tables } });
  } catch (error) {
    handleError(error, res, "Failed to load restaurant tables");
  }
};

export const createTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const tableNumber = String(req.body.tableNumber || "").trim();
  const capacity = Number(req.body.capacity);
  if (!tableNumber || !Number.isInteger(capacity) || capacity < 1) {
    res.status(400).json({
      success: false,
      message: "Table number and a positive whole-number capacity are required",
    });
    return;
  }

  try {
    const table = await RestaurantTable.create({
      restaurantId: owner.restaurantId,
      tableNumber,
      capacity,
    });
    res.status(201).json({ success: true, data: { table } });
  } catch (error) {
    handleError(error, res, "Failed to create restaurant table");
  }
};

export const updateTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid table ID" });
    return;
  }

  const updates: { tableNumber?: string; capacity?: number; status?: string } = {};
  if (req.body.tableNumber !== undefined) {
    const tableNumber = String(req.body.tableNumber).trim();
    if (!tableNumber) {
      res.status(400).json({ success: false, message: "Table number is required" });
      return;
    }
    updates.tableNumber = tableNumber;
  }
  if (req.body.capacity !== undefined) {
    const capacity = Number(req.body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      res.status(400).json({ success: false, message: "Capacity must be a positive whole number" });
      return;
    }
    updates.capacity = capacity;
  }
  if (req.body.status !== undefined) {
    if (!["available", "occupied"].includes(req.body.status)) {
      res.status(400).json({ success: false, message: "Invalid table status" });
      return;
    }
    updates.status = req.body.status;
  }

  try {
    const table = await RestaurantTable.findOneAndUpdate(
      { _id: id, restaurantId: owner.restaurantId },
      updates,
      { new: true, runValidators: true },
    );
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    res.json({ success: true, data: { table } });
  } catch (error) {
    handleError(error, res, "Failed to update restaurant table");
  }
};

export const deleteTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid table ID" });
    return;
  }

  try {
    if (await Order.exists({ tableId: id, restaurantId: owner.restaurantId })) {
      res.status(409).json({
        success: false,
        message: "Tables with order history cannot be deleted",
      });
      return;
    }
    const table = await RestaurantTable.findOneAndDelete({
      _id: id,
      restaurantId: owner.restaurantId,
    });
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    res.json({ success: true, message: "Table deleted" });
  } catch (error) {
    handleError(error, res, "Failed to delete restaurant table");
  }
};

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  try {
    const orders = await Order.find({
      restaurantId: owner.restaurantId,
    })
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    handleError(error, res, "Failed to load restaurant orders");
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;
  const id = String(req.params.id);
  const statuses: OrderStatus[] = [
    "pending",
    "accepted",
    "preparing",
    "ready",
    "served",
    "New",
    "Preparing",
    "Ready",
    "Served",
  ];
  if (!isValidId(id) || !statuses.includes(req.body.status)) {
    res.status(400).json({ success: false, message: "A valid order and status are required" });
    return;
  }

  try {
    const order = await Order.findOneAndUpdate(
      { _id: id, restaurantId: owner.restaurantId },
      { status: req.body.status },
      { new: true, runValidators: true },
    ).populate("tableId", "tableNumber");
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, data: { order } });
  } catch (error) {
    handleError(error, res, "Failed to update order status");
  }
};

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const owner = getOwnerRequest(req, res);
  if (!owner) return;

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [orders, tableCount, occupiedCount, pendingCount] = await Promise.all([
      Order.find({
        restaurantId: owner.restaurantId,
        createdAt: { $gte: weekStart },
      }).lean(),
      RestaurantTable.countDocuments({ restaurantId: owner.restaurantId }),
      RestaurantTable.countDocuments({
        restaurantId: owner.restaurantId,
        status: "occupied",
      }),
      Order.countDocuments({
        restaurantId: owner.restaurantId,
        status: {
          $in: [
            "pending",
            "accepted",
            "preparing",
            "ready",
            "New",
            "Preparing",
            "Ready",
          ],
        },
      }),
    ]);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        date,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: 0,
        orders: 0,
      };
    });
    const dishes = new Map<string, { name: string; orders: number; revenue: number }>();
    const busyHours = new Map<number, number>();

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dayIndex = Math.floor(
        (new Date(orderDate).setHours(0, 0, 0, 0) -
          new Date(weekStart).setHours(0, 0, 0, 0)) /
          86_400_000,
      );
      if (days[dayIndex]) {
        days[dayIndex].orders += 1;
        days[dayIndex].revenue += order.total;
      }
      busyHours.set(
        orderDate.getHours(),
        (busyHours.get(orderDate.getHours()) || 0) + 1,
      );
      for (const item of order.items) {
        const entry = dishes.get(item.name) || {
          name: item.name,
          orders: 0,
          revenue: 0,
        };
        entry.orders += item.quantity;
        entry.revenue += item.quantity * item.unitPrice;
        dishes.set(item.name, entry);
      }
    }

    const todayOrders = orders.filter(
      (order) => new Date(order.createdAt) >= todayStart,
    );
    const dailyRevenue = days.map(({ day, revenue, orders: count }) => ({
      day,
      revenue,
      orders: count,
    }));
    const topDishes = [...dishes.values()]
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
          todayOrders: todayOrders.length,
          totalTables: tableCount,
          occupiedTables: occupiedCount,
          pendingOrders: pendingCount,
          weekRevenue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
          weekOrders: dailyRevenue.reduce((sum, day) => sum + day.orders, 0),
        },
        dailyRevenue,
        topDishes,
        busyHours: [...busyHours.entries()]
          .map(([hour, count]) => ({
            time: new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            }),
            orders: count,
          }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 6),
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load restaurant analytics");
  }
};
