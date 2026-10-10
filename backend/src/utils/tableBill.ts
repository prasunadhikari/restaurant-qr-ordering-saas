import mongoose from "mongoose";

import Order from "../models/Order.js";
import TableSession, {
  type ITableBill,
  type ITableBillPaymentDetails,
} from "../models/TableSession.js";

const isCancelled = (status: string) => status.toLowerCase() === "cancelled";

type BillOrder = {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
};

export const buildTableSessionBill = (
  orders: BillOrder[],
  previousBill?: ITableBill,
): ITableBill | null => {
  const billOrders = orders.filter((order) => !isCancelled(order.status));
  if (billOrders.length === 0) return null;

  const orderIds = billOrders.map((order) => order._id);
  const changedOrders =
    !previousBill ||
    orderIds.length !== previousBill.orderIds.length ||
    orderIds.some((id) => !previousBill.orderIds.some(
      (existingId) => existingId.toString() === id.toString(),
    ));
  const itemsByKey = new Map<string, ITableBill["items"][number]>();

  for (const order of billOrders) {
    for (const item of order.items) {
      const specialInstructions = item.specialInstructions ?? "";
      const key = JSON.stringify([item.name, item.unitPrice, specialInstructions]);
      const existing = itemsByKey.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.orderNumbers.push(order.orderNumber);
      } else {
        itemsByKey.set(key, {
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          specialInstructions,
          orderNumbers: [order.orderNumber],
        });
      }
    }
  }

  const items = [...itemsByKey.values()];
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const paidAmount = previousBill?.paidAmount ?? 0;
  const paymentStatus =
    paidAmount >= total
      ? "paid"
      : changedOrders
        ? "unpaid"
        : previousBill?.paymentStatus ?? "unpaid";

  return {
    orderIds,
    items,
    total,
    paidAmount,
    paymentAmount: changedOrders ? 0 : previousBill?.paymentAmount ?? 0,
    paymentMethod: changedOrders ? undefined : previousBill?.paymentMethod,
    paymentStatus,
    paymentHistory: previousBill?.paymentHistory ?? [],
  };
};

export const updateCurrentPaymentActivity = (
  bill: ITableBill,
  status: ITableBill["paymentStatus"],
  at: Date,
  paymentAmount = bill.paymentAmount,
  paymentDetails?: ITableBillPaymentDetails,
): void => {
  const history = bill.paymentHistory ?? (bill.paymentHistory = []);
  const activity = [...history].reverse().find((entry) =>
    entry.paymentMethod === bill.paymentMethod &&
    ["pending", "pending_verification"].includes(entry.paymentStatus),
  );
  if (activity) {
    activity.paymentStatus = status;
    activity.paymentAmount = paymentAmount;
    activity.updatedAt = at;
    if (paymentDetails) activity.paymentDetails = paymentDetails;
    return;
  }
  if (!bill.paymentMethod) return;
  history.push({
    paymentMethod: bill.paymentMethod,
    paymentAmount,
    paymentStatus: status,
    paymentDetails,
    createdAt: at,
    updatedAt: at,
  });
};

export const addBillPaymentActivity = (
  bill: ITableBill,
  at: Date,
  paymentDetails?: ITableBillPaymentDetails,
): void => {
  if (!bill.paymentMethod) return;
  const history = bill.paymentHistory ?? (bill.paymentHistory = []);
  const existing = [...history].reverse().find((activity) =>
    activity.paymentMethod === bill.paymentMethod &&
    activity.paymentStatus === "pending",
  );
  if (existing) {
    existing.paymentAmount = bill.paymentAmount;
    existing.updatedAt = at;
    if (paymentDetails) existing.paymentDetails = paymentDetails;
    return;
  }
  history.push({
    paymentMethod: bill.paymentMethod,
    paymentAmount: bill.paymentAmount,
    paymentStatus: bill.paymentStatus,
    paymentDetails,
    createdAt: at,
    updatedAt: at,
  });
};

export const refreshTableSessionBill = async (
  sessionId: mongoose.Types.ObjectId | string,
): Promise<ITableBill | null> => {
  const session = await TableSession.findOne({ _id: sessionId, status: "active" });
  if (!session) return null;

  const orders = await Order.find({
    restaurantId: session.restaurantId,
    tableId: session.tableId,
    tableSessionId: session._id,
  }).sort({ createdAt: 1 });
  const bill = buildTableSessionBill(orders, session.bill);
  if (!bill) {
    session.bill = undefined;
    await session.save();
    return null;
  }
  session.bill = bill;
  await session.save();
  return session.toObject().bill ?? null;
};

export const allSessionOrdersServed = (
  orders: Array<{ status: string }>,
): boolean =>
  orders.every((order) => {
    const status = order.status.toLowerCase();
    return status === "served" || status === "cancelled";
  });

export const canClearTableSession = (
  orders: Array<{ status: string; paymentStatus?: string }>,
  bill?: Pick<ITableBill, "paymentStatus" | "paidAmount" | "total">,
): boolean => {
  if (!allSessionOrdersServed(orders)) return false;
  const unresolvedCancelledPayment = orders.some((order) =>
    isCancelled(order.status) &&
    ["pending", "pending_verification", "paid"].includes(order.paymentStatus ?? "unpaid"),
  );
  return !unresolvedCancelledPayment &&
    (!bill || (bill.paymentStatus === "paid" && bill.paidAmount >= bill.total));
};
