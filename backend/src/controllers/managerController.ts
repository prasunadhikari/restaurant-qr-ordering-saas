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
import {
  allSessionOrdersServed,
  refreshTableSessionBill,
  updateCurrentPaymentActivity,
} from "../utils/tableBill.js";
import { getTableOverviews } from "../utils/tableOverview.js";
import { uploadPath } from "../utils/uploadStorage.js";
import { generateLoginAlias } from "../utils/loginAlias.js";
import { getRestaurantDayRange } from "../utils/restaurantStatus.js";

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
    if (order.tableSessionId) {
      await refreshTableSessionBill(order.tableSessionId);
    }
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
      const directory = uploadPath("menu");
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
    const tables = await getTableOverviews(restaurantId);
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
    const bill = await refreshTableSessionBill(session._id);
    const orders = await Order.find({
      restaurantId,
      tableId: table._id,
      tableSessionId: session._id,
    }).select("status paymentStatus");
    if (!allSessionOrdersServed(orders)) {
      res.status(409).json({
        success: false,
        message: "Every non-cancelled order in this session must be served before clearing the table",
      });
      return;
    }
    const cancelledWithPayment = orders.some((order) =>
      normalizedOrderStatus(order.status) === "cancelled" &&
      ["pending", "pending_verification", "paid"].includes(order.paymentStatus),
    );
    if (cancelledWithPayment) {
      res.status(409).json({
        success: false,
        message: "Resolve or refund payments for cancelled orders before clearing the table",
      });
      return;
    }
    if (bill && (bill.paymentStatus !== "paid" || bill.paidAmount < bill.total)) {
      res.status(409).json({
        success: false,
        message: bill.paymentStatus === "pending_verification"
          ? "The table bill is awaiting payment verification"
          : bill.paymentStatus === "pending"
            ? "Confirm the cash payment before clearing the table"
            : bill.paymentStatus === "rejected"
              ? "The table bill payment was rejected and must be resolved before clearing the table"
              : "The complete table bill must be paid before clearing the table",
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
    await RestaurantTable.updateOne(
      { _id: table._id, restaurantId },
      { $set: { status: "available" } },
    );
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
  const requestedDate = typeof req.query.date === "string" ? req.query.date : undefined;
  if ((req.query.date !== undefined && !requestedDate) || !getRestaurantDayRange(requestedDate)) {
    res.status(400).json({ success: false, message: "Choose a valid payment date" });
    return;
  }
  const dayRange = getRestaurantDayRange(requestedDate);
  if (!dayRange) {
    res.status(400).json({ success: false, message: "Choose a valid payment date" });
    return;
  }
  try {
    const restaurant = await Restaurant.findById(restaurantId).select("paymentSettings");
    const sessions = await TableSession.find({
      restaurantId,
      $or: [
        { "bill.paymentHistory.createdAt": { $gte: dayRange.start, $lt: dayRange.end } },
        { "bill.paymentHistory.updatedAt": { $gte: dayRange.start, $lt: dayRange.end } },
        {
          status: "active",
          "bill.paymentStatus": { $in: ["pending", "pending_verification"] },
        },
      ],
    }).sort({ updatedAt: -1 });
    const payments = (await Promise.all(sessions.map(async (session) => {
      const table = await RestaurantTable.findOne({
        _id: session.tableId,
        restaurantId,
      }).select("tableNumber");
      const bill = session.bill;
      if (!bill) return [];
      const activities = bill.paymentHistory ?? [];
      const entries = activities.length > 0
        ? activities
        : bill.paymentMethod && bill.paymentStatus !== "unpaid"
          ? [{
              paymentMethod: bill.paymentMethod,
              paymentAmount: bill.paymentAmount || bill.paidAmount,
              paymentStatus: bill.paymentStatus,
              createdAt: session.startedAt,
              updatedAt: session.updatedAt,
            }]
          : [];
      return entries.flatMap((activity, index) => {
        const createdAt = new Date(activity.createdAt);
        const updatedAt = new Date(activity.updatedAt);
        const isInSelectedDay =
          (createdAt >= dayRange.start && createdAt < dayRange.end) ||
          (updatedAt >= dayRange.start && updatedAt < dayRange.end);
        const isCurrentReview = session.status === "active" &&
          bill.paymentMethod === activity.paymentMethod &&
          bill.paymentStatus === activity.paymentStatus &&
          ["pending", "pending_verification"].includes(activity.paymentStatus);
        if (!isInSelectedDay && !isCurrentReview) return [];
        const isCurrent = session.status === "active" &&
          bill.paymentMethod === activity.paymentMethod &&
          bill.paymentStatus === activity.paymentStatus;
        return [{
          _id: activity._id?.toString() ?? `${session._id}-${index}`,
          tableSessionId: session._id,
          orderNumber: `Table ${table?.tableNumber ?? session.tableNumber}`,
          tableId: { _id: session.tableId, tableNumber: table?.tableNumber ?? session.tableNumber },
          total: bill.total,
          paidAmount: bill.paidAmount,
          paymentAmount: activity.paymentAmount,
          paymentMethod: activity.paymentMethod,
          paymentStatus: activity.paymentStatus,
          paymentDetails: activity.paymentDetails,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
          canConfirm: isCurrent && ["pending", "pending_verification"].includes(activity.paymentStatus),
          canReject: isCurrent && activity.paymentStatus === "pending_verification" && activity.paymentMethod !== "cash",
        }];
      });
    }))).flat().sort((left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
    res.json({
      success: true,
      data: {
        date: dayRange.date,
        bankDetails: {
          bankName: restaurant?.paymentSettings?.bankName ?? "",
          accountName: restaurant?.paymentSettings?.bankAccountName ?? "",
          accountNumber: restaurant?.paymentSettings?.bankAccountNumber ?? "",
        },
        payments,
      },
    });
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
    const session = await TableSession.findOne({
      _id: id,
      restaurantId,
      status: "active",
    });
    if (!session) {
      res.status(404).json({ success: false, message: "Active table bill not found" });
      return;
    }
    const bill = await refreshTableSessionBill(session._id);
    if (!bill) {
      res.status(404).json({ success: false, message: "Table bill not found" });
      return;
    }
    const orders = await Order.find({
      restaurantId,
      tableId: session.tableId,
      tableSessionId: session._id,
    });
    if (!allSessionOrdersServed(orders)) {
      res.status(409).json({ success: false, message: "Every order in the table session must be served before payment can be verified" });
      return;
    }
    const status = bill.paymentStatus;
    if (
      !bill.paymentMethod ||
      !["pending", "pending_verification"].includes(status) ||
      (action === "confirm" && bill.paymentMethod !== "cash" && status !== "pending_verification") ||
      (action === "reject" && (bill.paymentMethod === "cash" || status !== "pending_verification"))
    ) {
      res.status(409).json({ success: false, message: "This payment is not awaiting this action" });
      return;
    }
    if (action === "confirm") {
      bill.paidAmount += bill.paymentAmount;
      bill.paymentStatus = bill.paidAmount >= bill.total ? "paid" : "unpaid";
      updateCurrentPaymentActivity(bill, "paid", new Date(), bill.paymentAmount);
      bill.paymentAmount = 0;
    } else {
      bill.paymentStatus = "rejected";
      updateCurrentPaymentActivity(bill, "rejected", new Date(), bill.paymentAmount);
      bill.paymentAmount = 0;
    }
    session.bill = bill;
    await session.save();
    await Order.updateMany(
      {
        restaurantId,
        tableId: session.tableId,
        tableSessionId: session._id,
        status: { $ne: "cancelled" },
      },
      {
        $set: {
          paymentStatus: bill.paymentStatus as OrderPaymentStatus,
          paymentMethod: bill.paymentMethod,
        },
      },
    );
    res.json({ success: true, data: { paymentStatus: bill.paymentStatus, bill: session.toObject().bill } });
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
    const activeSessions = await TableSession.find({ restaurantId, status: "active" });
    await Promise.all(
      activeSessions
        .filter((session) => !session.bill)
        .map((session) => refreshTableSessionBill(session._id)),
    );
    const sessions = await TableSession.find({ restaurantId, bill: { $exists: true } })
      .sort({ startedAt: -1 }).limit(500);
    const bills = await Promise.all(sessions.map(async (session) => {
      const table = await RestaurantTable.findOne({
        _id: session.tableId,
        restaurantId,
      }).select("tableNumber");
      return {
        _id: session._id,
        tableSessionId: session._id,
        orderNumber: `Table ${table?.tableNumber ?? session.tableNumber}`,
        status: session.status,
        tableId: { _id: session.tableId, tableNumber: table?.tableNumber ?? session.tableNumber },
        items: session.bill?.items ?? [],
        total: session.bill?.total ?? 0,
        paidAmount: session.bill?.paidAmount ?? 0,
        paymentAmount: session.bill?.paymentAmount ?? 0,
        paymentMethod: session.bill?.paymentMethod,
        paymentStatus: session.bill?.paymentStatus,
        createdAt: session.startedAt,
      };
    }));
    res.json({ success: true, data: { bills } });
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
      loginAlias: await generateLoginAlias("restaurant_manager", name),
      password: await bcrypt.hash(password, 10),
      role: "restaurant_manager",
      restaurantId,
    });
    const safeManager = await User.findById(manager._id).select("name email loginAlias role restaurantId createdAt");
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
      .select("name email loginAlias role restaurantId createdAt").sort({ name: 1 });
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
