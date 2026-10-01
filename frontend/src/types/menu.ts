export interface MenuCategory {
  id: string;
  name: string;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}