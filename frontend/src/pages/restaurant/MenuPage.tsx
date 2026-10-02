import { useMemo, useState } from "react";
import {
  CircleAlert,
  FolderOpen,
  Plus,
  UtensilsCrossed,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

type MenuCategory = {
  id: string;
  name: string;
};

function MenuPage() {
  const [activeCategory, setActiveCategory] =
    useState("All");

  /*
   * TEMPORARY EMPTY STATE
   *
   * No demo menu items are kept in the frontend.
   *
   * Real data will eventually come from:
   *
   * GET    /api/categories
   * GET    /api/menu
   * POST   /api/menu
   * PATCH  /api/menu/:itemId
   * DELETE /api/menu/:itemId
   */

  const menuItems: never[] = [];

  /*
   * Categories will also come from MongoDB.
   *
   * Keeping an empty array here means the UI does not
   * pretend that categories already exist.
   */
  const categories: MenuCategory[] = [];

  const categoryTabs = useMemo(() => {
    return [
      "All",
      ...categories.map((category) => category.name),
    ];
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(() => false);
  }, [menuItems, activeCategory]);

  const availableCount = menuItems.length;
  const unavailableCount = 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          PAGE HEADING
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Restaurant menu
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Menu Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your food items, prices and availability.
          </p>
        </div>

        <Button
          type="button"
          size="md"
          disabled
        >
          <Plus size={16} strokeWidth={2} />
          Add menu item
        </Button>
      </div>

      {/* =====================================================
          DATABASE CONNECTION NOTICE
      ====================================================== */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <CircleAlert
          size={17}
          className="mt-0.5 shrink-0 text-amber-600"
          strokeWidth={1.8}
        />

        <div>
          <p className="text-xs font-bold text-amber-800">
            Menu data is not connected yet
          </p>

          <p className="mt-0.5 text-xs leading-5 text-amber-700">
            Demo menu items have been removed. Real categories
            and menu items will appear here after the MongoDB
            menu system is connected.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="md">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Total items
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {menuItems.length}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Menu items in your restaurant
          </p>
        </Card>

        <Card padding="md">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Available
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-300">
            {availableCount}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Available for customer ordering
          </p>
        </Card>

        <Card padding="md">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Unavailable
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-300">
            {unavailableCount}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Currently hidden from customers
          </p>
        </Card>
      </div>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}
      <div>
        {categoryTabs.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryTabs.map((category) => (
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
        ) : (
          <Card padding="none">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <FolderOpen
                  size={17}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700">
                  No menu categories yet
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Categories will appear here once created.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* =====================================================
          MENU EMPTY STATE
      ====================================================== */}
      {filteredItems.length === 0 ? (
        <Card padding="lg">
          <div className="flex min-h-[360px] flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UtensilsCrossed
                size={26}
                strokeWidth={1.7}
              />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              Your menu is empty
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add your restaurant's categories and food
              items here. They will later be displayed on
              the customer QR menu.
            </p>

            <Button
              type="button"
              className="mt-5"
              disabled
            >
              <Plus
                size={16}
                strokeWidth={2}
              />
              Add your first menu item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item}
              padding="md"
            >
              Menu item
            </Card>
          ))}
        </div>
      )}

      {/* =====================================================
          MENU SYSTEM STATUS
      ====================================================== */}
      <Card padding="none">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <UtensilsCrossed
                size={17}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-950">
                Menu system
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Backend integration status
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Categories
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Not connected
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Categories will be stored per restaurant.
            </p>
          </div>

          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Menu items
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Not connected
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Food items will be loaded from MongoDB.
            </p>
          </div>

          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Customer menu
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Waiting for menu API
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Customer QR pages will use the same restaurant
              menu data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MenuPage;