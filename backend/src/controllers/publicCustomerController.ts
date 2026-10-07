import { randomBytes, randomUUID } from "node:crypto";
import { Response, Request } from "express";
import mongoose from "mongoose";

import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";
import Order, { type OrderPaymentMethod } from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";
import TableSession from "../models/TableSession.js";
import { syncTableOccupancy } from "../utils/tableOccupancy.js";
import { isGeneratedDishImage } from "../utils/menuImages.js";

const publicPaymentSettings = (restaurant: {
  paymentSettings?: {
    cashEnabled?: boolean;
    esewaEnabled?: boolean;
    esewaQrImage?: string;
    khaltiEnabled?: boolean;
    khaltiQrImage?: string;
    bankEnabled?: boolean;
    bankQrImage?: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
  };
}) => {
  const settings = restaurant.paymentSettings;
  return {
    cashEnabled: settings?.cashEnabled ?? true,
    esewa:
      settings?.esewaEnabled && settings.esewaQrImage
        ? { qrImage: settings.esewaQrImage }
        : null,
    khalti:
      settings?.khaltiEnabled && settings.khaltiQrImage
        ? { qrImage: settings.khaltiQrImage }
        : null,
    bank:
      settings?.bankEnabled && settings.bankQrImage
        ? {
            qrImage: settings.bankQrImage,
            bankName: settings.bankName ?? "",
            accountName: settings.bankAccountName ?? "",
            accountNumber: settings.bankAccountNumber ?? "",
          }
        : null,
  };
};

const handleError = (error: unknown, res: Response, message: string): void => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

const isRestaurantOpen = (
  restaurant: {
    acceptingOrders: boolean;
    openingHours?: { open: string; close: string };
    status: string;
  },
  now = new Date(),
): boolean => {
  if (restaurant.status !== "active" || !restaurant.acceptingOrders) return false;
  const open = restaurant.openingHours?.open;
  const close = restaurant.openingHours?.close;
  if (!open || !close) return true;

  const toMinutes = (value: string): number | null => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const openAt = toMinutes(open);
  const closeAt = toMinutes(close);
  if (openAt === null || closeAt === null) return true;
  const current = now.getHours() * 60 + now.getMinutes();

  return openAt <= closeAt
    ? current >= openAt && current < closeAt
    : current >= openAt || current < closeAt;
};

const getPublicContext = async (
  restaurantSlug: string,
  tableNumber: string,
) => {
  const restaurant = await Restaurant.findOne({
    slug: restaurantSlug.toLowerCase(),
    status: "active",
  });
  if (!restaurant) return { restaurant: null, table: null };

  const table = await RestaurantTable.findOne({
    restaurantId: restaurant._id,
    tableNumber: tableNumber.trim(),
    isActive: { $ne: false },
  });
  return { restaurant, table };
};

