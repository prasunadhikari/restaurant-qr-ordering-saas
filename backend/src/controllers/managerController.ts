import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import type { Response } from "express";
import { unlink } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";

import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";
import Order, { type OrderPaymentStatus, type OrderStatus } from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";
import TableSession from "../models/TableSession.js";
import User from "../models/User.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { syncTableOccupancy } from "../utils/tableOccupancy.js";

const idFor = (req: AuthenticatedRequest): string | undefined =>
  req.user?.role === "restaurant_manager" ? req.user.restaurantId : undefined;
const validId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);
const errorResponse = (error: unknown, res: Response, message: string): void => {
  console.error(message, error);
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({ success: false, message: "A record with that name or number already exists" });
    return;
  }
  res.status(500).json({ success: false, message });
};

const populateOrders = async (orders: Awaited<ReturnType<typeof Order.find>>) => {
  await Promise.all(orders.map((order) => order.populate("tableId", "tableNumber")));
  return orders;
};

export const getManagerProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId || !req.user) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const restaurant = await Restaurant.findById(restaurantId).select("name slug logo");
    if (!restaurant) {
      res.status(404).json({ success: false, message: "Assigned restaurant not found" });
      return;
    }
    res.json({
      success: true,
      data: {
        user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
        restaurant: { id: restaurant._id, name: restaurant.name, slug: restaurant.slug, logo: restaurant.logo },
      },
    });
  } catch (error) {
    errorResponse(error, res, "Failed to load manager profile");
  }
};

export const getManagerDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [orders, pendingPayments, sales, todayOrders] = await Promise.all([
      Order.find({ restaurantId }).select("status").limit(5000),
      Order.countDocuments({ restaurantId, paymentStatus: { $in: ["pending", "pending_verification"] } }),
      Order.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), paymentStatus: "paid", createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ restaurantId, createdAt: { $gte: today } }),
    ]);
    const counts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      served: 0,
      cancelled: 0,
    };
    for (const order of orders) {
      const status = String(order.status).toLowerCase();
      const normalized =
        status === "new" ? "pending" :
          status === "preparing" ? "preparing" :
            status === "ready" ? "ready" :
              status === "served" ? "served" : status;
      if (normalized in counts) counts[normalized] += 1;
    }
    res.json({
      success: true,
      data: {
        orders: counts,
        pendingPayments,
        todaySales: sales[0]?.total ?? 0,
        todayOrders,
      },
    });
  } catch (error) {
    errorResponse(error, res, "Failed to load manager dashboard");
  }
};

export const getManagerOrders = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const orders = await populateOrders(
      await Order.find({ restaurantId }).sort({ createdAt: -1 }).limit(500),
    );
    res.json({ success: true, data: { orders } });
  } catch (error) {
    errorResponse(error, res, "Failed to load restaurant orders");
  }
};

export const getManagerOrder = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid order ID" });
    return;
  }
  try {
    const order = await Order.findOne({ _id: id, restaurantId }).populate("tableId", "tableNumber");
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, data: { order } });
  } catch (error) {
    errorResponse(error, res, "Failed to load order");
  }
};

const normalizedOrderStatus = (status: OrderStatus): string => {
  if (status === "New") return "pending";
  return status.toLowerCase();
};

export const updateManagerOrder = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  const requestedStatus: unknown = req.body?.status;
  const reason: unknown = req.body?.reason;
  const allowed = ["pending", "accepted", "preparing", "ready", "served", "cancelled"];
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id) || typeof requestedStatus !== "string" || !allowed.includes(requestedStatus)) {
    res.status(400).json({ success: false, message: "Choose a valid order status" });
    return;
  }
  if (reason !== undefined && (typeof reason !== "string" || reason.trim().length > 500)) {
    res.status(400).json({ success: false, message: "Decline reason must be 500 characters or fewer" });
    return;
  }

  try {
    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    const current = normalizedOrderStatus(order.status);
    const transitions: Record<string, string[]> = {
      pending: ["accepted", "cancelled"],
      accepted: ["preparing", "cancelled"],
      preparing: ["ready"],
      ready: ["served"],
      served: [],
      cancelled: [],
    };
    if (!transitions[current]?.includes(requestedStatus)) {
      res.status(409).json({
        success: false,
        message: `Cannot move an order from ${current} to ${requestedStatus}`,
      });
      return;
    }
    if (requestedStatus === "cancelled" && typeof reason !== "string") {
      res.status(400).json({ success: false, message: "A reason is required to decline or cancel an order" });
      return;
    }
    order.status = requestedStatus as OrderStatus;
    if (requestedStatus === "cancelled") {
      order.declineReason = typeof reason === "string" ? reason.trim() : "";
    }
    await order.save();
    await syncTableOccupancy(order.tableId, order.restaurantId);
    await order.populate("tableId", "tableNumber");
    res.json({ success: true, data: { order } });
  } catch (error) {
    errorResponse(error, res, "Failed to update order");
  }
};

