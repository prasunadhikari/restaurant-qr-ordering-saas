import { apiRequest, resolveMediaUrl } from "./api";
import type { Restaurant } from "./restaurantService";

export interface MenuCategory {
  _id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  categoryId: { _id: string; name: string } | string;
}

export interface RestaurantTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: "available" | "occupied";
}

export interface RestaurantStaffMember {
  _id: string;
  name: string;
  email: string;
  loginAlias?: string;
  role: "restaurant_staff";
  restaurantId: string;
  createdAt: string;
}

export interface RestaurantManagerMember {
  _id: string;
  name: string;
  email: string;
  loginAlias?: string;
  role: "restaurant_manager";
  restaurantId: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "New"
  | "Preparing"
  | "Ready"
  | "Served";

export interface RestaurantOrder {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentType?: "dine_in" | "takeaway";
  total: number;
  createdAt: string;
  specialInstructions?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  tableId: { _id: string; tableNumber: string } | string;
}

export interface RestaurantAnalytics {
  summary: {
    todayRevenue: number;
    todayOrders: number;
    totalTables: number;
    occupiedTables: number;
    pendingOrders: number;
    weekRevenue: number;
    weekOrders: number;
  };
  dailyRevenue: Array<{ day: string; revenue: number; orders: number }>;
  topDishes: Array<{ name: string; orders: number; revenue: number }>;
  busyHours: Array<{ time: string; orders: number }>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const authorized = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("ownerToken");
  if (!token) {
    throw new Error("Authentication required. Please log in again.");
  }

  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return response.data;
};

const json = (value: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(value),
});

export const getRestaurantSettings = async (): Promise<Restaurant> =>
  (await authorized<{ restaurant: Restaurant }>("/restaurants/me")).restaurant;

export const updateRestaurantSettings = async (
  value: Partial<Restaurant> & {
    restaurantType?: string;
    acceptingOrders?: boolean;
    paymentSettings?: NonNullable<Restaurant["paymentSettings"]>;
  },
): Promise<Restaurant> =>
  (
    await authorized<{ restaurant: Restaurant }>("/restaurants/me", {
      method: "PUT",
      body: JSON.stringify(value),
    })
  ).restaurant;

export const uploadRestaurantPaymentQr = async (
  provider: "esewa" | "khalti" | "bank",
  image: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", image);
  const result = await authorized<{ image: string }>(
    `/restaurants/me/payment-qr/${provider}`,
    { method: "POST", body: formData },
  );
  return result.image;
};

export const deleteRestaurantPaymentQr = async (
  provider: "esewa" | "khalti" | "bank",
): Promise<void> => {
  await authorized<{ image: string }>(
    `/restaurants/me/payment-qr/${provider}`,
    { method: "DELETE" },
  );
};

export const getMenuData = async (): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
}> => {
  const [categories, items] = await Promise.all([
    authorized<{ categories: MenuCategory[] }>("/restaurant/categories"),
    authorized<{ items: MenuItem[] }>("/restaurant/menu"),
  ]);
  return {
    categories: categories.categories,
    items: items.items.map((item) => ({
      ...item,
      image: resolveMediaUrl(item.image),
    })),
  };
};

export const createCategory = async (
  value: Pick<MenuCategory, "name" | "description">,
): Promise<MenuCategory> =>
  (await authorized<{ category: MenuCategory }>("/restaurant/categories", json(value)))
    .category;

export const updateCategory = async (
  id: string,
  value: Partial<Pick<MenuCategory, "name" | "description">>,
): Promise<MenuCategory> =>
  (
    await authorized<{ category: MenuCategory }>(
      `/restaurant/categories/${id}`,
      { method: "PATCH", body: JSON.stringify(value) },
    )
  ).category;

export const deleteCategory = async (id: string): Promise<void> => {
  await authorized(`/restaurant/categories/${id}`, { method: "DELETE" });
};

export const createMenuItem = async (
  value: Omit<MenuItem, "_id" | "categoryId"> & { categoryId: string },
): Promise<MenuItem> => {
  const item = (await authorized<{ item: MenuItem }>("/restaurant/menu", json(value))).item;
  return { ...item, image: resolveMediaUrl(item.image) };
};

