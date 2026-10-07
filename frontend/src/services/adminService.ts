import { apiRequest } from "./api";

export interface AdminRestaurantSummary {
  _id: string;
  name: string;
  slug: string;
  address: string;
  status: "active" | "pending" | "suspended";
  plan: "starter" | "professional" | "custom";
  createdAt: string;
}

export interface AdminOverview {
  summary: {
    restaurants: number;
    activeRestaurants: number;
    pendingRestaurants: number;
    suspendedRestaurants: number;
    orders: number;
    pendingOrders: number;
    tables: number;
    owners: number;
    staff: number;
  };
  recentRestaurants: AdminRestaurantSummary[];
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  specialInstructions?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  restaurantId: { _id: string; name: string; slug: string } | string | null;
  tableId: { _id: string; tableNumber: string } | string | null;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "restaurant_owner" | "restaurant_staff";
  restaurantId:
    | { _id: string; name: string; slug: string }
    | string
    | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const adminRequest = async <T>(endpoint: string): Promise<T> => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required. Please sign in again.");
  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminOverview = async (): Promise<AdminOverview> =>
  adminRequest<AdminOverview>("/admin/overview");

export const getAdminOrders = async (): Promise<AdminOrder[]> =>
  (await adminRequest<{ orders: AdminOrder[] }>("/admin/orders")).orders;

export const getAdminUsers = async (): Promise<AdminUser[]> =>
  (await adminRequest<{ users: AdminUser[] }>("/admin/users")).users;

export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("Admin authentication required. Please sign in again.");
  await apiRequest<ApiResponse<never>>("/users/admin/password", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};