export const getManagerCategories = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const categories = await MenuCategory.find({ restaurantId }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    errorResponse(error, res, "Failed to load menu categories");
  }
};

export const createManagerCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!name) {
    res.status(400).json({ success: false, message: "Category name is required" });
    return;
  }
  try {
    const category = await MenuCategory.create({
      restaurantId,
      name,
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    errorResponse(error, res, "Failed to create menu category");
  }
};

export const updateManagerCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid category ID" });
    return;
  }
  const updates: { name?: string; description?: string; isActive?: boolean } = {};
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string" || !req.body.name.trim()) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }
    updates.name = req.body.name.trim();
  }
  if (typeof req.body.description === "string") updates.description = req.body.description.trim();
  if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
  if (!Object.keys(updates).length) {
    res.status(400).json({ success: false, message: "Provide category details to update" });
    return;
  }
  try {
    const category = await MenuCategory.findOneAndUpdate(
      { _id: id, restaurantId }, updates, { new: true, runValidators: true },
    );
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    errorResponse(error, res, "Failed to update menu category");
  }
};

export const deleteManagerCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid category ID" });
    return;
  }
  try {
    if (await MenuItem.exists({ categoryId: id, restaurantId })) {
      res.status(409).json({ success: false, message: "Categories with menu items cannot be deleted; disable the category instead" });
      return;
    }
    const category = await MenuCategory.findOneAndDelete({ _id: id, restaurantId });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    errorResponse(error, res, "Failed to delete menu category");
  }
};

export const getManagerMenu = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const [categories, items] = await Promise.all([
      MenuCategory.find({ restaurantId }).sort({ sortOrder: 1, name: 1 }),
      MenuItem.find({ restaurantId }).populate("categoryId", "name").sort({ name: 1 }),
    ]);
    res.json({ success: true, data: { categories, items } });
  } catch (error) {
    errorResponse(error, res, "Failed to load menu");
  }
};

export const createManagerMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const { name, description, price, image, categoryId } = req.body ?? {};
  const parsedPrice = Number(price);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (
    typeof name !== "string" || !name.trim() ||
    !Number.isFinite(parsedPrice) || parsedPrice < 0 ||
    typeof categoryId !== "string" || !validId(categoryId)
  ) {
    res.status(400).json({ success: false, message: "Name, category, and non-negative price are required" });
    return;
  }
  try {
    const category = await MenuCategory.findOne({ _id: categoryId, restaurantId });
    if (!category) {
      res.status(400).json({ success: false, message: "Choose a category for this restaurant" });
      return;
    }
    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      price: parsedPrice,
      image: typeof image === "string" ? image.trim() : "",
      available: req.body.available !== false,
    });
    await item.populate("categoryId", "name");
    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    errorResponse(error, res, "Failed to create menu item");
  }
};

export const updateManagerMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid menu item ID" });
    return;
  }
  const updates: Record<string, string | number | boolean | mongoose.Types.ObjectId> = {};
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string" || !req.body.name.trim()) {
      res.status(400).json({ success: false, message: "Item name is required" });
      return;
    }
    updates.name = req.body.name.trim();
  }
  if (req.body.description !== undefined) {
    if (typeof req.body.description !== "string") {
      res.status(400).json({ success: false, message: "Description must be text" });
      return;
    }
    updates.description = req.body.description.trim();
  }
  if (req.body.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ success: false, message: "Price must be non-negative" });
      return;
    }
    updates.price = price;
  }
  for (const field of ["image"] as const) {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] !== "string" || req.body[field].length > 2048) {
        res.status(400).json({ success: false, message: "Invalid image path" });
        return;
      }
      updates[field] = req.body[field].trim();
    }
  }
  if (typeof req.body.available === "boolean") updates.available = req.body.available;
  if (req.body.categoryId !== undefined) {
    if (typeof req.body.categoryId !== "string" || !validId(req.body.categoryId)) {
      res.status(400).json({ success: false, message: "Invalid category" });
      return;
    }
    const category = await MenuCategory.findOne({ _id: req.body.categoryId, restaurantId });
    if (!category) {
      res.status(400).json({ success: false, message: "Choose a category for this restaurant" });
      return;
    }
    updates.categoryId = category._id;
  }
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId }, updates, { new: true, runValidators: true },
    ).populate("categoryId", "name");
    if (!item) {
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }
    res.json({ success: true, data: { item } });
  } catch (error) {
    errorResponse(error, res, "Failed to update menu item");
  }
};

