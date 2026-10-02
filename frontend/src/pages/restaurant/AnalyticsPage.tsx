import { useMemo } from "react";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

type DailyRevenue = {
  day: string;
  revenue: number;
  orders: number;
};

type TopDish = {
  name: string;
  category: string;
  orders: number;
  revenue: number;
};

type CategoryPerformance = {
  name: string;
  orders: number;
  revenue: number;
  percentage: number;
};

type BusyHour = {
  time: string;
  orders: number;
};

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

function AnalyticsPage() {
  // Real analytics will come from the backend.
  const dailyRevenue: DailyRevenue[] = [];
  const topDishes: TopDish[] = [];
  const categoryPerformance: CategoryPerformance[] = [];
  const busyHours: BusyHour[] = [];

  const totalRevenue = useMemo(
    () =>
      dailyRevenue.reduce(
        (total, day) => total + day.revenue,
        0,
      ),
    [dailyRevenue],
  );

  const totalOrders = useMemo(
    () =>
      dailyRevenue.reduce(
        (total, day) => total + day.orders,
        0,
      ),
    [dailyRevenue],
  );

  const averageOrderValue =
    totalOrders > 0
      ? Math.round(totalRevenue / totalOrders)
      : 0;

  const maxRevenue =
    dailyRevenue.length > 0
      ? Math.max(
          ...dailyRevenue.map((day) => day.revenue),
        )
      : 0;

  const maxBusyOrders =
    busyHours.length > 0
      ? Math.max(
          ...busyHours.map((hour) => hour.orders),
        )
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Business performance
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Analytics
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Track restaurant sales, orders, popular dishes,
            and customer activity.
          </p>
        </div>

        <Badge variant="info">
          Waiting for data
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">
            Total revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNPR(totalRevenue)}
          </p>

          <div className="mt-3">
            <span className="text-xs text-slate-400">
              No revenue data yet
            </span>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">
            Total orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalOrders}
          </p>

          <div className="mt-3">
            <span className="text-xs text-slate-400">
              No order data yet
            </span>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">
            Average order
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNPR(averageOrderValue)}
          </p>

          <div className="mt-3">
            <span className="text-xs text-slate-400">
              Revenue per order
            </span>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">
            Active tables
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            —
          </p>

          <div className="mt-3">
            <span className="text-xs text-slate-400">
              Table data not connected
            </span>
          </div>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Revenue overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Daily revenue will appear here once order data is
              connected.
            </p>
          </div>

          <Badge variant="default">
            {formatNPR(totalRevenue)}
          </Badge>
        </div>

        {dailyRevenue.length === 0 ? (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="px-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                ↗
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                No revenue data yet
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                Revenue charts will be populated from completed
                restaurant orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {dailyRevenue.map((day) => {
                const height =
                  maxRevenue > 0
                    ? (day.revenue / maxRevenue) * 100
                    : 0;

                return (
                  <div
                    key={day.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                  >
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="group relative w-full rounded-t-xl bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                        style={{
                          height: `${height}%`,
                          minHeight: "18px",
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white group-hover:block">
                          {formatNPR(day.revenue)}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-600">
                        {day.day}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {day.orders} orders
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Top dishes + category performance */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top dishes */}
        <Card padding="none">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-slate-900">
              Top-selling dishes
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Most ordered menu items.
            </p>
          </div>

          {topDishes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No dish data yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Popular dishes will appear after orders are
                connected.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topDishes.map((dish, index) => (
                <div
                  key={dish.name}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {dish.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {dish.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {dish.orders} orders
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatNPR(dish.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Category performance */}
        <Card>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Category performance
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sales performance by menu category.
            </p>
          </div>

          {categoryPerformance.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No category data yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Category performance will be calculated from
                completed orders.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {categoryPerformance.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {category.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {category.orders} orders
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {formatNPR(category.revenue)}
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Busy hours */}
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Busy hours
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Order volume throughout the day.
            </p>
          </div>

          <Badge variant="default">
            No peak data
          </Badge>
        </div>

        {busyHours.length === 0 ? (
          <div className="mt-8 flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="px-6 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No order activity yet
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                Busy-hour analytics will be calculated from
                real order timestamps.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-[620px] items-end gap-3">
              {busyHours.map((hour) => {
                const height =
                  maxBusyOrders > 0
                    ? (hour.orders / maxBusyOrders) * 100
                    : 0;

                return (
                  <div
                    key={hour.time}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="relative flex h-48 w-full items-end">
                      <div
                        className="group relative w-full rounded-t-lg bg-slate-200 transition-all duration-300 hover:bg-emerald-500"
                        style={{
                          height: `${height}%`,
                          minHeight: "12px",
                        }}
                      >
                        <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white group-hover:block">
                          {hour.orders}
                        </span>
                      </div>
                    </div>

                    <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                      {hour.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Backend connection note */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
            i
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Analytics data is not connected yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              This page is now free of demo revenue, order,
              dish, category, and busy-hour data. Analytics will
              be calculated from real MongoDB orders and tables
              once the backend ordering system is implemented.
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Planned API: GET /api/analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;