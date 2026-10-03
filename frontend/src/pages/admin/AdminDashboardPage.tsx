import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Database,
  QrCode,
  Radio,
  RefreshCw,
  Server,
  Settings,
  Store,
  Users,
  X,
} from "lucide-react";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import {
  getAllRestaurants,
  type Restaurant,
} from "../../services/restaurantService";
import { apiRequest } from "../../services/api";

interface CreateRestaurantForm {
  name: string;
  slug: string;
  phone: string;
  address: string;
  plan: "starter" | "professional" | "custom";
  openingHours: {
    open: string;
    close: string;
  };
}

function AdminDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loadingRestaurants, setLoadingRestaurants] =
    useState(true);

  const [restaurantError, setRestaurantError] =
    useState("");

  const [showAddRestaurant, setShowAddRestaurant] =
    useState(false);

  const [creatingRestaurant, setCreatingRestaurant] =
    useState(false);

  const [createError, setCreateError] = useState("");

  const [createSuccess, setCreateSuccess] =
    useState("");

  const [form, setForm] =
    useState<CreateRestaurantForm>({
      name: "",
      slug: "",
      phone: "",
      address: "",
      plan: "starter",
      openingHours: {
        open: "09:00",
        close: "22:00",
      },
    });

  const loadRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      setRestaurantError("");

      const data = await getAllRestaurants();

      setRestaurants(data);
    } catch (error) {
      console.error(
        "Failed to load dashboard restaurants:",
        error,
      );

      setRestaurantError(
        error instanceof Error
          ? error.message
          : "Unable to load restaurants.",
      );
    } finally {
      setLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    void loadRestaurants();
  }, []);

  const activeRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === "active",
  ).length;

  const pendingRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === "pending",
  ).length;

  const suspendedRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === "suspended",
  ).length;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleRestaurantNameChange = (
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleCreateRestaurant = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    if (!form.name.trim()) {
      setCreateError("Restaurant name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setCreateError("Restaurant slug is required.");
      return;
    }

    try {
      setCreatingRestaurant(true);

      const adminToken =
        localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error(
          "Admin session expired. Please log in again.",
        );
      }

      await apiRequest("/restaurants/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          plan: form.plan,
          openingHours: form.openingHours,
        }),
      });

      setCreateSuccess(
        "Restaurant created successfully.",
      );

      setForm({
        name: "",
        slug: "",
        phone: "",
        address: "",
        plan: "starter",
        openingHours: {
          open: "09:00",
          close: "22:00",
        },
      });

      await loadRestaurants();

      setTimeout(() => {
        setShowAddRestaurant(false);
        setCreateSuccess("");
      }, 900);
    } catch (error) {
      console.error(
        "Failed to create restaurant:",
        error,
      );

      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create restaurant.",
      );
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const closeAddRestaurant = () => {
    if (creatingRestaurant) {
      return;
    }

    setShowAddRestaurant(false);
    setCreateError("");
    setCreateSuccess("");

    setForm({
      name: "",
      slug: "",
      phone: "",
      address: "",
      plan: "starter",
      openingHours: {
        open: "09:00",
        close: "22:00",
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              Platform overview
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Good morning, Admin.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your restaurant network and monitor the
            platform from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Today
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddRestaurant(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <span className="text-lg leading-none">+</span>
            Add restaurant
          </button>
        </div>
      </section>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Restaurants */}
        <Card padding="none">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Restaurants
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {loadingRestaurants
                    ? "—"
                    : restaurants.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Store size={18} strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Active
                </p>

                <p className="mt-0.5 text-xs font-black text-emerald-600">
                  {loadingRestaurants
                    ? "—"
                    : activeRestaurants}
                </p>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Pending
                </p>

                <p className="mt-0.5 text-xs font-black text-slate-700">
                  {loadingRestaurants
                    ? "—"
                    : pendingRestaurants}
                </p>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Suspended
                </p>

                <p className="mt-0.5 text-xs font-black text-slate-700">
                  {loadingRestaurants
                    ? "—"
                    : suspendedRestaurants}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Orders */}
        <Card padding="none">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Total orders
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Activity size={18} strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-400">
                Order analytics will appear once the order
                system is connected.
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card padding="none">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Platform revenue
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <span className="text-base font-black">
                  ₨
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-400">
                Revenue analytics will appear once billing is
                connected.
              </p>
            </div>
          </div>
        </Card>

        {/* Tables */}
        <Card padding="none">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Active tables
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  —
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <QrCode size={18} strokeWidth={1.8} />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-400">
                Table analytics will appear once table
                management is connected.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* =====================================================
          REVENUE / ACTIVITY
      ====================================================== */}
      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        {/* Revenue */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Revenue overview
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Revenue performance across the platform.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                Awaiting data
              </span>
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Activity size={23} strokeWidth={1.7} />
              </div>

              <h4 className="mt-4 text-sm font-black text-slate-800">
                Revenue analytics are not available yet
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                The chart will automatically use real order and
                billing data after those backend modules are
                implemented.
              </p>
            </div>
          </div>
        </Card>

        {/* Activity */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Live activity
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Real-time platform events.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Offline
              </span>
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center px-6 py-10">
            <div className="max-w-xs text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Radio size={22} strokeWidth={1.7} />
              </div>

              <h4 className="mt-4 text-sm font-black text-slate-800">
                No live activity
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Live order events will appear here when the
                Socket.IO real-time system is connected.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4">
            <Link
              to="/admin/orders"
              className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              View all orders
            </Link>
          </div>
        </Card>
      </section>

      {/* =====================================================
          RESTAURANTS / SYSTEM
      ====================================================== */}
      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        {/* Restaurants */}
        <Card padding="none">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-base font-black text-slate-950">
                Restaurants
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Live restaurant accounts from MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadRestaurants()}
                disabled={loadingRestaurants}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh restaurants"
                title="Refresh restaurants"
              >
                <RefreshCw
                  size={14}
                  strokeWidth={1.8}
                  className={
                    loadingRestaurants
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <Link
                to="/admin/restaurants"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
              >
                View all
                <ArrowUpRight
                  size={13}
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>

          {restaurantError && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-3 sm:px-6">
              <p className="text-xs font-medium text-red-700">
                {restaurantError}
              </p>
            </div>
          )}

          {loadingRestaurants ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={22}
                  className="mx-auto animate-spin text-slate-300"
                  strokeWidth={1.8}
                />

                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Loading restaurants...
                </p>
              </div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center px-6 py-10">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Store size={23} strokeWidth={1.7} />
                </div>

                <h4 className="mt-4 text-sm font-black text-slate-800">
                  No restaurants yet
                </h4>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Restaurants created through the platform will
                  appear here automatically.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddRestaurant(true)
                  }
                  className="mt-4 inline-flex h-9 items-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  Add restaurant
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Restaurant
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Plan
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Joined
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Orders
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {restaurants.map((restaurant) => (
                      <tr
                        key={restaurant._id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
                              {getInitials(
                                restaurant.name,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {restaurant.name}
                              </p>

                              <p className="mt-1 truncate text-[10px] text-slate-400">
                                {restaurant.address ||
                                  "No address provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold capitalize text-slate-600">
                            {restaurant.plan}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-500">
                            {formatDate(
                              restaurant.createdAt,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-xs font-medium text-slate-400">
                            —
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Badge
                            variant={
                              restaurant.status ===
                              "active"
                                ? "success"
                                : restaurant.status ===
                                    "pending"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {restaurant.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white">
                        {getInitials(restaurant.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {restaurant.name}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-400">
                          {restaurant.address ||
                            "No address provided"}
                        </p>
                      </div>

                      <Badge
                        variant={
                          restaurant.status === "active"
                            ? "success"
                            : restaurant.status === "pending"
                              ? "warning"
                              : "default"
                        }
                      >
                        {restaurant.status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[9px] text-slate-400">
                          Plan
                        </p>

                        <p className="mt-1 text-[10px] font-bold capitalize text-slate-700">
                          {restaurant.plan}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[9px] text-slate-400">
                          Joined
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-700">
                          {formatDate(
                            restaurant.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[9px] text-slate-400">
                          Orders
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          —
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* System health */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  System health
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Current platform services.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
          </div>

          <div className="space-y-2.5 p-5 sm:p-6">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Server size={15} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  API Server
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Application API
                </p>
              </div>

              <span className="text-[10px] font-bold text-emerald-600">
                Connected
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Database size={15} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Database
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  MongoDB
                </p>
              </div>

              <span className="text-[10px] font-bold text-emerald-600">
                Connected
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Radio size={15} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Real-time
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Socket.IO
                </p>
              </div>

              <span className="text-[10px] font-bold text-slate-400">
                Pending
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <QrCode size={15} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  QR Service
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  QR generation
                </p>
              </div>

              <span className="text-[10px] font-bold text-slate-400">
                Pending
              </span>
            </div>
          </div>

          <div className="mx-5 mb-5 rounded-xl bg-slate-950 p-5 text-white sm:mx-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">
                Platform environment
              </p>

              <span className="rounded-md bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                Development
              </span>
            </div>

            <p className="mt-3 text-sm font-bold">
              Free infrastructure
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Production monitoring and uptime tracking will
              be added before deployment.
            </p>
          </div>
        </Card>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-black text-slate-950">
            Quick actions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Jump directly into platform management.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/restaurants"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Store size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300 transition group-hover:text-emerald-600"
                strokeWidth={1.8}
              />
            </div>

            <p className="mt-4 text-sm font-black text-slate-900">
              Manage restaurants
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Accounts, plans and restaurant status.
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Users size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300 transition group-hover:text-emerald-600"
                strokeWidth={1.8}
              />
            </div>

            <p className="mt-4 text-sm font-black text-slate-900">
              Manage users
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Owners, staff and platform administrators.
            </p>
          </Link>

          <Link
            to="/admin/subscriptions"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <span className="text-sm font-black">
                  ₨
                </span>
              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300 transition group-hover:text-emerald-600"
                strokeWidth={1.8}
              />
            </div>

            <p className="mt-4 text-sm font-black text-slate-900">
              Subscriptions
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Plans, renewals and subscription status.
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Settings size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={16}
                className="text-slate-300 transition group-hover:text-emerald-600"
                strokeWidth={1.8}
              />
            </div>

            <p className="mt-4 text-sm font-black text-slate-900">
              Platform settings
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Global configuration and system controls.
            </p>
          </Link>
        </div>
      </section>

      {/* =====================================================
          ADD RESTAURANT MODAL
      ====================================================== */}
      {showAddRestaurant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeAddRestaurant}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Store
                      size={18}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      Add restaurant
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a new restaurant account on Aagan.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddRestaurant}
                disabled={creatingRestaurant}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateRestaurant}
              className="p-5 sm:p-6"
            >
              {createError && (
                <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700">
                    {createError}
                  </p>
                </div>
              )}

              {createSuccess && (
                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-700">
                    {createSuccess}
                  </p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="restaurant-name"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Restaurant name
                  </label>

                  <input
                    id="restaurant-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleRestaurantNameChange(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Himalayan Brew Cafe"
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* Slug */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="restaurant-slug"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Restaurant slug
                  </label>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
                    <span className="border-r border-slate-100 px-3 text-xs text-slate-400">
                      /r/
                    </span>

                    <input
                      id="restaurant-slug"
                      type="text"
                      value={form.slug}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          slug: generateSlug(
                            event.target.value,
                          ),
                        }))
                      }
                      placeholder="himalayan-brew-cafe"
                      disabled={creatingRestaurant}
                      className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 disabled:bg-slate-50"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Used in the restaurant's public menu URL.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="restaurant-phone"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Phone
                  </label>

                  <input
                    id="restaurant-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="98XXXXXXXX"
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* Plan */}
                <div>
                  <label
                    htmlFor="restaurant-plan"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Plan
                  </label>

                  <select
                    id="restaurant-plan"
                    value={form.plan}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        plan: event.target
                          .value as CreateRestaurantForm["plan"],
                      }))
                    }
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium capitalize text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  >
                    <option value="starter">
                      Starter
                    </option>

                    <option value="professional">
                      Professional
                    </option>

                    <option value="custom">
                      Custom
                    </option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="restaurant-address"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Address
                  </label>

                  <input
                    id="restaurant-address"
                    type="text"
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="e.g. Thamel, Kathmandu"
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* Opening */}
                <div>
                  <label
                    htmlFor="restaurant-open"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Opening time
                  </label>

                  <input
                    id="restaurant-open"
                    type="time"
                    value={form.openingHours.open}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        openingHours: {
                          ...current.openingHours,
                          open: event.target.value,
                        },
                      }))
                    }
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* Closing */}
                <div>
                  <label
                    htmlFor="restaurant-close"
                    className="mb-2 block text-xs font-bold text-slate-700"
                  >
                    Closing time
                  </label>

                  <input
                    id="restaurant-close"
                    type="time"
                    value={form.openingHours.close}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        openingHours: {
                          ...current.openingHours,
                          close: event.target.value,
                        },
                      }))
                    }
                    disabled={creatingRestaurant}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] leading-5 text-slate-500">
                  The restaurant will be created as an active
                  Aagan restaurant. An owner account can be
                  assigned later through restaurant onboarding.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddRestaurant}
                  disabled={creatingRestaurant}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingRestaurant}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingRestaurant ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    "Create restaurant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;