/*
 * Customer menu data
 *
 * Demo menu data has been removed.
 *
 * Categories and menu items will be loaded from the backend.
 *
 * Planned public APIs:
 * GET /api/restaurants/slug/:restaurantSlug
 * GET /api/categories/public/:restaurantId
 * GET /api/menu/public/:restaurantId
 */

import type {
  MenuCategory,
  MenuItem,
} from "../../../types/menu";

export const categories: MenuCategory[] = [];

export const menuItems: MenuItem[] = [];