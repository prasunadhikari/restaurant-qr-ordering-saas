import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  QrCode,
  ShoppingBag,
  Store,
  Table2,
} from "lucide-react";
import { Link } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import type { Restaurant } from "../../services/restaurantService";
import { apiRequest } from "../../services/api";

interface RestaurantResponse {
  success: boolean;
  data: {
    restaurant: Restaurant;
  };
}

function DashboardPage() {
  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem(
          "restaurantToken",
        );

        const adminToken = localStorage.getItem(
          "adminToken",
        );

        const authToken = token || adminToken;

        if (!authToken) {
          throw new Error(
            "Authentication required. Please log in again.",
          );
        }

        const response =
          await apiRequest<RestaurantResponse>(
            "/restaurants/me",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          );

        setRestaurant(response.data.restaurant);
      } catch (err) {
        console.error(
          "Failed to load restaurant:",
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

    void loadRestaurant();
  }, []);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const quickActions = [
    {
      title: "Manage menu",
      description: "Add or update food items",
      icon: Store,
      path: "/dashboard/menu",
    },
    {
      title: "Manage tables",
      description: "Create tables and QR codes",
      icon: Table2,
      path: "/dashboard/tables",
    },
    {
      title: "View orders",
      description: "Manage active restaurant orders",
      icon: ShoppingBag,
      path: "/dashboard/orders",
    },
    {
      title: "QR codes",
      description: "View and manage table QR codes",
      icon: QrCode,
      path: "/dashboard/qr",
    },
  ];

  const stats = [
    {
      label: "Today's orders",
      value: "—",
      description:
        "Order data will appear here once ordering is connected.",
      icon: ShoppingBag,
    },
    {
      label: "Today's revenue",
      value: "—",
      description:
        "Revenue data will appear here once orders are connected.",
      icon: "₨",
    },
    {
      label: "Active tables",
      value: "—",
      description:
        "Table activity will appear here once tables are connected.",
      icon: Table2,
    },
    {
      label: "Pending orders",
      value: "—",
      description:
        "Pending orders will appear here in real time.",
      icon: Clock3,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          PAGE HEADING
      ====================================================== */}
      <div>
        <p className="text-xs font-medium text-slate-400">
          {today}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          {loading
            ? "Restaurant overview"
            : restaurant
              ? `Welcome back 👋`
              : "Restaurant overview"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {restaurant
            ? `Here's what's happening at ${restaurant.name}.`
            : "Manage your restaurant operations from one place."}
        </p>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          RESTAURANT STATUS
      ====================================================== */}
      {!loading && restaurant && (
        <Card padding="none">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                  {restaurant.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) =>
                      word[0]?.toUpperCase(),
                    )
                    .join("")}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-black text-slate-900">
                    {restaurant.name}
                  </h3>

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

                <p className="mt-1 truncate text-xs text-slate-400">
                  {restaurant.address ||
                    "No restaurant address added"}
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/settings"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Restaurant settings
              <ArrowRight
                size={13}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </Card>
      )}

      {/* =====================================================
          STATISTICS
      ====================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  {typeof Icon === "string" ? (
                    <span className="text-base font-black">
                      {Icon}
                    </span>
                  ) : (
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}
                </div>
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-400">
                {stat.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* =====================================================
          ORDERS + QUICK ACTIONS
      ====================================================== */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Orders */}
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <h3 className="text-sm font-black text-slate-950">
                Recent orders
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Latest activity from your restaurant tables.
              </p>
            </div>

            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              View all
              <ArrowRight
                size={13}
                strokeWidth={1.8}
              />
            </Link>
          </div>

          <div className="flex min-h-[270px] items-center justify-center px-6 py-10">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <ShoppingBag
                  size={22}
                  strokeWidth={1.7}
                />
              </div>

              <h4 className="mt-4 text-sm font-black text-slate-800">
                No orders to display
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Orders will appear here automatically after
                the customer ordering and order management
                APIs are connected.
              </p>

              <Link
                to="/dashboard/orders"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Open orders
                <ArrowRight
                  size={13}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick actions */}
        <Card padding="md">
          <div>
            <h3 className="text-sm font-black text-slate-950">
              Quick actions
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Common restaurant tasks.
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.path}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-emerald-600">
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-900">
                      {action.title}
                    </span>

                    <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                      {action.description}
                    </span>
                  </span>

                  <ArrowRight
                    size={14}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
                    strokeWidth={1.8}
                  />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* =====================================================
          OPERATIONS OVERVIEW
      ====================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Table system */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Table2
                  size={17}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-950">
                  Table overview
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Current restaurant table activity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[220px] items-center justify-center px-6 py-10">
            <div className="max-w-sm text-center">
              <p className="text-2xl font-black text-slate-300">
                —
              </p>

              <h4 className="mt-2 text-sm font-black text-slate-800">
                Table data is not connected yet
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Once the Table model and API are connected,
                occupied and available tables will be shown
                here.
              </p>

              <Link
                to="/dashboard/tables"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Manage tables
                <ArrowRight
                  size={13}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </Card>

        {/* Analytics */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <BarChart3
                  size={17}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-950">
                  Analytics
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Restaurant performance insights.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[220px] items-center justify-center px-6 py-10">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Activity
                  size={20}
                  strokeWidth={1.7}
                />
              </div>

              <h4 className="mt-4 text-sm font-black text-slate-800">
                Analytics will appear here
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Revenue, orders, popular items and table
                performance will be calculated from real
                restaurant data.
              </p>

              <Link
                to="/dashboard/analytics"
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Open analytics
                <ArrowRight
                  size={13}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;