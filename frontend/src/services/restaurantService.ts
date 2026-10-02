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

  openingHours?: {
    open: string;
    close: string;
  };

  status: "active" | "pending" | "suspended";
  plan: "starter" | "professional" | "custom";

  ownerId?: RestaurantOwner;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantsResponse {
  success: boolean;
  data: {
    restaurants: Restaurant[];
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