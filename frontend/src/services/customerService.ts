import { apiRequest, resolveMediaUrl } from "./api";

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
  paymentSettings: {
    cashEnabled: boolean;
    esewa: { qrImage: string } | null;
    khalti: { qrImage: string } | null;
    bank: {
      qrImage: string;
      bankName: string;
      accountName: string;
      accountNumber: string;
    } | null;
  };
}

export interface PublicMenuCategory {
  _id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface PublicMenuItem {
  _id: string;
  categoryId: string | { _id: string; name: string };
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

export interface CustomerCoordinates {
  latitude: number;
  longitude: number;
}

export type CustomerFulfillmentType = "dine_in" | "takeaway";
export type CustomerStaffCallType = "assistance";

export interface PublicQrLocation {
  enabled: boolean;
  radiusMeters: number;
}

export type CustomerOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type CustomerPaymentMethod = "cash" | "esewa" | "khalti" | "bank_qr";
export type CustomerPaymentStatus =
  | "unpaid"
  | "pending"
  | "pending_verification"
  | "paid"
  | "rejected";

export interface CustomerOrder {
  orderNumber: string;
  trackingToken?: string;
  tableSessionId?: string;
  status: CustomerOrderStatus;
  fulfillmentType?: CustomerFulfillmentType;
  declineReason?: string;
  paymentMethod?: CustomerPaymentMethod;
  paymentStatus?: CustomerPaymentStatus;
  total: number;
  createdAt: string;
  restaurantName: string;
  restaurantSlug?: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
}

export interface CustomerTableSession {
  sessionToken: string;
  status: "active";
  tableNumber: string;
  startedAt: string;
  orders: CustomerOrder[];
  bill?: CustomerTableBill | null;
}

export interface CustomerTableBill {
  orderIds: string[];
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions: string;
    orderNumbers: string[];
  }>;
  total: number;
  paidAmount: number;
  paymentAmount: number;
  paymentMethod?: CustomerPaymentMethod;
  paymentStatus: CustomerPaymentStatus;
  canPay: boolean;
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

export const getCustomerQrLocation = async (
  restaurantSlug: string,
  tableNumber: string,
): Promise<PublicQrLocation> =>
  (
    await apiRequest<ApiResponse<PublicQrLocation>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/location`,
    )
  ).data;

export const verifyCustomerQrLocation = async (
  restaurantSlug: string,
  tableNumber: string,
  location: CustomerCoordinates,
): Promise<{ allowed: boolean; radiusMeters: number; message: string }> =>
  (
    await apiRequest<ApiResponse<{ allowed: boolean; radiusMeters: number; message: string }>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/location-check`,
      { method: "POST", body: JSON.stringify({ location }) },
    )
  ).data;

const loadCustomerTableSession = async (
  restaurantSlug: string,
  tableNumber: string,
  method: "GET" | "POST",
  location?: CustomerCoordinates,
): Promise<CustomerTableSession | null> => {
  const data = (
    await apiRequest<ApiResponse<{
      session: Omit<CustomerTableSession, "orders"> | null;
      orders: CustomerOrder[];
    }>>(`${restaurantTableEndpoint(restaurantSlug, tableNumber)}/session`, {
      method,
      ...(method === "POST" && location
        ? { body: JSON.stringify({ location }) }
        : {}),
    })
  ).data;
  return data.session ? { ...data.session, orders: data.orders } : null;
};

export const getOrCreateCustomerTableSession = (
  restaurantSlug: string,
  tableNumber: string,
  location?: CustomerCoordinates,
): Promise<CustomerTableSession | null> =>
  loadCustomerTableSession(restaurantSlug, tableNumber, "POST", location);

export const getActiveCustomerTableSession = (
  restaurantSlug: string,
  tableNumber: string,
): Promise<CustomerTableSession | null> =>
  loadCustomerTableSession(restaurantSlug, tableNumber, "GET");

export const getPublicMenu = async (
  restaurantSlug: string,
  tableNumber: string,
  location?: CustomerCoordinates,
): Promise<PublicMenu> => {
  const query = location
    ? `?latitude=${encodeURIComponent(String(location.latitude))}&longitude=${encodeURIComponent(String(location.longitude))}`
    : "";
  const menu = (
    await apiRequest<ApiResponse<PublicMenu>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/menu${query}`,
    )
  ).data;
  return {
    ...menu,
    restaurant: {
      ...menu.restaurant,
      paymentSettings: {
        ...menu.restaurant.paymentSettings,
        esewa: menu.restaurant.paymentSettings.esewa
          ? {
              qrImage: resolveMediaUrl(
                menu.restaurant.paymentSettings.esewa.qrImage,
              ),
            }
          : null,
        khalti: menu.restaurant.paymentSettings.khalti
          ? {
              qrImage: resolveMediaUrl(
                menu.restaurant.paymentSettings.khalti.qrImage,
              ),
            }
          : null,
        bank: menu.restaurant.paymentSettings.bank
          ? {
              ...menu.restaurant.paymentSettings.bank,
              qrImage: resolveMediaUrl(
                menu.restaurant.paymentSettings.bank.qrImage,
              ),
            }
          : null,
      },
    },
    items: menu.items.map((item) => ({
      ...item,
      image: resolveMediaUrl(item.image),
    })),
  };
};

export const placeCustomerOrder = async (
  restaurantSlug: string,
  tableNumber: string,
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions: string;
  }>,
  specialInstructions: string,
  fulfillmentType: CustomerFulfillmentType,
  location?: CustomerCoordinates,
): Promise<CustomerOrder> =>
  (
    await apiRequest<ApiResponse<{ order: CustomerOrder }>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/orders`,
      {
        method: "POST",
        body: JSON.stringify({ items, specialInstructions, fulfillmentType, location }),
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

export const updateCustomerOrderPayment = async (
  trackingToken: string,
  method: CustomerPaymentMethod,
  action: "select" | "submit",
): Promise<Pick<CustomerOrder, "paymentMethod" | "paymentStatus"> & { bill?: CustomerTableBill }> =>
  (
    await apiRequest<
      ApiResponse<Pick<CustomerOrder, "paymentMethod" | "paymentStatus"> & { bill?: CustomerTableBill }>
    >(`/public/orders/${encodeURIComponent(trackingToken)}/payment`, {
      method: "POST",
      body: JSON.stringify({ method, action }),
    })
  ).data;

export const createCustomerStaffCall = async (
  restaurantSlug: string,
  tableNumber: string,
  sessionToken: string,
  type: CustomerStaffCallType,
): Promise<{ _id: string; status: "pending" | "attended"; type: CustomerStaffCallType }> =>
  (
    await apiRequest<ApiResponse<{ request: { _id: string; status: "pending" | "attended"; type: CustomerStaffCallType } }>>(
      `${restaurantTableEndpoint(restaurantSlug, tableNumber)}/staff-calls`,
      {
        method: "POST",
        body: JSON.stringify({ sessionToken, type }),
      },
    )
  ).data.request;
