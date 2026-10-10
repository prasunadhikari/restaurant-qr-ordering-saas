import mongoose from "mongoose";

import Order from "../models/Order.js";
import RestaurantTable from "../models/RestaurantTable.js";
import TableSession from "../models/TableSession.js";
import { canClearTableSession, refreshTableSessionBill } from "./tableBill.js";

export const getTableOverviews = async (
  restaurantId: mongoose.Types.ObjectId | string,
) => {
  const [tables, sessions] = await Promise.all([
    RestaurantTable.find({ restaurantId }).sort({ tableNumber: 1 }),
    TableSession.find({ restaurantId, status: "active" }),
  ]);
  const sessionByTable = new Map(
    sessions.map((session) => [session.tableId.toString(), session]),
  );
  await Promise.all(
    sessions
      .filter((session) => !session.bill)
      .map(async (session) => {
        session.bill = (await refreshTableSessionBill(session._id)) ?? undefined;
      }),
  );
  const orders = sessions.length
    ? await Order.find({
        restaurantId,
        tableSessionId: { $in: sessions.map((session) => session._id) },
      })
    : [];
  const ordersBySession = new Map<string, typeof orders>();
  for (const order of orders) {
    if (!order.tableSessionId) continue;
    const key = order.tableSessionId.toString();
    const sessionOrders = ordersBySession.get(key) ?? [];
    sessionOrders.push(order);
    ordersBySession.set(key, sessionOrders);
  }

  return tables.map((table) => {
    const session = sessionByTable.get(table._id.toString());
    const sessionOrders = session
      ? ordersBySession.get(session._id.toString()) ?? []
      : [];
    return {
      ...table.toObject(),
      activeSessionId: session?._id.toString() ?? null,
      activeOrderCount: sessionOrders.filter(
        (order) => order.status.toLowerCase() !== "cancelled",
      ).length,
      servedOrderCount: sessionOrders.filter(
        (order) =>
          order.status.toLowerCase() === "served" ||
          order.status.toLowerCase() === "cancelled",
      ).length,
      paymentStatus: session?.bill?.paymentStatus ?? "unpaid",
      billTotal: session?.bill?.total ?? 0,
      paidAmount: session?.bill?.paidAmount ?? 0,
      canClear: Boolean(session) &&
        canClearTableSession(sessionOrders, session?.bill),
    };
  });
};
