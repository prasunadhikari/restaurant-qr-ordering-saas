import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Grid2X2,
  Menu,
  QrCode,
  Settings,
  ShoppingBag,
  Store,
  Table2,
  User,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { apiRequest } from "../services/api";
import type { Restaurant } from "../services/restaurantService";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId?: string;
}

interface UserResponse {
  success: boolean;
  data: {
    user: CurrentUser;
  };
}

function RestaurantLayout() {
  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: Grid2X2,
    },
    {
      label: "Orders",
      path: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      label: "Menu",
      path: "/dashboard/menu",
      icon: Store,
    },
    {
      label: "Tables",
      path: "/dashboard/tables",
      icon: Table2,
    },
    {
      label: "QR Codes",
      path: "/dashboard/qr",
      icon: QrCode,
    },
    {
      label: "Analytics",
      path: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        setError("");

        const [restaurantData, userData] =
          await Promise.all([
            apiRequest<{
              success: boolean;
              data: {
                restaurant: Restaurant;
              };
            }>("/restaurants/me", {
              method: "GET",
            }),
            apiRequest<UserResponse>("/users/me", {
              method: "GET",
            }),
          ]);

        setRestaurant(
          restaurantData.data.restaurant,
        );

        setUser(userData.data.user);
      } catch (err) {
        console.error(
          "Failed to load restaurant dashboard:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load restaurant information.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadRestaurantData();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) {
      return "R";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const isRestaurantOpen = () => {
    if (!restaurant?.openingHours?.open) {
      return false;
    }

    if (!restaurant.openingHours.close) {
      return false;
    }

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] =
      restaurant.openingHours.open
        .split(":")
        .map(Number);

    const [closeHour, closeMinute] =
      restaurant.openingHours.close
        .split(":")
        .map(Number);

    if (
      Number.isNaN(openHour) ||
      Number.isNaN(openMinute) ||
      Number.isNaN(closeHour) ||
      Number.isNaN(closeMinute)
    ) {
      return false;
    }

    const openMinutes =
      openHour * 60 + openMinute;

    const closeMinutes =
      closeHour * 60 + closeMinute;

    if (closeMinutes < openMinutes) {
      return (
        currentMinutes >= openMinutes ||
        currentMinutes <= closeMinutes
      );
    }

    return (
      currentMinutes >= openMinutes &&
      currentMinutes <= closeMinutes
    );
  };

  const restaurantName =
    restaurant?.name || "Restaurant";

  const restaurantAddress =
    restaurant?.address || "Restaurant location";

  const userName =
    user?.name || "Restaurant User";

  const userInitials = getInitials(userName);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:z-40 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm">
            R
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-black text-slate-900">
              Restaurant SaaS
            </p>

            <p className="text-[10px] font-medium text-slate-400">
              Management Portal
            </p>
          </div>
        </div>

        {/* Restaurant */}
        <div className="border-b border-slate-100 p-4">
          {loading ? (
            <div className="animate-pulse rounded-xl bg-slate-50 p-3">
              <div className="h-4 w-32 rounded bg-slate-200" />

              <div className="mt-2 h-3 w-24 rounded bg-slate-200" />

              <div className="mt-3 h-3 w-16 rounded bg-slate-200" />
            </div>
          ) : restaurant ? (
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
                    {getInitials(restaurant.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {restaurant.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {restaurantAddress}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    restaurant.status === "active" &&
                    isRestaurantOpen()
                      ? "bg-emerald-500"
                      : restaurant.status === "active"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                  }`}
                />

                <span
                  className={`text-xs font-semibold ${
                    restaurant.status !== "active"
                      ? "text-slate-500"
                      : isRestaurantOpen()
                        ? "text-emerald-600"
                        : "text-amber-600"
                  }`}
                >
                  {restaurant.status !== "active"
                    ? restaurant.status
                    : isRestaurantOpen()
                      ? "Open"
                      : "Closed"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-xs font-bold text-red-700">
                Restaurant unavailable
              </p>

              <p className="mt-1 text-[10px] leading-4 text-red-500">
                {error || "Unable to load restaurant."}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Management
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                      />
                    </span>

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

              <div className="flex-1">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />

                <div className="mt-2 h-2.5 w-16 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                {userInitials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {userName}
                </p>

                <p className="truncate text-[10px] font-medium capitalize text-slate-400">
                  {user?.role?.replaceAll("_", " ") ||
                    "Restaurant user"}
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Account options"
              >
                <User
                  size={15}
                  strokeWidth={1.8}
                />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu
                size={18}
                strokeWidth={1.8}
              />
            </button>

            <div className="min-w-0">
              <p className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
                Restaurant dashboard
              </p>

              <h1 className="truncate text-base font-black text-slate-950 sm:text-lg">
                {loading
                  ? "Loading..."
                  : restaurantName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Restaurant status */}
            {!loading && restaurant && (
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    restaurant.status === "active" &&
                    isRestaurantOpen()
                      ? "bg-emerald-500"
                      : restaurant.status === "active"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                  }`}
                />

                <span className="text-[10px] font-bold text-slate-600">
                  {restaurant.status !== "active"
                    ? restaurant.status
                    : isRestaurantOpen()
                      ? "Open"
                      : "Closed"}
                </span>
              </div>
            )}

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell
                size={17}
                strokeWidth={1.8}
              />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white"
              aria-label="Account"
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
              <p className="text-xs font-semibold text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RestaurantLayout;