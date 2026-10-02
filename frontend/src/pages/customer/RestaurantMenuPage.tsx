import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CategoryTabs from "../../components/customer/CategoryTabs";
import Cart, {
  type CartItem,
} from "../../components/customer/Cart";
import CheckoutModal from "../../components/customer/CheckoutModal";
import FoodDetailsModal from "../../components/customer/FoodDetailsModal";
import MenuItemCard from "../../components/customer/MenuItemCard";
import OrderConfirmation from "../../components/customer/OrderConfirmation";
import RestaurantHeader from "../../components/customer/RestaurantHeader";
import SearchBar from "../../components/customer/SearchBar";

import type {
  MenuCategory,
  MenuItem,
} from "../../types/menu";

function RestaurantMenuPage() {
  const { restaurantSlug, tableNumber } = useParams<{
    restaurantSlug: string;
    tableNumber: string;
  }>();

  /*
   * Real restaurant and menu data will be loaded from the backend.
   *
   * Planned API:
   * GET /api/restaurants/slug/:restaurantSlug
   * GET /api/categories/public/:restaurantId
   * GET /api/menu/public/:restaurantId
   *
   * These empty arrays intentionally replace the previous
   * hardcoded demo restaurant/menu data.
   */
  const categories: MenuCategory[] = [];
  const menuItems: MenuItem[] = [];

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] =
    useState<MenuItem | null>(null);

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [isCheckoutOpen, setIsCheckoutOpen] =
    useState(false);

  const [isOrderConfirmed, setIsOrderConfirmed] =
    useState(false);

  const [orderNumber, setOrderNumber] =
    useState("");

  const [confirmedItemCount, setConfirmedItemCount] =
    useState(0);

  const [confirmedTotal, setConfirmedTotal] =
    useState(0);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ||
        item.categoryId === activeCategory;

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const groupedItems = useMemo(() => {
    if (
      activeCategory !== "all" ||
      search.trim()
    ) {
      return [];
    }

    return categories
      .map((category) => ({
        category,
        items: filteredItems.filter(
          (item) =>
            item.categoryId === category.id,
        ),
      }))
      .filter(
        (group) => group.items.length > 0,
      );
  }, [
    activeCategory,
    search,
    filteredItems,
  ]);

  const addToCart = (
    item: MenuItem,
    quantity: number,
    note: string,
  ) => {
    setCartItems((current) => {
      const existing = current.find(
        (cartItem) =>
          cartItem.item.id === item.id,
      );

      if (existing) {
        return current.map((cartItem) =>
          cartItem.item.id === item.id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + quantity,
                note:
                  note || cartItem.note,
              }
            : cartItem,
        );
      }

      return [
        ...current,
        {
          item,
          quantity,
          note,
        },
      ];
    });
  };

  const increaseQuantity = (
    itemId: string,
  ) => {
    setCartItems((current) =>
      current.map((cartItem) =>
        cartItem.item.id === itemId
          ? {
              ...cartItem,
              quantity:
                cartItem.quantity + 1,
            }
          : cartItem,
      ),
    );
  };

  const decreaseQuantity = (
    itemId: string,
  ) => {
    setCartItems((current) =>
      current
        .map((cartItem) =>
          cartItem.item.id === itemId
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity - 1,
              }
            : cartItem,
        )
        .filter(
          (cartItem) =>
            cartItem.quantity > 0,
        ),
    );
  };

  const removeItem = (
    itemId: string,
  ) => {
    setCartItems((current) =>
      current.filter(
        (cartItem) =>
          cartItem.item.id !== itemId,
      ),
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    setIsCheckoutOpen(true);
  };

  /*
   * Order creation will be connected to the backend later.
   *
   * Planned API:
   * POST /api/orders
   *
   * The customer order should contain:
   * - restaurantId
   * - tableId
   * - items
   * - customerName
   * - customerNote
   */
  const handlePlaceOrder = (
    customerName: string,
    orderNote: string,
  ) => {
    const itemCount = cartItems.reduce(
      (total, cartItem) =>
        total + cartItem.quantity,
      0,
    );

    const total = cartItems.reduce(
      (sum, cartItem) =>
        sum +
        cartItem.item.price *
          cartItem.quantity,
      0,
    );

    /*
     * Backend-generated order numbers will replace
     * this temporary empty state.
     */
    const generatedOrderNumber = "";

    console.log(
      "Order submission is waiting for backend integration.",
      {
        restaurantSlug,
        tableNumber,
        customerName,
        orderNote,
        items: cartItems,
      },
    );

    setOrderNumber(
      generatedOrderNumber,
    );

    setConfirmedItemCount(
      itemCount,
    );

    setConfirmedTotal(total);

    setIsCheckoutOpen(false);
    setIsOrderConfirmed(true);

    setCartItems([]);
  };

  const handleBackToMenu = () => {
    setIsOrderConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <RestaurantHeader
        restaurantName={
          restaurantSlug
            ? restaurantSlug
            : "Restaurant"
        }
        location="Restaurant location"
        type="Restaurant"
        tableNumber={
          tableNumber || "—"
        }
        isOpen={false}
        rating={0}
        coverImage=""
        logo=""
      />

      <main className="mx-auto max-w-4xl">
        <div className="px-4 py-5 sm:px-6">
          <SearchBar
            value={search}
            onChange={setSearch}
          />
        </div>

        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            activeCategory={
              activeCategory
            }
            onCategoryChange={
              setActiveCategory
            }
          />
        )}

        <div className="px-4 py-6 sm:px-6">
          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🍽️
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Menu not available yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This restaurant's menu will appear
                here once the restaurant has added
                categories and menu items.
              </p>

              {restaurantSlug && (
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Restaurant: {restaurantSlug}
                </p>
              )}

              {tableNumber && (
                <p className="mt-1 text-xs text-slate-400">
                  Table: {tableNumber}
                </p>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🔍
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No food found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or choose a
                different category.
              </p>
            </div>
          ) : activeCategory ===
              "all" &&
            !search.trim() ? (
            <div className="space-y-10">
              {groupedItems.map(
                ({
                  category,
                  items,
                }) => (
                  <section
                    key={category.id}
                    id={`category-${category.id}`}
                    className="scroll-mt-20"
                  >
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {category.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {items.length}{" "}
                          {items.length ===
                          1
                            ? "item"
                            : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {items.map(
                        (item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onAdd={(
                              selected,
                            ) =>
                              setSelectedItem(
                                selected,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          ) : (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {search.trim()
                    ? "Search results"
                    : categories.find(
                          (
                            category,
                          ) =>
                            category.id ===
                            activeCategory,
                        )?.name ||
                      "Menu"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredItems.length}{" "}
                  {filteredItems.length ===
                  1
                    ? "item"
                    : "items"}{" "}
                  found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredItems.map(
                  (item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={(selected) =>
                        setSelectedItem(
                          selected,
                        )
                      }
                    />
                  ),
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <FoodDetailsModal
        item={selectedItem}
        isOpen={Boolean(
          selectedItem,
        )}
        onClose={() =>
          setSelectedItem(null)
        }
        onAdd={addToCart}
      />

      <Cart
        items={cartItems}
        onIncrease={
          increaseQuantity
        }
        onDecrease={
          decreaseQuantity
        }
        onRemove={removeItem}
        onCheckout={
          handleCheckout
        }
      />

      <CheckoutModal
        isOpen={
          isCheckoutOpen
        }
        onClose={() =>
          setIsCheckoutOpen(false)
        }
        items={cartItems}
        tableNumber={
          tableNumber || "—"
        }
        onPlaceOrder={
          handlePlaceOrder
        }
      />

      {isOrderConfirmed && (
        <OrderConfirmation
          orderNumber={
            orderNumber ||
            "Order submitted"
          }
          tableNumber={
            tableNumber || "—"
          }
          itemCount={
            confirmedItemCount
          }
          total={
            confirmedTotal
          }
          onBackToMenu={
            handleBackToMenu
          }
        />
      )}
    </div>
  );
}

export default RestaurantMenuPage;