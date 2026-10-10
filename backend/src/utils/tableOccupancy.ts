import mongoose from "mongoose";

import Order from "../models/Order.js";
import RestaurantTable from "../models/RestaurantTable.js";
import TableSession from "../models/TableSession.js";

export const syncTableOccupancy = async (
  tableId: mongoose.Types.ObjectId | string,
  restaurantId: mongoose.Types.ObjectId | string,
): Promise<void> => {
  const activeSession = await TableSession.exists({
    tableId,
    restaurantId,
    status: "active",
  });
  const hasUnservedOrder = await Order.exists({
    tableId,
    restaurantId,
    status: { $nin: ["served", "Served", "cancelled"] },
  });

  await RestaurantTable.updateOne(
    { _id: tableId, restaurantId },
    { $set: { status: activeSession || hasUnservedOrder ? "occupied" : "available" } },
  );
};
