import mongoose from "mongoose";

import Order from "../models/Order.js";
import RestaurantTable from "../models/RestaurantTable.js";

export const syncTableOccupancy = async (
  tableId: mongoose.Types.ObjectId | string,
  restaurantId: mongoose.Types.ObjectId | string,
): Promise<void> => {
  const hasUnservedOrder = await Order.exists({
    tableId,
    restaurantId,
    status: { $nin: ["served", "Served"] },
  });

  await RestaurantTable.updateOne(
    { _id: tableId, restaurantId },
    { $set: { status: hasUnservedOrder ? "occupied" : "available" } },
  );
};
