import { randomBytes, randomUUID } from "node:crypto";
import { Response, Request } from "express";
import mongoose from "mongoose";

import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import RestaurantTable from "../models/RestaurantTable.js";

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
  });
  return { restaurant, table };
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
      MenuCategory.find({ restaurantId: restaurant._id }).sort({
        sortOrder: 1,
        name: 1,
      }),
      MenuItem.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 }),
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
        },
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
        },
        categories,
        items,
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
      orderNumber: randomBytes(4).toString("hex").toUpperCase(),
      trackingToken: randomUUID(),
      status: "pending",
      items: orderItems,
      specialInstructions: orderNote,
      total,
    });

    res.status(201).json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          restaurantName: restaurant.name,
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
    }).populate<{ restaurantId: { name: string } | null }>(
      "restaurantId",
      "name",
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
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          restaurantName: order.restaurantId?.name ?? "",
          tableNumber: table?.tableNumber ?? "",
          items: order.items,
        },
      },
    });
  } catch (error) {
    handleError(error, res, "Failed to load order status");
  }
};