const getOrCreateActiveTableSession = async (
  restaurantId: mongoose.Types.ObjectId,
  tableId: mongoose.Types.ObjectId,
  tableNumber: string,
) => {
  const existing = await TableSession.findOne({
    restaurantId,
    tableId,
    status: "active",
  });
  if (existing) return existing;

  try {
    return await TableSession.create({
      restaurantId,
      tableId,
      tableNumber,
      sessionToken: randomUUID(),
      status: "active",
      startedAt: new Date(),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const concurrentSession = await TableSession.findOne({
        restaurantId,
        tableId,
        status: "active",
      });
      if (concurrentSession) return concurrentSession;
    }
    throw error;
  }
};

export const getOrCreatePublicTableSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { restaurant, table } = await getPublicContext(
      String(req.params.restaurantSlug),
      String(req.params.tableNumber),
    );
    if (!restaurant || !table) {
      res.status(404).json({ success: false, message: "Restaurant or table not found" });
      return;
    }

    const session = req.method === "POST"
      ? await getOrCreateActiveTableSession(
          restaurant._id,
          table._id,
          table.tableNumber,
        )
      : await TableSession.findOne({
          restaurantId: restaurant._id,
          tableId: table._id,
          status: "active",
        });
    if (!session) {
      res.json({ success: true, data: { session: null, orders: [] } });
      return;
    }
    const orders = await Order.find({
      restaurantId: restaurant._id,
      tableId: table._id,
      tableSessionId: session._id,
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        session: {
          sessionToken: session.sessionToken,
          status: session.status,
          tableNumber: session.tableNumber,
          startedAt: session.startedAt,
        },
        orders: orders.map((order) => ({
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
          tableSessionId: order.tableSessionId?.toString(),
          status: order.status,
          declineReason: order.declineReason,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus ?? "unpaid",
          total: order.total,
          createdAt: order.createdAt,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          tableNumber: table.tableNumber,
          items: order.items,
        })),
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load table session");
  }
};

export const getPublicRestaurantMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { restaurantSlug, tableNumber } = req.params;
    const { restaurant, table } = await getPublicContext(
      String(restaurantSlug),
      String(tableNumber),
    );
    if (!restaurant || !table) {
      res.status(404).json({
        success: false,
        message: "Restaurant or table not found",
      });
      return;
    }

    const [categories, items] = await Promise.all([
      MenuCategory.find({ restaurantId: restaurant._id, isActive: { $ne: false } }).sort({
        sortOrder: 1,
        name: 1,
      }),
      MenuItem.find({
        restaurantId: restaurant._id,
        categoryId: { $in: (await MenuCategory.find({ restaurantId: restaurant._id, isActive: { $ne: false } }).select("_id")).map((category) => category._id) },
      })
        .populate("categoryId", "name")
        .sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          logo: restaurant.logo,
          coverImage: restaurant.coverImage,
          address: restaurant.address,
          restaurantType: restaurant.restaurantType,
          openingHours: restaurant.openingHours,
          isOpen: isRestaurantOpen(restaurant),
          paymentSettings: publicPaymentSettings(restaurant),
        },
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
        },
        categories,
        items: items.map((item) => {
          const categoryName =
            typeof item.categoryId === "object" &&
            "name" in item.categoryId
              ? String(item.categoryId.name)
              : "";
          return {
            ...item.toObject(),
            image: isGeneratedDishImage(item.image) ? "" : item.image,
          };
        }),
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load restaurant menu");
  }
};

interface RequestedOrderItem {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export const createCustomerOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { restaurantSlug, tableNumber } = req.params;
  const body = req.body ?? {};
  const requestedItems: unknown = body.items;
  const orderNote =
    typeof body.specialInstructions === "string"
      ? body.specialInstructions.trim()
      : "";

  if (
    !Array.isArray(requestedItems) ||
    requestedItems.length === 0 ||
    requestedItems.length > 50 ||
    orderNote.length > 500
  ) {
    res.status(400).json({
      success: false,
      message: "A valid order with at least one item is required",
    });
    return;
  }

  const items: RequestedOrderItem[] = [];
  for (const value of requestedItems) {
    if (
      typeof value !== "object" ||
      value === null ||
      !("menuItemId" in value) ||
      typeof value.menuItemId !== "string" ||
      !mongoose.Types.ObjectId.isValid(value.menuItemId) ||
      !("quantity" in value) ||
      typeof value.quantity !== "number" ||
      !Number.isInteger(value.quantity) ||
      value.quantity < 1 ||
      value.quantity > 99 ||
      ("specialInstructions" in value &&
        value.specialInstructions !== undefined &&
        (typeof value.specialInstructions !== "string" ||
          value.specialInstructions.length > 500))
    ) {
      res.status(400).json({
        success: false,
        message: "Each order item must include a valid menu item and quantity",
      });
      return;
    }
    items.push({
      menuItemId: value.menuItemId,
      quantity: value.quantity,
      specialInstructions:
        typeof value.specialInstructions === "string"
          ? value.specialInstructions.trim()
          : "",
    });
  }

