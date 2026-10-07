import { apiRequest } from "./api";

export interface PublicRestaurant {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  address: string;
  restaurantType: string;
  openingHours?: { open: string; close: string };
  isOpen: boolean;
}

export interface PublicMenuCategory {
  _id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface PublicMenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

export interface PublicMenu {
  restaurant: PublicRestaurant;
  table: { _id: string; tableNumber: string };
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
}

export type CustomerOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served";

export interface CustomerOrder {
  orderNumber: string;
  trackingToken?: string;
  status: CustomerOrderStatus;
  total: number;
  createdAt: string;
  restaurantName: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const restaurantTableEndpoint = (
  restaurantSlug: string,
  tableNumber: string,
) =>
  `/public/restaurants/${encodeURIComponent(restaurantSlug)}/t/${encodeURIComponent(tableNumber)}`;

export const getPublicMenu = async (
  restaurantSlug: string,
  tableNumber: string,
): Promise<PublicMenu> =>
  (
    await apiRequest<ApiResponse<PublicMenu>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/menu`,
    )
  ).data;

export const placeCustomerOrder = async (
  restaurantSlug: string,
  tableNumber: string,
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions: string;
  }>,
  specialInstructions: string,
): Promise<CustomerOrder> =>
  (
    await apiRequest<ApiResponse<{ order: CustomerOrder }>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/orders`,
      {
        method: "POST",
        body: JSON.stringify({ items, specialInstructions }),
      },
    )
  ).data.order;

export const getCustomerOrder = async (
  trackingToken: string,
): Promise<CustomerOrder> =>
  (
    await apiRequest<ApiResponse<{ order: CustomerOrder }>>(
      `/public/orders/${encodeURIComponent(trackingToken)}`,
    )
  ).data.order;