export const uploadManagerMenuItemImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    if (req.file) await unlink(req.file.path).catch((error: unknown) => console.error("Unable to remove unauthorized menu image:", error));
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id) || !req.file) {
    if (req.file) await unlink(req.file.path).catch((error: unknown) => console.error("Unable to remove invalid menu image:", error));
    res.status(400).json({ success: false, message: "Choose a valid menu item and image" });
    return;
  }
  try {
    const item = await MenuItem.findOne({ _id: id, restaurantId });
    if (!item) {
      await unlink(req.file.path);
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }
    const previousImage = item.image;
    item.image = `/uploads/menu/${req.file.filename}`;
    await item.save();
    if (previousImage.startsWith("/uploads/menu/")) {
      const filename = basename(previousImage);
      const directory = resolve(process.cwd(), "uploads", "menu");
      const previousFile = resolve(directory, filename);
      if (previousFile.startsWith(`${directory}${sep}`)) {
        await unlink(previousFile).catch((error: unknown) => {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            console.error("Failed to remove replaced dish image:", error);
          }
        });
      }
    }
    await item.populate("categoryId", "name");
    res.json({ success: true, data: { item } });
  } catch (error) {
    await unlink(req.file.path).catch((cleanupError: unknown) =>
      console.error("Failed to clean up dish image upload:", cleanupError),
    );
    errorResponse(error, res, "Failed to upload menu item image");
  }
};

export const deleteManagerMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid menu item ID" });
    return;
  }
  try {
    if (await Order.exists({ restaurantId, "items.menuItemId": id })) {
      res.status(409).json({ success: false, message: "Menu items with order history cannot be deleted; mark them unavailable instead" });
      return;
    }
    const item = await MenuItem.findOneAndDelete({ _id: id, restaurantId });
    if (!item) {
      res.status(404).json({ success: false, message: "Menu item not found" });
      return;
    }
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    errorResponse(error, res, "Failed to delete menu item");
  }
};

export const getManagerTables = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const tables = await RestaurantTable.find({ restaurantId }).sort({ tableNumber: 1 });
    res.json({ success: true, data: { tables } });
  } catch (error) {
    errorResponse(error, res, "Failed to load tables");
  }
};

export const closeManagerTableSession = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId =
    req.user?.role === "restaurant_manager" || req.user?.role === "restaurant_staff"
      ? req.user.restaurantId
      : undefined;
  const tableId = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(tableId)) {
    res.status(400).json({ success: false, message: "Invalid table ID" });
    return;
  }
  try {
    const table = await RestaurantTable.findOne({ _id: tableId, restaurantId });
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    const session = await TableSession.findOne({
      restaurantId,
      tableId: table._id,
      status: "active",
    });
    if (!session) {
      res.status(404).json({ success: false, message: "There is no active session for this table" });
      return;
    }
    const orders = await Order.find({
      restaurantId,
      tableId: table._id,
      tableSessionId: session._id,
    }).select("status paymentStatus");
    const unsettled = orders.some((order) => {
      const status = normalizedOrderStatus(order.status);
      if (status === "cancelled") {
        return ["pending", "pending_verification", "paid"].includes(order.paymentStatus);
      }
      return status !== "served" || order.paymentStatus !== "paid";
    });
    if (unsettled) {
      res.status(409).json({
        success: false,
        message: "All orders in this session must be served and paid, or cancelled with no payment awaiting review, before closing the table",
      });
      return;
    }

    const closedSession = await TableSession.findOneAndUpdate(
      { _id: session._id, restaurantId, status: "active" },
      { $set: { status: "closed", closedAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!closedSession) {
      res.status(409).json({ success: false, message: "The table session has already been closed" });
      return;
    }
    res.json({
      success: true,
      data: {
        session: {
          tableNumber: closedSession.tableNumber,
          status: closedSession.status,
          startedAt: closedSession.startedAt,
          closedAt: closedSession.closedAt,
        },
      },
    });
  } catch (error) {
    errorResponse(error, res, "Failed to close table session");
  }
};

export const createManagerTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const tableNumber = typeof req.body?.tableNumber === "string" ? req.body.tableNumber.trim() : "";
  const capacity = Number(req.body?.capacity);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!tableNumber || !Number.isInteger(capacity) || capacity < 1) {
    res.status(400).json({ success: false, message: "Table number and positive capacity are required" });
    return;
  }
  try {
    const table = await RestaurantTable.create({ restaurantId, tableNumber, capacity });
    res.status(201).json({ success: true, data: { table } });
  } catch (error) {
    errorResponse(error, res, "Failed to create table");
  }
};