  try {
    const { restaurant, table } = await getPublicContext(
      String(restaurantSlug),
      String(tableNumber),
    );
    if (!restaurant || !table) {
      res.status(404).json({
        success: false,
        message: "Restaurant or table not found",
      });
      return;
    }
    if (!isRestaurantOpen(restaurant)) {
      res.status(409).json({
        success: false,
        message: "This restaurant is not accepting orders right now",
      });
      return;
    }

    const uniqueIds = [...new Set(items.map((item) => item.menuItemId))];
    const menuItems = await MenuItem.find({
      _id: { $in: uniqueIds },
      restaurantId: restaurant._id,
      available: true,
    });
    if (menuItems.length !== uniqueIds.length) {
      res.status(409).json({
        success: false,
        message: "One or more items are no longer available",
      });
      return;
    }

    const itemById = new Map(menuItems.map((item) => [item._id.toString(), item]));
    const orderItems = items.map((item) => {
      const menuItem = itemById.get(item.menuItemId);
      if (!menuItem) throw new Error("Validated menu item was not found");
      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        specialInstructions: item.specialInstructions ?? "",
      };
    });
    const total = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const order = await Order.create({
      restaurantId: restaurant._id,
      tableId: table._id,
      tableSessionId: (await getOrCreateActiveTableSession(
        restaurant._id,
        table._id,
        table.tableNumber,
      ))._id,
      orderNumber: randomBytes(4).toString("hex").toUpperCase(),
      trackingToken: randomUUID(),
      status: "pending",
      paymentStatus: "unpaid",
      items: orderItems,
      specialInstructions: orderNote,
      total,
    });
    await syncTableOccupancy(table._id, restaurant._id);

    res.status(201).json({
      success: true,
      data: {
        order: {
          tableSessionId: order.tableSessionId?.toString(),
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
          status: order.status,
          declineReason: order.declineReason,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          total: order.total,
          createdAt: order.createdAt,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          tableNumber: table.tableNumber,
          items: order.items,
        },
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to place customer order");
  }
};

export const getCustomerOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findOne({
      trackingToken: req.params.trackingToken,
    }).populate<{ restaurantId: { name: string; slug: string } | null }>(
      "restaurantId",
      "name slug",
    );
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    const table = await RestaurantTable.findById(order.tableId).select(
      "tableNumber",
    );
    res.json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
          tableSessionId: order.tableSessionId?.toString(),
          status: order.status,
          declineReason: order.declineReason,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus ?? "unpaid",
          total: order.total,
          createdAt: order.createdAt,
          restaurantName: order.restaurantId?.name ?? "",
          restaurantSlug: order.restaurantId?.slug ?? "",
          tableNumber: table?.tableNumber ?? "",
          items: order.items,
        },
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load order status");
  }
};

export const updateCustomerOrderPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { trackingToken } = req.params;
  const method: unknown = req.body?.method;
  const action: unknown = req.body?.action;
  const isPaymentMethod = (value: unknown): value is OrderPaymentMethod =>
    value === "cash" ||
    value === "esewa" ||
    value === "khalti" ||
    value === "bank_qr";
  const isPaymentAction = (value: unknown): value is "select" | "submit" =>
    value === "select" || value === "submit";

  if (!isPaymentMethod(method) || !isPaymentAction(action)) {
    res.status(400).json({
      success: false,
      message: "Choose a valid payment method and action",
    });
    return;
  }

  try {
    const order = await Order.findOne({ trackingToken });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (order.status.toLowerCase() === "cancelled") {
      res.status(409).json({ success: false, message: "Payment is unavailable for a cancelled order" });
      return;
    }

    const restaurant = await Restaurant.findById(order.restaurantId).select(
      "paymentSettings",
    );
    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }

    const selectedMethod = method;
    const settings = restaurant.paymentSettings;
    const isEnabled =
      selectedMethod === "cash"
        ? settings?.cashEnabled ?? true
        : selectedMethod === "esewa"
          ? Boolean(settings?.esewaEnabled && settings.esewaQrImage)
          : selectedMethod === "khalti"
            ? Boolean(settings?.khaltiEnabled && settings.khaltiQrImage)
            : Boolean(settings?.bankEnabled && settings.bankQrImage);

    if (!isEnabled) {
      res.status(409).json({
        success: false,
        message: "This payment method is not available at this restaurant",
      });
      return;
    }

    if (
      order.paymentStatus === "paid" ||
      order.paymentStatus === "pending_verification"
    ) {
      res.status(409).json({
        success: false,
        message: "This order already has a payment awaiting confirmation",
      });
      return;
    }

    if (
      action === "submit" &&
      (selectedMethod === "cash" ||
        order.paymentMethod !== selectedMethod ||
        order.paymentStatus !== "pending")
    ) {
      res.status(409).json({
        success: false,
        message: "Select this online payment method before submitting payment",
      });
      return;
    }

    order.paymentMethod = selectedMethod;
    order.paymentStatus = action === "submit" ? "pending_verification" : "pending";
    await order.save();

    res.json({
      success: true,
      data: {
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to update customer payment");
  }
};
