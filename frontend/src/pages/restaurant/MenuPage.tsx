import { useMemo, useState } from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
};

const initialMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Chicken Momo",
    category: "Momo",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=500&q=85",
    available: true,
    popular: true,
  },
  {
    id: "2",
    name: "Veg Momo",
    category: "Momo",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=85",
    available: true,
    vegetarian: true,
  },
  {
    id: "3",
    name: "Chicken Chowmein",
    category: "Chowmein",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=85",
    available: true,
    popular: true,
  },
  {
    id: "4",
    name: "Dal Bhat",
    category: "Nepali",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=85",
    available: true,
    vegetarian: true,
  },
  {
    id: "5",
    name: "Chicken Sekuwa",
    category: "Snacks",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=85",
    available: false,
    popular: true,
    spicy: true,
  },
  {
    id: "6",
    name: "Cold Coffee",
    category: "Drinks",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=85",
    available: true,
    vegetarian: true,
  },
  {
    id: "7",
    name: "French Fries",
    category: "Snacks",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=85",
    available: true,
    vegetarian: true,
  },
  {
    id: "8",
    name: "Chocolate Brownie",
    category: "Desserts",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476b?auto=format&fit=crop&w=500&q=85",
    available: true,
    vegetarian: true,
  },
];

function MenuPage() {
  const [menuItems, setMenuItems] =
    useState<MenuItem[]>(initialMenuItems);

  const [activeCategory, setActiveCategory] =
    useState("All");

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          menuItems.map((item) => item.category),
        ),
      ),
    ];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(
      (item) =>
        item.category === activeCategory,
    );
  }, [menuItems, activeCategory]);

  const toggleAvailability = (id: string) => {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              available: !item.available,
            }
          : item,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Restaurant menu
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Menu Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your food items, prices and availability.
          </p>
        </div>

        <Button
          type="button"
          size="md"
        >
          + Add menu item
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="md">
          <p className="text-sm text-slate-500">
            Total items
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {menuItems.length}
          </p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">
            Available
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {
              menuItems.filter(
                (item) => item.available,
              ).length
            }
          </p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-slate-500">
            Unavailable
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            {
              menuItems.filter(
                (item) => !item.available,
              ).length
            }
          </p>
        </Card>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() =>
              setActiveCategory(category)
            }
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeCategory === category
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            padding="none"
            className="overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className={`h-full w-full object-cover transition ${
                  item.available
                    ? ""
                    : "grayscale"
                }`}
              />

              {!item.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
                    Unavailable
                  </span>
                </div>
              )}

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                {item.popular && (
                  <Badge variant="warning">
                    Popular
                  </Badge>
                )}

                {item.vegetarian && (
                  <Badge variant="success">
                    Veg
                  </Badge>
                )}

                {item.spicy && (
                  <Badge variant="danger">
                    Spicy
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.category}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-bold text-emerald-600">
                  NPR{" "}
                  {item.price.toLocaleString()}
                </span>
              </div>

              {/* Availability */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Availability
                  </p>

                  <p
                    className={`mt-0.5 text-xs ${
                      item.available
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.available
                      ? "Available for ordering"
                      : "Hidden from customers"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleAvailability(
                      item.id,
                    )
                  }
                  aria-label={`Toggle availability for ${item.name}`}
                  className={`relative h-6 w-11 rounded-full transition ${
                    item.available
                      ? "bg-emerald-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      item.available
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;