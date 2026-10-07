import { apiRequest, resolveMediaUrl } from "./api";

export interface ManagerProfile {
  user: { id: string; name: string; email: string; role: "restaurant_manager" };
  restaurant: { id: string; name: string; slug: string };
}

export interface ManagerOrder {
  _id: string;
  orderNumber: string;
  status: string;
  declineReason?: string;
  paymentMethod?: "cash" | "esewa" | "khalti" | "bank_qr";
  paymentStatus?: "unpaid" | "pending" | "pending_verification" | "paid" | "rejected";
  tableId: { _id: string; tableNumber: string } | string;
  items: Array<{
    menuItemId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  specialInstructions?: string;
  total: number;
  createdAt: string;
}

export interface ManagerCategory {
  _id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ManagerMenuItem {
  _id: string;
  categoryId: { _id: string; name: string } | string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

export interface ManagerTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: "available" | "occupied";
  isActive: boolean;
}

export interface ManagerDashboard {
  orders: Record<"pending" | "accepted" | "preparing" | "ready" | "served" | "cancelled", number>;
  pendingPayments: number;
  todaySales: number;
  todayOrders: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const managerRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("managerToken");
  if (!token) throw new Error("Manager sign-in is required.");
  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const json = (value: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(value),
});

export const getManagerProfile = async (): Promise<ManagerProfile> =>
  managerRequest<ManagerProfile>("/manager/me");
export const getManagerDashboard = async (): Promise<ManagerDashboard> =>
  managerRequest<ManagerDashboard>("/manager/dashboard");
export const getManagerOrders = async (): Promise<ManagerOrder[]> =>
  (await managerRequest<{ orders: ManagerOrder[] }>("/manager/orders")).orders;
export const getManagerOrder = async (id: string): Promise<ManagerOrder> =>
  (await managerRequest<{ order: ManagerOrder }>(`/manager/orders/${encodeURIComponent(id)}`)).order;
export const updateManagerOrder = async (
  id: string,
  status: string,
  reason?: string,
): Promise<ManagerOrder> =>
  (await managerRequest<{ order: ManagerOrder }>(
    `/manager/orders/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status, reason }) },
  )).order;
export const getManagerMenu = async (): Promise<{
  categories: ManagerCategory[];
  items: ManagerMenuItem[];
}> => {
  const data = await managerRequest<{
    categories: ManagerCategory[];
    items: ManagerMenuItem[];
  }>("/manager/menu");
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      image: resolveMediaUrl(item.image),
    })),
  };
};
export const createManagerCategory = async (
  name: string,
  description: string,
): Promise<ManagerCategory> =>
  (await managerRequest<{ category: ManagerCategory }>(
    "/manager/menu/categories",
    json({ name, description }),
  )).category;
export const updateManagerCategory = async (
  id: string,
  value: Partial<Pick<ManagerCategory, "name" | "description" | "isActive">>,
): Promise<ManagerCategory> =>
  (await managerRequest<{ category: ManagerCategory }>(
    `/manager/menu/categories/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(value) },
  )).category;
export const deleteManagerCategory = async (id: string): Promise<void> => {
  await managerRequest(`/manager/menu/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
};
export const createManagerMenuItem = async (
  item: Pick<ManagerMenuItem, "name" | "description" | "price" | "available"> & { categoryId: string },
): Promise<ManagerMenuItem> =>
  (await managerRequest<{ item: ManagerMenuItem }>(
    "/manager/menu/items",
    json(item),
  )).item;
export const updateManagerMenuItem = async (
  id: string,
  item: Partial<Pick<ManagerMenuItem, "name" | "description" | "price" | "image" | "available">> & { categoryId?: string },
): Promise<ManagerMenuItem> => {
  const result = (await managerRequest<{ item: ManagerMenuItem }>(
    `/manager/menu/items/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(item) },
  )).item;
  return { ...result, image: resolveMediaUrl(result.image) };
};
export const deleteManagerMenuItem = async (id: string): Promise<void> => {
  await managerRequest(`/manager/menu/items/${encodeURIComponent(id)}`, { method: "DELETE" });
};
export const uploadManagerMenuItemImage = async (id: string, image: File): Promise<ManagerMenuItem> => {
  const formData = new FormData();
  formData.append("image", image);
  const result = await managerRequest<{ item: ManagerMenuItem }>(
    `/manager/menu/items/${encodeURIComponent(id)}/image`,
    { method: "POST", body: formData },
  );
  return { ...result.item, image: resolveMediaUrl(result.item.image) };
};
export const getManagerTables = async (): Promise<ManagerTable[]> =>
  (await managerRequest<{ tables: ManagerTable[] }>("/manager/tables")).tables;
export const createManagerTable = async (tableNumber: string, capacity: number): Promise<ManagerTable> =>
  (await managerRequest<{ table: ManagerTable }>("/manager/tables", json({ tableNumber, capacity }))).table;
export const updateManagerTable = async (
  id: string,
  value: Partial<Pick<ManagerTable, "tableNumber" | "capacity" | "isActive">>,
): Promise<ManagerTable> =>
  (await managerRequest<{ table: ManagerTable }>(
    `/manager/tables/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(value) },
  )).table;
export const deleteManagerTable = async (id: string): Promise<void> => {
  await managerRequest(`/manager/tables/${encodeURIComponent(id)}`, { method: "DELETE" });
};
export const getManagerPayments = async (): Promise<ManagerOrder[]> =>
  (await managerRequest<{ payments: ManagerOrder[] }>("/manager/payments")).payments;
export const updateManagerPayment = async (
  id: string,
  action: "confirm" | "reject",
): Promise<ManagerOrder["paymentStatus"]> =>
  (await managerRequest<{ paymentStatus: ManagerOrder["paymentStatus"] }>(
    `/manager/payments/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ action }) },
  )).paymentStatus;
export const getManagerBills = async (): Promise<ManagerOrder[]> =>
  (await managerRequest<{ bills: ManagerOrder[] }>("/manager/bills")).bills;
