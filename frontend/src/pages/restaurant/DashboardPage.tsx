import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Clock3,
  Coffee,
  QrCode,
  ShoppingBag,
  Sparkles,
  Table2,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Restaurant } from "../../services/restaurantService";
import { apiRequest } from "../../services/api";
import {
  getOrders,
  getRestaurantAnalytics,
} from "../../services/restaurantDashboardService";
import type {
  RestaurantAnalytics,
  RestaurantOrder,
} from "../../services/restaurantDashboardService";

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
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RestaurantOrder[]>([]);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const authToken =
          localStorage.getItem("ownerToken");

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

  useEffect(() => {
    void Promise.all([getRestaurantAnalytics(), getOrders()])
      .then(([summary, orders]) => {
        setAnalytics(summary);
        setRecentOrders(orders.slice(0, 4));
      })
      .catch((err: unknown) => {
        console.error("Failed to load restaurant dashboard metrics:", err);
        setError((current) => current || (err instanceof Error
          ? err.message
          : "Unable to load restaurant activity."));
      });
  }, []);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const restaurantInitials = restaurant
    ? restaurant.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("")
    : "A";

  return (
    <div className="min-h-full bg-[#f5f4ef]">
      <div className="mx-auto max-w-[1500px] space-y-7 px-1 pb-10">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="flex flex-col gap-5 rounded-[26px] border border-[#e9e4d8] bg-gradient-to-br from-white via-white to-[#faf4e8] p-6 shadow-[0_8px_30px_-24px_rgba(41,37,30,0.28)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#858476]">
              <span>{today}</span>

              <span className="h-1 w-1 rounded-full bg-[#d5a54a]" />

              <span className="text-[#b17b28]">Restaurant overview</span>
            </div>

            <h1 className="mt-3 text-[32px] font-bold tracking-[-0.045em] text-[#20251f] sm:text-[40px]">
              Good morning
              <span className="ml-2 text-[#d39a35]">✦</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#77786c]">
              Here's what's happening in your restaurant today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/qr"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e7e3d9] bg-white px-4 text-xs font-bold text-[#55584e] shadow-sm transition hover:border-[#d7c9ad] hover:bg-[#fffdf8]"
            >
              <QrCode size={16} strokeWidth={1.8} />
              QR codes
            </Link>

            <Link
              to="/dashboard/orders"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#244b3e] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#193b30]"
            >
              <ShoppingBag size={16} strokeWidth={1.8} />
              View orders
            </Link>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            RESTAURANT HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#193b30] text-white shadow-[0_18px_45px_-30px_rgba(25,59,48,0.8)]">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-white/[0.035] to-transparent lg:block" />

          <div className="relative flex flex-col justify-between gap-7 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex items-center gap-5">
              {restaurant?.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="h-[68px] w-[68px] rounded-[20px] object-cover ring-2 ring-white/15"
                />
              ) : (
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#f0c46f] text-lg font-black text-[#193b30] shadow-inner">
                  {restaurantInitials}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold tracking-tight">
                    {loading
                      ? "Loading restaurant..."
                      : restaurant?.name || "Your restaurant"}
                  </h2>

                  {restaurant && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {restaurant.status}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-white/60">
                  {restaurant?.address ||
                    "Your Aagan restaurant workspace"}
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/settings"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              Restaurant settings
              <ArrowUpRight
                size={14}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </section>

        {/* =====================================================
            PRIMARY METRICS
        ====================================================== */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Today's revenue"
            value={`₨ ${(analytics?.summary.todayRevenue || 0).toLocaleString()}`}
            helper="Sales recorded today"
            icon={<WalletCards size={18} strokeWidth={1.8} />}
            trend={analytics ? "Today" : "…"}
          />

          <MetricCard
            label="Today's orders"
            value={String(analytics?.summary.todayOrders ?? "—")}
            helper="Orders received today"
            icon={<ShoppingBag size={18} strokeWidth={1.8} />}
            trend={analytics ? "Today" : "…"}
          />

          <MetricCard
            label="Tables occupied"
            value={`${analytics?.summary.occupiedTables ?? "—"} / ${analytics?.summary.totalTables ?? "—"}`}
            helper="Occupied tables"
            icon={<Table2 size={18} strokeWidth={1.8} />}
            trend={analytics ? "Live" : "…"}
          />

          <MetricCard
            label="Pending orders"
            value={String(analytics?.summary.pendingOrders ?? "—")}
            helper="Waiting for attention"
            icon={<Clock3 size={18} strokeWidth={1.8} />}
            trend={analytics ? "Now" : "…"}
          />
        </section>

        {/* =====================================================
            MAIN DASHBOARD
        ====================================================== */}
        <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          {/* -------------------------------------------------
              ORDERS
          -------------------------------------------------- */}
          <div className="overflow-hidden rounded-[22px] border border-[#e8e5dc] bg-white shadow-[0_8px_30px_-24px_rgba(41,37,30,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#252920]">
                    Live orders
                  </h3>

                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f5eedf] px-1.5 text-[9px] font-bold text-[#9c712c]">
                    {analytics?.summary.pendingOrders ?? 0}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#858476]">
                  Orders from your dining tables.
                </p>
              </div>

              <Link
                to="/dashboard/orders"
                className="flex items-center gap-1 text-xs font-bold text-[#77786c] transition hover:text-[#244b3e]"
              >
                All orders
                <ChevronRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex min-h-[330px] items-center justify-center px-6 py-12">
                <EmptyOrders />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-sm font-bold text-[#252920]">Order {order.orderNumber}</p>
                      <p className="mt-1 text-xs text-[#858476]">Table {typeof order.tableId === "string" ? "—" : order.tableId.tableNumber} · {order.status}</p>
                    </div>
                    <p className="text-sm font-bold text-[#252920]">₨ {order.total.toLocaleString()}</p>
                  </div>
                ))}
                <div className="px-5 py-4 sm:px-6">
                  <Link to="/dashboard/orders" className="text-xs font-bold text-[#527160] hover:text-[#193b30]">Open order manager →</Link>
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              TABLES
          -------------------------------------------------- */}
          <div className="overflow-hidden rounded-[22px] border border-[#e8e5dc] bg-white shadow-[0_8px_30px_-24px_rgba(41,37,30,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <div>
                <h3 className="text-sm font-bold text-[#252920]">
                  Table activity
                </h3>

                <p className="mt-1 text-xs text-[#858476]">
                  Live floor overview.
                </p>
              </div>

              <Link
                to="/dashboard/tables"
                className="flex items-center gap-1 text-xs font-bold text-[#77786c] transition hover:text-[#244b3e]"
              >
                Manage
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-[#eee8db] bg-[#faf7ef] p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#858476]">
                      Occupancy
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-[#252920]">
                      {analytics?.summary.totalTables
                        ? `${analytics.summary.occupiedTables} / ${analytics.summary.totalTables}`
                        : "0"}
                    </p>

                    <p className="mt-1 text-xs text-[#858476]">
                      of {analytics?.summary.totalTables ?? 0} tables occupied
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#527160] shadow-sm">
                    <Table2
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e9e2d3]">
                  <div
                    className="h-full rounded-full bg-[#c48c36]"
                    style={{
                      width: `${analytics?.summary.totalTables
                        ? (analytics.summary.occupiedTables / analytics.summary.totalTables) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <SmallStat
                  label="Available"
                  value={String(analytics ? analytics.summary.totalTables - analytics.summary.occupiedTables : "—")}
                />

                <SmallStat
                  label="Occupied"
                  value={String(analytics?.summary.occupiedTables ?? "—")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECONDARY CONTENT
        ====================================================== */}
        <section className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          {/* Menu */}
          <Link
            to="/dashboard/menu"
            className="group rounded-[22px] border border-[#e8e5dc] bg-white p-5 shadow-[0_8px_30px_-26px_rgba(41,37,30,0.35)] transition hover:-translate-y-0.5 hover:border-[#d8c9a9] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6eedf] text-[#a4742d]">
                <UtensilsCrossed
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <ArrowUpRight
                size={17}
                className="text-[#c4c2b8] transition group-hover:text-[#527160]"
              />
            </div>

            <h3 className="mt-5 text-sm font-bold text-[#252920]">
              Menu management
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-[#858476]">
              Keep your digital menu, categories and dishes
              up to date.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#77786c]">
              Manage menu
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* QR */}
          <Link
            to="/dashboard/qr"
            className="group rounded-[22px] border border-[#e8e5dc] bg-white p-5 shadow-[0_8px_30px_-26px_rgba(41,37,30,0.35)] transition hover:-translate-y-0.5 hover:border-[#d8c9a9] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6eedf] text-[#a4742d]">
                <QrCode
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <ArrowUpRight
                size={17}
                className="text-[#c4c2b8] transition group-hover:text-[#527160]"
              />
            </div>

            <h3 className="mt-5 text-sm font-bold text-[#252920]">
              Table QR codes
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-[#858476]">
              Generate, download and manage QR codes for
              every dining table.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#77786c]">
              Manage QR codes
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Analytics */}
          <Link
            to="/dashboard/analytics"
            className="group rounded-[22px] border border-[#e8e5dc] bg-white p-5 shadow-[0_8px_30px_-26px_rgba(41,37,30,0.35)] transition hover:-translate-y-0.5 hover:border-[#d8c9a9] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6eedf] text-[#a4742d]">
                <BarChart3
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <ArrowUpRight
                size={17}
                className="text-[#c4c2b8] transition group-hover:text-[#527160]"
              />
            </div>

            <h3 className="mt-5 text-sm font-bold text-[#252920]">
              Restaurant analytics
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-[#858476]">
              Understand sales, popular dishes and restaurant
              performance.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#77786c]">
              View analytics
              <ChevronRight size={14} />
            </div>
          </Link>
        </section>

        {/* =====================================================
            AAGAN TIP
        ====================================================== */}
        <section className="overflow-hidden rounded-[22px] border border-[#ead9b7] bg-gradient-to-r from-[#fff8e9] to-[#fbf3df] shadow-[0_8px_30px_-26px_rgba(130,92,32,0.5)]">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3e2bc] text-[#a4742d]">
                <Sparkles
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a4742d]">
                  Aagan tip
                </p>

                <h3 className="mt-1 text-sm font-bold text-[#29251e]">
                  Get your restaurant ready for QR ordering
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#79694d]">
                  Add your menu, create your tables and print
                  QR codes before inviting your first guests.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/menu"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#244b3e] px-4 text-xs font-bold text-white transition hover:bg-[#193b30]"
            >
              Set up menu
              <ArrowUpRight
                size={14}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: React.ReactNode;
}

function MetricCard({
  label,
  value,
  helper,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-[20px] border border-[#e8e5dc] bg-white p-5 shadow-[0_8px_30px_-26px_rgba(41,37,30,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eee1] text-[#a4742d]">
          {icon}
        </div>

        <span className="rounded-full bg-[#f7f5ef] px-2 py-1 text-[9px] font-bold text-[#858476]">
          {trend}
        </span>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#858476]">
        {label}
      </p>

      <p className="mt-1.5 text-[28px] font-bold tracking-[-0.04em] text-[#252920]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#858476]">
        {helper}
      </p>
    </div>
  );
}

/* ============================================================
   SMALL STAT
============================================================ */

interface SmallStatProps {
  label: string;
  value: string;
}

function SmallStat({
  label,
  value,
}: SmallStatProps) {
  return (
    <div className="rounded-xl border border-[#eeeae0] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#858476]">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-[#252920]">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY ORDERS
============================================================ */

function EmptyOrders() {
  return (
    <div className="flex max-w-sm flex-col items-center text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#f4eee1] text-[#a4742d]">
        <ShoppingBag
          size={24}
          strokeWidth={1.6}
        />

        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#c48c36] shadow-sm">
          <Coffee
            size={10}
            strokeWidth={2}
          />
        </span>
      </div>

      <h4 className="mt-5 text-sm font-bold text-[#252920]">
        Your orders will appear here
      </h4>

      <p className="mt-2 text-xs leading-5 text-[#858476]">
        Once guests scan a table QR and place an order,
        you'll be able to manage everything from this screen.
      </p>

      <Link
        to="/dashboard/qr"
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#527160] transition hover:text-[#193b30]"
      >
        Set up table QR
        <ArrowUpRight
          size={14}
          strokeWidth={1.8}
        />
      </Link>
    </div>
  );
}

export default DashboardPage;