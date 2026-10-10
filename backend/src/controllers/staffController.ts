import { Response } from "express";
import mongoose from "mongoose";

import Order, { OrderStatus } from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { syncTableOccupancy } from "../utils/tableOccupancy.js";
import { getTableOverviews } from "../utils/tableOverview.js";

const supportedStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
];

const normalizeStatus = (status: OrderStatus): OrderStatus => {
  switch (status) {
    case "New":
      return "pending";
    case "Preparing":
      return "preparing";
    case "Ready":
      return "ready";
    case "Served":
      return "served";
    default:
      return status;
  }
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "served",
};

const isValidId = (value: string): boolean =>
  mongoose.Types.ObjectId.isValid(value);

const orderResponse = async (order: {
  _id: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  specialInstructions?: string;
  total: number;
  createdAt: Date;
}) => {
  const table = await RestaurantTable.findOne({
    _id: order.tableId,
    restaurantId: order.restaurantId,
  }).select("tableNumber");
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: normalizeStatus(order.status),
    tableNumber: table?.tableNumber ?? "—",
    items: order.items,
    specialInstructions: order.specialInstructions ?? "",
    total: order.total,
    createdAt: order.createdAt,
  };
};

const handleError = (
  error: unknown,
  res: Response,
  message: string,
): void => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

export const getStaffMe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId || !req.user) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId).select(
      "name slug",
    );
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Assigned restaurant not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load staff profile");
  }
};

export const getStaffOrders = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }

  try {
    const orders = await Order.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(200);
    const data = await Promise.all(orders.map(orderResponse));
    res.json({ success: true, data: { orders: data } });
  } catch (error) {
    handleError(error, res, "Failed to load staff orders");
  }
};

export const getStaffTables = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }
  try {
    res.json({
      success: true,
      data: { tables: await getTableOverviews(restaurantId) },
    });
  } catch (error) {
    handleError(error, res, "Failed to load staff tables");
  }
};

export const getStaffOrder = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  const id = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }
  if (!isValidId(id)) {
    res.status(400).json({ success: false, message: "Invalid order ID" });
    return;
  }

  try {
    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({
      success: true,
      data: { order: await orderResponse(order) },
    });
  } catch (error) {
    handleError(error, res, "Failed to load staff order");
  }
};

export const updateStaffOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  const id = String(req.params.id);
  const requestedStatus: unknown = req.body?.status;
  if (!restaurantId) {
    res.status(403).json({
      success: false,
      message: "Staff account is not assigned to a restaurant",
    });
    return;
  }
  if (
    !isValidId(id) ||
    typeof requestedStatus !== "string" ||
    !supportedStatuses.includes(requestedStatus as OrderStatus)
  ) {
    res.status(400).json({
      success: false,
      message: "A valid order and next status are required",
    });
    return;
  }

  try {
    const order = await Order.findOne({ _id: id, restaurantId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const currentStatus = normalizeStatus(order.status);
    if (nextStatus[currentStatus] !== requestedStatus) {
      res.status(409).json({
        success: false,
        message: `Cannot move an order from ${currentStatus} to ${requestedStatus}`,
      });
      return;
    }

    order.status = requestedStatus as OrderStatus;
    await order.save();
    await syncTableOccupancy(order.tableId, order.restaurantId);
    res.json({
      success: true,
      data: { order: await orderResponse(order) },
    });
  } catch (error) {
    handleError(error, res, "Failed to update order status");
  }
};