export const updateManagerTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid table ID" });
    return;
  }
  const updates: { tableNumber?: string; capacity?: number; isActive?: boolean } = {};
  if (req.body.tableNumber !== undefined) {
    if (typeof req.body.tableNumber !== "string" || !req.body.tableNumber.trim()) {
      res.status(400).json({ success: false, message: "Table number is required" });
      return;
    }
    updates.tableNumber = req.body.tableNumber.trim();
  }
  if (req.body.capacity !== undefined) {
    const capacity = Number(req.body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      res.status(400).json({ success: false, message: "Capacity must be a positive whole number" });
      return;
    }
    updates.capacity = capacity;
  }
  if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
  try {
    const table = await RestaurantTable.findOneAndUpdate(
      { _id: id, restaurantId }, updates, { new: true, runValidators: true },
    );
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    res.json({ success: true, data: { table } });
  } catch (error) {
    errorResponse(error, res, "Failed to update table");
  }
};

export const deleteManagerTable = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid table ID" });
    return;
  }
  try {
    if (await Order.exists({ tableId: id, restaurantId })) {
      res.status(409).json({ success: false, message: "Tables with order history cannot be deleted" });
      return;
    }
    const table = await RestaurantTable.findOneAndDelete({ _id: id, restaurantId });
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    res.json({ success: true, message: "Table deleted" });
  } catch (error) {
    errorResponse(error, res, "Failed to delete table");
  }
};

export const getManagerPayments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const orders = await populateOrders(
      await Order.find({ restaurantId })
        .sort({ updatedAt: -1 }).limit(500),
    );
    res.json({ success: true, data: { payments: orders } });
  } catch (error) {
    errorResponse(error, res, "Failed to load payments");
  }
};

export const updateManagerPayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  const id = String(req.params.id);
  const action: unknown = req.body?.action;
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  if (!validId(id) || (action !== "confirm" && action !== "reject")) {
    res.status(400).json({ success: false, message: "Choose a valid payment action" });
    return;
  }
  try {
    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    const status = order.paymentStatus ?? "unpaid";
    if (
      !order.paymentMethod ||
      !["pending", "pending_verification"].includes(status) ||
      (action === "confirm" && order.paymentMethod !== "cash" && status !== "pending_verification") ||
      (action === "reject" && (order.paymentMethod === "cash" || status !== "pending_verification"))
    ) {
      res.status(409).json({ success: false, message: "This payment is not awaiting this action" });
      return;
    }
    order.paymentStatus = (action === "confirm" ? "paid" : "rejected") as OrderPaymentStatus;
    await order.save();
    res.json({ success: true, data: { paymentStatus: order.paymentStatus } });
  } catch (error) {
    errorResponse(error, res, "Failed to update payment");
  }
};

export const getManagerBills = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = idFor(req);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Manager account is not assigned to a restaurant" });
    return;
  }
  try {
    const orders = await populateOrders(
      await Order.find({ restaurantId, status: { $nin: ["cancelled"] } }).sort({ createdAt: -1 }).limit(500),
    );
    res.json({ success: true, data: { bills: orders } });
  } catch (error) {
    errorResponse(error, res, "Failed to load bills");
  }
};

export const createManager = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!restaurantId || req.user?.role !== "restaurant_owner") {
    res.status(403).json({ success: false, message: "Restaurant owner access required" });
    return;
  }
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
    res.status(400).json({ success: false, message: "Name, valid email, and password of at least 6 characters are required" });
    return;
  }
  try {
    if (await User.exists({ email })) {
      res.status(409).json({ success: false, message: "A user with this email already exists" });
      return;
    }
    const manager = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "restaurant_manager",
      restaurantId,
    });
    const safeManager = await User.findById(manager._id).select("name email role restaurantId createdAt");
    res.status(201).json({ success: true, data: { manager: safeManager } });
  } catch (error) {
    errorResponse(error, res, "Failed to create manager account");
  }
};

export const getRestaurantManagers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId || req.user?.role !== "restaurant_owner") {
    res.status(403).json({ success: false, message: "Restaurant owner access required" });
    return;
  }
  try {
    const managers = await User.find({ role: "restaurant_manager", restaurantId })
      .select("name email role restaurantId createdAt").sort({ name: 1 });
    res.json({ success: true, data: { managers } });
  } catch (error) {
    errorResponse(error, res, "Failed to load manager accounts");
  }
};

export const deleteRestaurantManager = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  const id = String(req.params.id);
  if (!restaurantId || req.user?.role !== "restaurant_owner") {
    res.status(403).json({ success: false, message: "Restaurant owner access required" });
    return;
  }
  if (!validId(id)) {
    res.status(400).json({ success: false, message: "Invalid manager account ID" });
    return;
  }
  try {
    const manager = await User.findOneAndDelete({ _id: id, role: "restaurant_manager", restaurantId });
    if (!manager) {
      res.status(404).json({ success: false, message: "Manager account not found" });
      return;
    }
    res.json({ success: true, message: "Manager account removed" });
  } catch (error) {
    errorResponse(error, res, "Failed to remove manager account");
  }
};