export const addCatalogMenuItems = async (
  items: Array<{ name: string; category: string; price: number }>,
): Promise<{ added: number; skipped: number }> =>
  authorized<{ added: number; skipped: number }>("/restaurant/menu/catalog", json({ items }));

export const updateMenuItem = async (
  id: string,
  value: Partial<Omit<MenuItem, "_id" | "categoryId">> & { categoryId?: string },
): Promise<MenuItem> => {
  const item = (
    await authorized<{ item: MenuItem }>(`/restaurant/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(value),
    })
  ).item;
  return { ...item, image: resolveMediaUrl(item.image) };
};

export const uploadMenuItemImage = async (
  id: string,
  image: File,
): Promise<MenuItem> => {
  const formData = new FormData();
  formData.append("image", image);
  const item = (
    await authorized<{ item: MenuItem }>(
      `/restaurant/menu/${id}/image`,
      { method: "POST", body: formData },
    )
  ).item;
  return { ...item, image: resolveMediaUrl(item.image) };
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await authorized(`/restaurant/menu/${id}`, { method: "DELETE" });
};

export const getTables = async (): Promise<RestaurantTable[]> =>
  (await authorized<{ tables: RestaurantTable[] }>("/restaurant/tables")).tables;

export const createTable = async (
  value: Pick<RestaurantTable, "tableNumber" | "capacity">,
): Promise<RestaurantTable> =>
  (await authorized<{ table: RestaurantTable }>("/restaurant/tables", json(value)))
    .table;

export const updateTable = async (
  id: string,
  value: Partial<Pick<RestaurantTable, "tableNumber" | "capacity" | "status">>,
): Promise<RestaurantTable> =>
  (
    await authorized<{ table: RestaurantTable }>(`/restaurant/tables/${id}`, {
      method: "PATCH",
      body: JSON.stringify(value),
    })
  ).table;

export const deleteTable = async (id: string): Promise<void> => {
  await authorized(`/restaurant/tables/${id}`, { method: "DELETE" });
};

export const getRestaurantStaff = async (): Promise<RestaurantStaffMember[]> =>
  (await authorized<{ staff: RestaurantStaffMember[] }>("/restaurant/staff")).staff;

export const createRestaurantStaff = async (
  value: { name: string; email: string; password: string },
): Promise<RestaurantStaffMember> =>
  (
    await authorized<{ staff: RestaurantStaffMember }>("/restaurant/staff", {
      method: "POST",
      body: JSON.stringify(value),
    })
  ).staff;

export const updateRestaurantStaff = async (
  id: string,
  value: { name: string; email: string; password?: string },
): Promise<RestaurantStaffMember> =>
  (
    await authorized<{ staff: RestaurantStaffMember }>(
      `/restaurant/staff/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(value) },
    )
  ).staff;

export const deleteRestaurantStaff = async (id: string): Promise<void> => {
  await authorized(`/restaurant/staff/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const getRestaurantManagers = async (): Promise<RestaurantManagerMember[]> =>
  (await authorized<{ managers: RestaurantManagerMember[] }>("/restaurant/managers")).managers;

export const createRestaurantManager = async (value: {
  name: string;
  email: string;
  password: string;
}): Promise<RestaurantManagerMember> =>
  (await authorized<{ manager: RestaurantManagerMember }>("/restaurant/managers", json(value))).manager;

export const deleteRestaurantManager = async (id: string): Promise<void> => {
  await authorized(`/restaurant/managers/${encodeURIComponent(id)}`, { method: "DELETE" });
};

export const getOrders = async (): Promise<RestaurantOrder[]> =>
  (await authorized<{ orders: RestaurantOrder[] }>("/restaurant/orders")).orders;

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<RestaurantOrder> =>
  (
    await authorized<{ order: RestaurantOrder }>(
      `/restaurant/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    )
  ).order;

export const getRestaurantAnalytics = async (): Promise<RestaurantAnalytics> =>
  (await authorized<RestaurantAnalytics>("/restaurant/analytics"));
