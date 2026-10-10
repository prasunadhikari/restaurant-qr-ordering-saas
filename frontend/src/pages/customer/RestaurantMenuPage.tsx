import { useEffect, useMemo, useState } from "react";
import { PhoneCall } from "lucide-react";
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
  getCustomerQrLocation,
  getActiveCustomerTableSession,
  getCustomerOrder,
  getOrCreateCustomerTableSession,
  getPublicMenu,
  placeCustomerOrder,
  updateCustomerOrderPayment,
  createCustomerStaffCall,
  verifyCustomerQrLocation,
  type CustomerStaffCallType,
  type CustomerCoordinates,
  type CustomerFulfillmentType,
  type CustomerPaymentMethod,
  type CustomerTableSession,
  type PublicMenu,
} from "../../services/customerService";
import type { MenuCategory, MenuItem } from "../../types/menu";

const currentBrowserLocation = (): Promise<{
  location: CustomerCoordinates;
  accuracy: number;
}> => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error("This browser cannot verify your location. Try a device with location services enabled."));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({
      location: { latitude: coords.latitude, longitude: coords.longitude },
      accuracy: coords.accuracy,
    }),
    (cause) => reject(new Error(cause.code === cause.PERMISSION_DENIED
      ? "Allow location access to open this QR menu."
      : "Unable to verify your location. Turn on location services and try again.")),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
});

