import { Response } from "express";
import mongoose from "mongoose";

import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";
import StaffCallRequest, { StaffCallType } from "../models/StaffCallRequest.js";
import TableSession from "../models/TableSession.js";

const reportError = (error: unknown, res: Response, message: string): void => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

export const createPublicStaffCall = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { restaurantSlug, tableNumber } = req.params;
  const body = req.body && typeof req.body === "object"
    ? req.body as { sessionToken?: unknown; type?: unknown }
    : {};
  const { sessionToken, type } = body;
  if (typeof sessionToken !== "string" || !sessionToken.trim()) {
    res.status(400).json({ success: false, message: "An active table session is required" });
    return;
  }
  if (type !== "assistance" && type !== "bill") {
    res.status(400).json({ success: false, message: "Invalid staff request type" });
    return;
  }
  try {
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug, status: "active" }).select("_id");
    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }
    const table = await RestaurantTable.findOne({
      restaurantId: restaurant._id,
      tableNumber,
      isActive: true,
    }).select("_id");
    if (!table) {
      res.status(404).json({ success: false, message: "Table not found" });
      return;
    }
    const session = await TableSession.findOne({
      restaurantId: restaurant._id,
      tableId: table._id,
      sessionToken,
      status: "active",
    }).select("_id");
    if (!session) {
      res.status(409).json({ success: false, message: "The table session is no longer active" });
      return;
    }

    const existing = await StaffCallRequest.findOne({
      restaurantId: restaurant._id,
      tableSessionId: session._id,
      type: type as StaffCallType,
      status: "pending",
    });
    const request = existing ?? await StaffCallRequest.create({
      restaurantId: restaurant._id,
      tableId: table._id,
      tableSessionId: session._id,
      type,
      status: "pending",
    });
    res.status(existing ? 200 : 201).json({ success: true, data: { request } });
  } catch (error) {
    reportError(error, res, "Failed to create staff request");
  }
};

export const getStaffCallRequests = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Staff account is not assigned to a restaurant" });
    return;
  }
  try {
    const activeSessions = await TableSession.find({ restaurantId, status: "active" }).select("_id");
    const requests = activeSessions.length
      ? await StaffCallRequest.find({
          restaurantId,
          status: "pending",
          tableSessionId: { $in: activeSessions.map((session) => session._id) },
        })
          .populate("tableId", "tableNumber")
          .sort({ createdAt: 1 })
          .limit(100)
          .lean()
      : [];
    res.json({ success: true, data: { requests } });
  } catch (error) {
    reportError(error, res, "Failed to load staff requests");
  }
};

export const attendStaffCallRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const restaurantId = req.user?.restaurantId;
  const requestId = String(req.params.id);
  if (!restaurantId) {
    res.status(403).json({ success: false, message: "Staff account is not assigned to a restaurant" });
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    res.status(400).json({ success: false, message: "Invalid staff request ID" });
    return;
  }
  try {
    const request = await StaffCallRequest.findOneAndUpdate(
      { _id: requestId, restaurantId, status: "pending" },
      { $set: { status: "attended", attendedBy: req.user?.id, attendedAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!request) {
      res.status(404).json({ success: false, message: "Pending staff request not found" });
      return;
    }
    res.json({ success: true, data: { request } });
  } catch (error) {
    reportError(error, res, "Failed to resolve staff request");
  }
};
