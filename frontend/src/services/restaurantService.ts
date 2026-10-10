import { apiRequest } from "./api";

export interface RestaurantOwner {
  _id: string;
  name: string;
  email: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  phone: string;
  address: string;
  restaurantType?: string;
  acceptingOrders?: boolean;
  isOpen?: boolean;
  qrLocation?: { latitude: number; longitude: number } | null;
  paymentSettings?: {
    cashEnabled: boolean;
    esewaEnabled: boolean;
    esewaQrImage: string;
    khaltiEnabled: boolean;
    khaltiQrImage: string;
    bankEnabled: boolean;
    bankQrImage: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
  };

  openingHours?: {
    open: string;
    close: string;
  };

  status: "active" | "pending" | "suspended";
  plan: "starter" | "professional" | "custom";

  ownerId?: RestaurantOwner | null;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantsResponse {
  success: boolean;
  data: {
    restaurants: Restaurant[];
  };
}

interface RestaurantResponse {
  success: boolean;
  data: {
    restaurant: Restaurant;
  };
}

export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin authentication required");
  }

  const response = await apiRequest<RestaurantsResponse>(
    "/restaurants/admin/all",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.restaurants;
};

export const getRestaurantById = async (
  restaurantId: string,
): Promise<Restaurant> => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin authentication required");
  }

  const response = await apiRequest<RestaurantResponse>(
    `/restaurants/admin/${restaurantId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.restaurant;
};