function RestaurantMenuPage() {
  const { restaurantSlug = "", tableNumber = "" } = useParams<{
    restaurantSlug: string;
    tableNumber: string;
  }>();
  const routeKey = `${restaurantSlug}\u0000${tableNumber}`;
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
  const [fulfillmentType, setFulfillmentType] = useState<CustomerFulfillmentType>("dine_in");
  const [locationRetry, setLocationRetry] = useState(0);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [verifiedLocation, setVerifiedLocation] = useState<{
    routeKey: string;
    enabled: boolean;
    allowed: boolean;
    coordinates: CustomerCoordinates | null;
  }>({ routeKey: "", enabled: false, allowed: false, coordinates: null });
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [staffCallBusy, setStaffCallBusy] = useState<CustomerStaffCallType | null>(null);
  const [staffCallStatus, setStaffCallStatus] = useState<Partial<Record<CustomerStaffCallType, "pending">>>({});
  const [staffCallError, setStaffCallError] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [lastOrder, setLastOrder] = useState<CustomerOrder | null>(null);
  const [dismissedCancellationTokens, setDismissedCancellationTokens] = useState<string[]>([]);
  const [tableSessionState, setTableSessionState] = useState<{
    routeKey: string;
    session: CustomerTableSession | null;
    loading: boolean;
  }>({ routeKey: "", session: null, loading: true });
  const menu = menuState.routeKey === routeKey ? menuState.menu : null;
  const loading = menuState.routeKey !== routeKey || menuState.loading;
  const loadError =
    menuState.routeKey === routeKey ? menuState.error : "";
  const restaurant = menu?.restaurant;
  const table = menu?.table;

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setMenuState({ routeKey, menu: null, loading: true, error: "" });
      setLocationBlocked(false);
    });
    const loadPublicMenu = async () => {
      try {
        const locationSettings = await getCustomerQrLocation(restaurantSlug, tableNumber);
        let coordinates: CustomerCoordinates | null = null;
        if (locationSettings.enabled) {
          setLocationBlocked(true);
          const current = await currentBrowserLocation();
          if (current.accuracy > locationSettings.radiusMeters) {
            throw new Error("Your location could not be verified accurately. Turn on precise location and try again.");
          }
          const check = await verifyCustomerQrLocation(
            restaurantSlug,
            tableNumber,
            current.location,
          );
          if (!check.allowed) throw new Error(check.message);
          coordinates = current.location;
        }
        const data = await getPublicMenu(
          restaurantSlug,
          tableNumber,
          coordinates ?? undefined,
        );
        if (!active) return;
        setVerifiedLocation({
          routeKey,
          enabled: locationSettings.enabled,
          allowed: true,
          coordinates,
        });
        setLocationBlocked(false);
        setMenuState({ routeKey, menu: data, loading: false, error: "" });
      } catch (error: unknown) {
        if (!active) return;
        console.error("Failed to verify QR menu access or load the restaurant menu:", error);
        setMenuState({
          routeKey,
          menu: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load this menu.",
        });
      }
    };
    void loadPublicMenu();
    return () => {
      active = false;
    };
  }, [restaurantSlug, tableNumber, routeKey, locationRetry]);

  useEffect(() => {
    if (menuState.routeKey !== routeKey || !menuState.menu) return;
    const location = verifiedLocation.routeKey === routeKey ? verifiedLocation : null;
    if (!location?.allowed) return;

    let active = true;
    let firstLoad = true;
    let refreshInFlight = false;
    const refreshTableSession = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        const session = firstLoad
          ? await getOrCreateCustomerTableSession(
              restaurantSlug,
              tableNumber,
              location.coordinates ?? undefined,
            )
          : await getActiveCustomerTableSession(restaurantSlug, tableNumber);
        firstLoad = false;
        if (!active) return;
        setTableSessionState({ routeKey, session, loading: false });
        if (session) {
          try {
            window.sessionStorage.setItem(
              `aagan:table-session:${restaurantSlug}:${tableNumber}`,
              session.sessionToken,
            );
          } catch (error) {
            console.warn("Unable to cache the table session token:", error);
          }
        }
        if (!session) {
          setLastOrder(null);
          setIsOrderConfirmed(false);
        } else {
          setLastOrder((current) => {
            if (!current?.tableSessionId) return current;
            return session.orders.find(
              (order) => order.trackingToken === current.trackingToken,
            ) ?? null;
          });
        }
        if (session) setTrackingError("");
      } catch (error) {
        firstLoad = false;
        if (!active) return;
        console.error("Failed to restore active customer table session:", error);
        setTrackingError(
          error instanceof Error ? error.message : "Unable to restore table orders.",
        );
        setTableSessionState({ routeKey, session: null, loading: false });
      } finally {
        refreshInFlight = false;
      }
    };
    void refreshTableSession();
    const interval = window.setInterval(() => void refreshTableSession(), 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [menuState.menu, menuState.routeKey, restaurantSlug, routeKey, tableNumber, verifiedLocation]);

  useEffect(() => {
    const trackingToken = lastOrder?.trackingToken;
    if (
      !trackingToken ||
      lastOrder.status.toLowerCase() === "cancelled" ||
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
          setTableSessionState((current) => current.session
            ? {
                ...current,
                session: {
                  ...current.session,
                  orders: current.session.orders.map((order) =>
                    order.trackingToken === trackingToken
                      ? { ...order, ...updatedOrder, trackingToken }
                      : order,
                  ),
                },
              }
            : current);
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
      let location = verifiedLocation.coordinates ?? undefined;
      if (verifiedLocation.enabled) {
        const current = await currentBrowserLocation();
        if (current.accuracy > 100) {
          throw new Error("Your location could not be verified accurately. Turn on precise location and try again.");
        }
        const check = await verifyCustomerQrLocation(
          restaurant.slug,
          table.tableNumber,
          current.location,
        );
        if (!check.allowed) throw new Error(check.message);
        location = current.location;
      }
      const order = await placeCustomerOrder(
        restaurant.slug,
        table.tableNumber,
        cartItems.map((line) => ({
          menuItemId: line.item.id,
          quantity: line.quantity,
          specialInstructions: line.note ?? "",
        })),
        orderNote,
        fulfillmentType,
        location,
      );
      try {
        const refreshedSession = await getActiveCustomerTableSession(
          restaurant.slug,
          table.tableNumber,
        );
        if (refreshedSession) {
          setTableSessionState({ routeKey, session: refreshedSession, loading: false });
        }
      } catch (sessionError) {
        console.error("Order was placed but the active table session could not refresh:", sessionError);
      }
      setLastOrder(order);
      setTableSessionState((current) => current.routeKey === routeKey && current.session
        ? {
            ...current,
            session: {
              ...current.session,
              orders: [
                order,
                ...current.session.orders.filter(
                  (entry) => entry.trackingToken !== order.trackingToken,
                ),
              ],
            },
          }
        : current);
      if (order.trackingToken) {
        try {
          window.sessionStorage.setItem(
            `aagan:last-order:${restaurantSlug}:${tableNumber}`,
            order.trackingToken,
          );
        } catch (error) {
          console.warn("Unable to remember this order in the current browser tab:", error);
        }
      }
      setIsCheckoutOpen(false);
      setIsOrderConfirmed(true);
      setCartItems([]);
      setFulfillmentType("dine_in");
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
      setTableSessionState((current) => current.session
        ? {
            ...current,
            session: {
              ...current.session,
              ...(payment.bill ? { bill: payment.bill } : {}),
              orders: current.session.orders.map((order) =>
                order.trackingToken === lastOrder.trackingToken
                  ? { ...order, ...payment }
                  : order,
              ),
            },
          }
        : current);
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

  const handleCallStaff = async (type: CustomerStaffCallType) => {
    if (!activeSession || staffCallBusy) return;
    setStaffCallBusy(type);
    setStaffCallError("");
    try {
      await createCustomerStaffCall(
        restaurantSlug,
        tableNumber,
        activeSession.sessionToken,
        type,
      );
      setStaffCallStatus((current) => ({ ...current, [type]: "pending" }));
    } catch (error) {
      console.error("Failed to request restaurant staff:", error);
      setStaffCallError(error instanceof Error ? error.message : "Unable to contact staff.");
    } finally {
      setStaffCallBusy(null);
    }
  };

  const retryLocationVerification = () => {
    setLocationRetry((current) => current + 1);
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
            {locationBlocked ? "QR menu is for nearby customers" : "Menu unavailable"}
          </h1>
          <p role="alert" className="mt-2 text-sm leading-6 text-slate-500">
            {loadError || "This restaurant or table could not be found."}
          </p>
          {locationBlocked && (
            <button
              type="button"
              onClick={retryLocationVerification}
              className="mt-5 min-h-11 rounded-xl bg-[#173b32] px-5 text-sm font-semibold text-white hover:bg-[#245747]"
            >
              Check my location again
            </button>
          )}
        </section>
      </main>
    );
  }

  const itemCount = cartItems.reduce((sum, line) => sum + line.quantity, 0);
  const activeSession =
    tableSessionState.routeKey === routeKey ? tableSessionState.session : null;
  const sessionOrders = activeSession?.orders ?? [];
  const visibleSessionOrders = sessionOrders.filter(
    (order) => order.status.toLowerCase() !== "cancelled",
  );
  const lastOrderBelongsToCurrentSession =
    !lastOrder?.tableSessionId ||
    sessionOrders.some((order) => order.trackingToken === lastOrder.trackingToken) ||
    isOrderConfirmed;
  const unacknowledgedCancellation = [...sessionOrders]
    .reverse()
    .find((order) =>
      order.status.toLowerCase() === "cancelled" &&
      order.trackingToken &&
      !dismissedCancellationTokens.includes(order.trackingToken),
    );
  const dismissCancellation = (order: CustomerOrder) => {
    const token = order.trackingToken;
    if (token) {
      setDismissedCancellationTokens((current) =>
        current.includes(token) ? current : [...current, token],
      );
    }
    if (lastOrder?.trackingToken === token) {
      setLastOrder(null);
      setIsOrderConfirmed(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f8f6f0] pb-32">
      {activeSession && !isOrderConfirmed && (
        <aside className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-[#e9e4d9] bg-white p-3 shadow-xl sm:bottom-6 sm:right-6 sm:flex-row">
          <button
            type="button"
            disabled={staffCallBusy !== null || staffCallStatus.assistance === "pending"}
            onClick={() => void handleCallStaff("assistance")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173b32] px-5 text-sm font-semibold text-white shadow-md shadow-[#173b32]/15 transition hover:-translate-y-0.5 hover:bg-[#245747] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PhoneCall size={16} />
            {staffCallStatus.assistance === "pending"
              ? "Staff notified"
              : staffCallBusy === "assistance"
                ? "Calling…"
                : "Call staff"}
          </button>
        </aside>
      )}
      {staffCallError && (
        <p role="alert" className="fixed bottom-20 right-4 z-40 max-w-sm rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg sm:right-6">
          {staffCallError}
        </p>
      )}
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
        {visibleSessionOrders.length > 0 && !isOrderConfirmed && (
          <section aria-label="Your table orders" className="mx-4 mt-4 rounded-2xl border border-[#d7e4dc] bg-white p-4 shadow-sm sm:mx-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#173b32]">Welcome back 👋</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Table {table.tableNumber} · Your Table Orders · {visibleSessionOrders.length} {visibleSessionOrders.length === 1 ? "order" : "orders"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#edf3ec] px-3 py-1 text-xs font-semibold text-[#315b40]">Order more below</span>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {visibleSessionOrders.map((order) => {
                const cancelled = order.status.toLowerCase() === "cancelled";
                return (
                  <li key={order.trackingToken ?? order.orderNumber} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">Order #{order.orderNumber}</p>
                      <p className={`mt-0.5 text-xs capitalize ${cancelled ? "text-red-700" : "text-slate-500"}`}>
                        {order.status}{cancelled && order.declineReason ? ` · ${order.declineReason}` : ""}
                        {` · ${order.fulfillmentType === "takeaway" ? "Take away" : "Dine in"}`}
                        {order.paymentStatus ? ` · Payment ${order.paymentStatus.replaceAll("_", " ")}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold">NPR {order.total.toLocaleString()}</span>
                      <button
                        type="button"
                        disabled={!order.trackingToken}
                        onClick={() => {
                          setLastOrder(order);
                          setIsOrderConfirmed(true);
                        }}
                        className="rounded-xl bg-[#173b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#245747] disabled:opacity-50"
                      >
                        Track
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
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
        fulfillmentType={fulfillmentType}
        onFulfillmentTypeChange={setFulfillmentType}
        submitting={submitting}
        error={orderError}
        onPlaceOrder={handlePlaceOrder}
      />
      {unacknowledgedCancellation && !isOrderConfirmed && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 z-[70] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-lg"
        >
          <span><strong>Order #{unacknowledgedCancellation.orderNumber} was cancelled.</strong>{unacknowledgedCancellation.declineReason ? ` ${unacknowledgedCancellation.declineReason}` : ""}</span>
          <button
            type="button"
            onClick={() => dismissCancellation(unacknowledgedCancellation)}
            className="shrink-0 rounded-lg bg-red-900 px-4 py-2 text-xs font-bold text-white hover:bg-red-800"
          >
            Okay
          </button>
        </div>
      )}
      {isOrderConfirmed && lastOrder && lastOrderBelongsToCurrentSession && (
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
            bill={activeSession?.bill ?? null}
            staffCallBusy={staffCallBusy}
            staffCallStatus={staffCallStatus}
            staffCallError={staffCallError}
            onCallStaff={(type) => void handleCallStaff(type)}
            itemCount={lastOrder.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            )}
            paymentSettings={restaurant.paymentSettings}
            paymentBusy={paymentBusy}
            paymentError={paymentError}
            onUpdatePayment={handleUpdatePayment}
            onContinueBrowsing={() => {
              if (lastOrder.status.toLowerCase() === "cancelled") {
                dismissCancellation(lastOrder);
              } else {
                setIsOrderConfirmed(false);
              }
            }}
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
