import { apiRequest } from "./api";

export interface StaffProfile {
  user: {
    id: string;
    name: string;
    email: string;
    role: "restaurant_staff";
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
}

export type StaffOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served";

export interface StaffOrder {
  _id: string;
  orderNumber: string;
  status: StaffOrderStatus;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  specialInstructions: string;
  total: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const staffRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("staffToken");
  if (!token) throw new Error("Staff sign-in is required.");
  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getStaffProfile = async (): Promise<StaffProfile> =>
  staffRequest<StaffProfile>("/staff/me");

export const getStaffOrders = async (): Promise<StaffOrder[]> =>
  (await staffRequest<{ orders: StaffOrder[] }>("/staff/orders")).orders;

export const getStaffOrder = async (id: string): Promise<StaffOrder> =>
  (await staffRequest<{ order: StaffOrder }>(`/staff/orders/${encodeURIComponent(id)}`))
    .order;

export const advanceStaffOrder = async (
  id: string,
  status: StaffOrderStatus,
): Promise<StaffOrder> =>
  (
    await staffRequest<{ order: StaffOrder }>(
      `/staff/orders/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    )
  ).order;
