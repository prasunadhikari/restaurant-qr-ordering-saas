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

const dailyRevenue: DailyRevenue[] = [
  { day: "Fri", revenue: 14200, orders: 19 },
  { day: "Sat", revenue: 18650, orders: 25 },
  { day: "Sun", revenue: 22400, orders: 31 },
  { day: "Mon", revenue: 15900, orders: 21 },
  { day: "Tue", revenue: 17100, orders: 23 },
  { day: "Wed", revenue: 19850, orders: 27 },
  { day: "Thu", revenue: 18450, orders: 24 },
];

const topDishes: TopDish[] = [
  {
    name: "Chicken Momo",
    category: "Momo",
    orders: 86,
    revenue: 13760,
  },
  {
    name: "Dal Bhat",
    category: "Nepali",
    orders: 64,
    revenue: 16640,
  },
  {
    name: "Chicken Chowmein",
    category: "Chowmein",
    orders: 51,
    revenue: 8160,
  },
  {
    name: "Chicken Sekuwa",
    category: "Nepali",
    orders: 43,
    revenue: 9460,
  },
  {
    name: "Masala Tea",
    category: "Drinks",
    orders: 72,
    revenue: 5760,
  },
];

const categoryPerformance = [
  {
    name: "Momo",
    orders: 142,
    revenue: 22480,
    percentage: 82,
  },
  {
    name: "Nepali",
    orders: 118,
    revenue: 28640,
    percentage: 68,
  },
  {
    name: "Chowmein",
    orders: 94,
    revenue: 15120,
    percentage: 55,
  },
  {
    name: "Drinks",
    orders: 86,
    revenue: 10320,
    percentage: 49,
  },
  {
    name: "Snacks",
    orders: 61,
    revenue: 9150,
    percentage: 35,
  },
];

const busyHours = [
  { time: "8 AM", orders: 8 },
  { time: "10 AM", orders: 12 },
  { time: "12 PM", orders: 21 },
  { time: "2 PM", orders: 17 },
  { time: "4 PM", orders: 9 },
  { time: "6 PM", orders: 24 },
  { time: "8 PM", orders: 29 },
  { time: "10 PM", orders: 14 },
];

function formatNPR(amount: number) {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

function AnalyticsPage() {
  const totalRevenue = useMemo(
    () =>
      dailyRevenue.reduce(
        (total, day) => total + day.revenue,
        0,
      ),
    [],
  );

  const totalOrders = useMemo(
    () =>
      dailyRevenue.reduce(
        (total, day) => total + day.orders,
        0,
      ),
    [],
  );

  const averageOrderValue =
    totalOrders > 0
      ? Math.round(totalRevenue / totalOrders)
      : 0;

  const maxRevenue = Math.max(
    ...dailyRevenue.map((day) => day.revenue),
  );

  const maxBusyOrders = Math.max(
    ...busyHours.map((hour) => hour.orders),
  );

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
          Last 7 days
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

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="success">
              +12.8%
            </Badge>

            <span className="text-xs text-slate-400">
              vs previous week
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

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="success">
              +9.4%
            </Badge>

            <span className="text-xs text-slate-400">
              vs previous week
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
            8 / 20
          </p>

          <div className="mt-3">
            <span className="text-xs text-emerald-600">
              40% table occupancy
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
              Daily revenue for the last seven days.
            </p>
          </div>

          <Badge variant="success">
            {formatNPR(totalRevenue)}
          </Badge>
        </div>

        <div className="mt-8">
          <div className="flex h-64 items-end gap-2 sm:gap-4">
            {dailyRevenue.map((day) => {
              const height =
                (day.revenue / maxRevenue) * 100;

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

          <Badge variant="warning">
            Peak: 8 PM
          </Badge>
        </div>

        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-[620px] items-end gap-3">
            {busyHours.map((hour) => {
              const height =
                (hour.orders / maxBusyOrders) * 100;

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
      </Card>

      {/* Summary */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <div className="mt-0.5 text-lg">
            💡
          </div>

          <div>
            <p className="text-sm font-bold text-emerald-900">
              Performance summary
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Kathmandu Cafe processed {totalOrders} orders
              and generated {formatNPR(totalRevenue)} in the
              last seven days. The busiest period is around
              dinner time, with 8 PM currently showing the
              highest order volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;