import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CategoryTabs from "../../components/customer/CategoryTabs";
import Cart, { type CartItem } from "../../components/customer/Cart";
import CheckoutModal from "../../components/customer/CheckoutModal";
import FoodDetailsModal from "../../components/customer/FoodDetailsModal";
import MenuItemCard from "../../components/customer/MenuItemCard";
import OrderConfirmation from "../../components/customer/OrderConfirmation";
import RestaurantHeader from "../../components/customer/RestaurantHeader";
import SearchBar from "../../components/customer/SearchBar";
import type { CustomerOrder } from "../../services/customerService";
import {
  getCustomerOrder,
  getPublicMenu,
  placeCustomerOrder,
  updateCustomerOrderPayment,
  type CustomerPaymentMethod,
  type PublicMenu,
} from "../../services/customerService";
import type { MenuCategory, MenuItem } from "../../types/menu";

function RestaurantMenuPage() {
  const { restaurantSlug = "", tableNumber = "" } = useParams<{
    restaurantSlug: string;
    tableNumber: string;
  }>();
  const routeKey = `${restaurantSlug}\u0000${tableNumber}`;
  const storedOrderKey = `aagan:last-order:${restaurantSlug}:${tableNumber}`;
  const [menuState, setMenuState] = useState<{
    routeKey: string;
    menu: PublicMenu | null;
    loading: boolean;
    error: string;
  }>({ routeKey: "", menu: null, loading: true, error: "" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [lastOrder, setLastOrder] = useState<CustomerOrder | null>(null);
  const menu = menuState.routeKey === routeKey ? menuState.menu : null;
  const loading = menuState.routeKey !== routeKey || menuState.loading;
  const loadError =
    menuState.routeKey === routeKey ? menuState.error : "";
  const restaurant = menu?.restaurant;
  const table = menu?.table;

  useEffect(() => {
    let active = true;
    getPublicMenu(restaurantSlug, tableNumber)
      .then((data) => {
        if (active) {
          setMenuState({
            routeKey,
            menu: data,
            loading: false,
            error: "",
          });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Failed to load public restaurant menu:", error);
        setMenuState({
          routeKey,
          menu: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load this menu.",
        });
      });
    return () => {
      active = false;
    };
  }, [restaurantSlug, tableNumber, routeKey]);

  useEffect(() => {
    let active = true;
    let trackingToken: string | null;
    try {
      trackingToken = window.sessionStorage.getItem(storedOrderKey);
    } catch (error) {
      console.warn("Unable to restore the previous order from this browser tab:", error);
      return () => {
        active = false;
      };
    }
    if (!trackingToken) return () => {
      active = false;
    };

    getCustomerOrder(trackingToken)
      .then((order) => {
        if (
          active &&
          order.restaurantSlug === restaurantSlug &&
          order.tableNumber === tableNumber
        ) {
          setLastOrder(order);
        } else if (active) {
          try {
            window.sessionStorage.removeItem(storedOrderKey);
          } catch (error) {
            console.warn("Unable to remove an order from another table:", error);
          }
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Failed to restore customer order:", error);
        setTrackingError(
          error instanceof Error
            ? error.message
            : "Unable to restore the previous order.",
        );
        try {
          window.sessionStorage.removeItem(storedOrderKey);
        } catch (storageError) {
          console.warn("Unable to remove an expired order from this browser tab:", storageError);
        }
      });
    return () => {
      active = false;
    };
  }, [restaurantSlug, storedOrderKey, tableNumber]);

  useEffect(() => {
    const trackingToken = lastOrder?.trackingToken;
    if (
      !trackingToken ||
      (lastOrder.status.toLowerCase() === "served" &&
        (lastOrder.paymentStatus === "paid" ||
          lastOrder.paymentStatus === "rejected"))
    ) return;

    let active = true;
    const refreshOrder = async () => {
      try {
        const updatedOrder = await getCustomerOrder(trackingToken);
        if (active) {
          setLastOrder((current) =>
            current
              ? { ...current, ...updatedOrder, trackingToken }
              : current,
          );
          setTrackingError("");
        }
      } catch (error) {
        if (!active) return;
        console.error("Failed to refresh customer order status:", error);
        setTrackingError(
          error instanceof Error
            ? error.message
            : "Unable to refresh the order status.",
        );
      }
    };

    const interval = window.setInterval(() => void refreshOrder(), 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [lastOrder?.trackingToken, lastOrder?.status, lastOrder?.paymentStatus]);

  const categories: MenuCategory[] = useMemo(
    () =>
      (menu?.categories ?? []).map((category) => ({
        id: category._id,
        name: category.name,
      })),
    [menu?.categories],
  );

  const menuItems: MenuItem[] = useMemo(
    () =>
      (menu?.items ?? []).map((item) => ({
        id: item._id,
        categoryId:
          typeof item.categoryId === "string"
            ? item.categoryId
            : item.categoryId._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        available: item.available,
      })),
    [menu?.items],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menuItems, search]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== "all" || search.trim()) return [];
    return categories
      .map((category) => ({
        category,
        items: filteredItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [activeCategory, categories, filteredItems, search]);

  const addToCart = (item: MenuItem, quantity: number, note: string) => {
    setCartItems((current) => {
      const matchingLine = current.find(
        (line) => line.item.id === item.id && line.note === note,
      );
      if (matchingLine) {
        return current.map((line) =>
          line.lineId === matchingLine.lineId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [
        ...current,
        { lineId: crypto.randomUUID(), item, quantity, note },
      ];
    });
  };

  const updateQuantity = (lineId: string, change: number) => {
    setCartItems((current) =>
      current
        .map((line) =>
          line.lineId === lineId
            ? { ...line, quantity: line.quantity + change }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const removeItem = (lineId: string) => {
    setCartItems((current) =>
      current.filter((line) => line.lineId !== lineId),
    );
  };

  const handlePlaceOrder = async (orderNote: string) => {
    if (!restaurant || !table || cartItems.length === 0 || submitting) return;
    setSubmitting(true);
    setOrderError("");
    try {
      const order = await placeCustomerOrder(
        restaurant.slug,
        table.tableNumber,
        cartItems.map((line) => ({
          menuItemId: line.item.id,
          quantity: line.quantity,
          specialInstructions: line.note ?? "",
        })),
        orderNote,
      );
      setLastOrder(order);
      if (order.trackingToken) {
        try {
          window.sessionStorage.setItem(storedOrderKey, order.trackingToken);
        } catch (error) {
          console.warn("Unable to remember this order in the current browser tab:", error);
        }
      }
      setIsCheckoutOpen(false);
      setIsOrderConfirmed(true);
      setCartItems([]);
    } catch (error) {
      console.error("Failed to place customer order:", error);
      setOrderError(
        error instanceof Error ? error.message : "Unable to place your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayment = async (
    method: CustomerPaymentMethod,
    action: "select" | "submit",
  ): Promise<boolean> => {
    if (!lastOrder?.trackingToken || paymentBusy) return false;
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const payment = await updateCustomerOrderPayment(
        lastOrder.trackingToken,
        method,
        action,
      );
      setLastOrder((current) => (current ? { ...current, ...payment } : current));
      return true;
    } catch (error) {
      console.error("Failed to update customer payment:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Unable to update payment.",
      );
      return false;
    } finally {
      setPaymentBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f0] px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#d8c9a8] border-t-[#173b32]" />
          <p className="mt-4 font-serif text-lg font-semibold text-[#173b32]">Preparing your menu</p>
          <p className="mt-1 text-xs text-slate-500">A moment while we set your table</p>
        </div>
      </div>
    );
  }

  if (loadError || !menu || !restaurant || !table) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0] px-5">
        <section className="w-full max-w-md rounded-3xl border border-[#e9e4d9] bg-[#fffefa] p-8 text-center shadow-[0_14px_44px_rgba(32,38,32,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4efe2] text-2xl">
            🍽️
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[#173b32]">
            Menu unavailable
          </h1>
          <p role="alert" className="mt-2 text-sm leading-6 text-slate-500">
            {loadError || "This restaurant or table could not be found."}
          </p>
        </section>
      </main>
    );
  }

  const itemCount = cartItems.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8f6f0] pb-32">
      <RestaurantHeader
        restaurantName={restaurant.name}
        location={restaurant.address || "Welcome"}
        type={restaurant.restaurantType || "Restaurant"}
        tableNumber={table.tableNumber}
        isOpen={restaurant.isOpen}
        coverImage={restaurant.coverImage}
        logo={restaurant.logo}
      />

      <main className="mx-auto max-w-6xl">
        {lastOrder && !isOrderConfirmed && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#d7e4dc] bg-white px-4 py-3 shadow-sm sm:mx-6">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Order {lastOrder.orderNumber}
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-[#173b32]">
                {lastOrder.status}
                {lastOrder.paymentStatus
                  ? ` · Payment ${lastOrder.paymentStatus.replaceAll("_", " ")}`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOrderConfirmed(true)}
              className="shrink-0 rounded-xl bg-[#173b32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245747]"
            >
              Track order
            </button>
          </div>
        )}

        <div className="px-4 pb-4 pt-2 sm:px-8 sm:pb-6 sm:pt-3">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7540]">
                Made for your table
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#173b32] sm:text-3xl">
                Explore the menu
              </h2>
            </div>
            <p className="hidden pb-1 text-xs text-slate-500 sm:block">
              Choose a dish, then we’ll bring it to you.
            </p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}

        <div className="px-4 py-6 sm:px-8">
          {!restaurant.isOpen && (
            <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              The restaurant is currently closed. You can browse the menu, but
              orders are temporarily unavailable.
            </p>
          )}

          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🍽️
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Menu coming soon
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                This restaurant is still preparing its menu. Please check back
                soon.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🔍
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No dishes found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or choose a different category.
              </p>
            </div>
          ) : activeCategory === "all" && !search.trim() ? (
            <div className="space-y-10">
              {groupedItems.map(({ category, items }) => (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="scroll-mt-20"
                >
                  <div className="mb-4 border-b border-[#e9e4d9] pb-3">
                    <h2 className="font-serif text-2xl font-semibold text-[#242a24]">
                      {category.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {items.length} {items.length === 1 ? "dish" : "dishes"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAdd={setSelectedItem}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section>
              <div className="mb-4 border-b border-[#e9e4d9] pb-3">
                <h2 className="font-serif text-2xl font-semibold text-[#242a24]">
                  {search.trim()
                    ? "Search results"
                    : categories.find((category) => category.id === activeCategory)
                        ?.name || "Menu"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1 ? "dish" : "dishes"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={setSelectedItem}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <FoodDetailsModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onAdd={addToCart}
      />
      <Cart
        items={cartItems}
        tableNumber={table.tableNumber}
        onIncrease={(lineId) => updateQuantity(lineId, 1)}
        onDecrease={(lineId) => updateQuantity(lineId, -1)}
        onRemove={removeItem}
        onCheckout={() => {
          setOrderError("");
          setIsCheckoutOpen(true);
        }}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        tableNumber={table.tableNumber}
        restaurantOpen={restaurant.isOpen}
        submitting={submitting}
        error={orderError}
        onPlaceOrder={handlePlaceOrder}
      />
      {isOrderConfirmed && lastOrder && (
        <>
          {trackingError && (
            <p
              role="alert"
              className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700 shadow"
            >
              {trackingError}
            </p>
          )}
          <OrderConfirmation
            order={lastOrder}
            itemCount={lastOrder.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            )}
            paymentSettings={restaurant.paymentSettings}
            paymentBusy={paymentBusy}
            paymentError={paymentError}
            onUpdatePayment={handleUpdatePayment}
            onContinueBrowsing={() => setIsOrderConfirmed(false)}
          />
        </>
      )}
      <span className="sr-only">
        {itemCount} items in cart
      </span>
    </div>
  );
}

export default RestaurantMenuPage;
