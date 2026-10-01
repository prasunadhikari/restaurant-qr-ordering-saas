import { Link } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

function AdminDashboardPage() {
  const revenueData = [
    { day: "Fri", value: 42 },
    { day: "Sat", value: 58 },
    { day: "Sun", value: 51 },
    { day: "Mon", value: 67 },
    { day: "Tue", value: 74 },
    { day: "Wed", value: 81 },
    { day: "Thu", value: 94 },
  ];

  const restaurants = [
    {
      name: "Kathmandu Cafe",
      location: "Thamel, Kathmandu",
      initials: "KC",
      plan: "Professional",
      status: "Active",
      orders: 284,
      revenue: "NPR 82,450",
    },
    {
      name: "Himalayan Bites",
      location: "Lazimpat, Kathmandu",
      initials: "HB",
      plan: "Starter",
      status: "Active",
      orders: 198,
      revenue: "NPR 61,280",
    },
    {
      name: "The Local Kitchen",
      location: "Patan, Lalitpur",
      initials: "LK",
      plan: "Professional",
      status: "Active",
      orders: 246,
      revenue: "NPR 74,620",
    },
    {
      name: "Momo House",
      location: "New Baneshwor",
      initials: "MH",
      plan: "Starter",
      status: "Pending",
      orders: 0,
      revenue: "NPR 0",
    },
  ];

  const orders = [
    {
      id: "KTM-2841",
      restaurant: "Kathmandu Cafe",
      table: "Table 08",
      amount: "NPR 1,850",
      status: "Preparing",
      time: "2 min ago",
    },
    {
      id: "HMB-1938",
      restaurant: "Himalayan Bites",
      table: "Table 04",
      amount: "NPR 1,240",
      status: "New",
      time: "5 min ago",
    },
    {
      id: "TLK-1842",
      restaurant: "The Local Kitchen",
      table: "Table 11",
      amount: "NPR 2,450",
      status: "Ready",
      time: "8 min ago",
    },
    {
      id: "EVG-3211",
      restaurant: "Everest Garden",
      table: "Table 16",
      amount: "NPR 980",
      status: "Served",
      time: "12 min ago",
    },
    {
      id: "THK-2741",
      restaurant: "Thakali Kitchen",
      table: "Table 03",
      amount: "NPR 1,620",
      status: "Preparing",
      time: "16 min ago",
    },
  ];

  const statusStyles: Record<string, "success" | "warning" | "info" | "default"> =
    {
      New: "info",
      Preparing: "warning",
      Ready: "success",
      Served: "default",
    };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              Platform overview
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Good evening, Admin.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor restaurants, orders, revenue and platform activity
            from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Today
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-800">
              October 1, 2026
            </p>
          </div>

          <Link
            to="/admin/restaurants"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
          >
            <span className="text-lg leading-none">+</span>
            Add restaurant
          </Link>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Restaurants */}
        <Card padding="none" hover>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Restaurants
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  18
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-bold text-emerald-700">
                    +3
                  </span>

                  <span className="text-xs text-slate-400">
                    this month
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                R
              </div>
            </div>

            <div className="mt-5 flex h-8 items-end gap-1">
              {[35, 48, 42, 56, 52, 70, 82, 76, 94].map(
                (height, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-sm ${
                      index === 8
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </Card>

        {/* Orders */}
        <Card padding="none" hover>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total orders
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  1,284
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-bold text-emerald-700">
                    +12.8%
                  </span>

                  <span className="text-xs text-slate-400">
                    vs last month
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
                ↗
              </div>
            </div>

            <div className="mt-5 h-8">
              <svg
                viewBox="0 0 220 40"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,32 28,27 55,30 82,20 110,24 138,13 166,17 193,7 220,4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-emerald-500"
                />

                <polyline
                  points="0,39 28,34 55,37 82,27 110,31 138,20 166,24 193,14 220,11 220,40 0,40"
                  fill="currentColor"
                  className="text-emerald-50"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card padding="none" hover>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Platform revenue
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  NPR 428K
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-bold text-emerald-700">
                    +18.4%
                  </span>

                  <span className="text-xs text-slate-400">
                    vs last month
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-lg">
                ₨
              </div>
            </div>

            <div className="mt-5 h-8">
              <div className="flex h-full items-end gap-1.5">
                {[35, 48, 40, 65, 56, 76, 64, 84, 94].map(
                  (height, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-sm ${
                        index === 8
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tables */}
        <Card padding="none" hover>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active tables
                </p>

                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  76
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-1.5 py-1 text-[11px] font-bold text-blue-700">
                    84%
                  </span>

                  <span className="text-xs text-slate-400">
                    utilization
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg">
                ▦
              </div>
            </div>

            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[84%] rounded-full bg-emerald-500" />
              </div>

              <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>0</span>
                <span>90 tables total</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Revenue + live activity */}
      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Revenue chart */}
        <Card padding="none">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-950">
                  Revenue overview
                </h3>

                <Badge variant="success">
                  +18.4%
                </Badge>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Platform revenue generated over the last 7 days
              </p>
            </div>

            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none"
              defaultValue="7"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-tight text-slate-950">
                  NPR 94K
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Thursday revenue
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-400">
                NPR thousands
              </p>
            </div>

            <div className="relative h-64">
              {/* Grid */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3"
                  >
                    <span className="w-8 text-right text-[10px] text-slate-400">
                      {value}
                    </span>

                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute bottom-0 left-11 right-0 top-0 flex items-end justify-between gap-3">
                {revenueData.map((item, index) => (
                  <div
                    key={item.day}
                    className="group flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="relative flex h-[calc(100%-28px)] items-end justify-center">
                      <div
                        className={`relative w-full max-w-12 rounded-t-xl transition-all duration-300 ${
                          index === revenueData.length - 1
                            ? "bg-emerald-500"
                            : "bg-slate-200 group-hover:bg-slate-300"
                        }`}
                        style={{
                          height: `${item.value}%`,
                        }}
                      >
                        <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[10px] font-bold text-white group-hover:block">
                          NPR {item.value}K
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                      {item.day}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Live activity */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-950">
                    Live activity
                  </h3>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Latest platform activity
                </p>
              </div>

              <button
                type="button"
                className="text-xs font-bold text-slate-400 transition hover:text-slate-900"
              >
                •••
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((order, index) => (
              <div
                key={order.id}
                className="flex gap-3 px-5 py-4"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                    {index + 1}
                  </div>

                  {index < 3 && (
                    <span className="absolute -bottom-4 left-1/2 h-4 w-px bg-slate-200" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Order #{order.id}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        {order.restaurant} · {order.table}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-bold text-slate-800">
                      {order.amount}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={statusStyles[order.status]}>
                      {order.status}
                    </Badge>

                    <span className="text-[10px] font-medium text-slate-400">
                      {order.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Restaurants + system health */}
      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Restaurants */}
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div>
              <h3 className="text-base font-black text-slate-950">
                Restaurant activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Recently active restaurants on the platform
              </p>
            </div>

            <Link
              to="/admin/restaurants"
              className="text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              View all
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Restaurant
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Orders
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Revenue
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.name}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black text-white">
                          {restaurant.initials}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {restaurant.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {restaurant.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-slate-600">
                        {restaurant.plan}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-xs font-bold text-slate-700">
                        {restaurant.orders.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-xs font-bold text-slate-700">
                        {restaurant.revenue}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Badge
                        variant={
                          restaurant.status === "Active"
                            ? "success"
                            : "warning"
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
                key={restaurant.name}
                className="p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black text-white">
                    {restaurant.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {restaurant.name}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                      {restaurant.location}
                    </p>
                  </div>

                  <Badge
                    variant={
                      restaurant.status === "Active"
                        ? "success"
                        : "warning"
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

                    <p className="mt-1 text-[10px] font-bold text-slate-700">
                      {restaurant.plan}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[9px] text-slate-400">
                      Orders
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-700">
                      {restaurant.orders}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[9px] text-slate-400">
                      Revenue
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-700">
                      {restaurant.revenue.replace(
                        "NPR ",
                        "",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System health */}
        <Card padding="none">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  System health
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Infrastructure status
                </p>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                name: "API Server",
                detail: "42ms response time",
                icon: "API",
              },
              {
                name: "Database",
                detail: "MongoDB cluster",
                icon: "DB",
              },
              {
                name: "Real-time",
                detail: "Socket.IO service",
                icon: "RT",
              },
              {
                name: "QR Service",
                detail: "QR generation service",
                icon: "QR",
              },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-black text-slate-600">
                  {service.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {service.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {service.detail}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-bold text-emerald-600">
                    Healthy
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold">
              Platform uptime
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-black">
                99.98%
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                Last 30 days
              </p>
            </div>

            <div className="mt-3 flex gap-1">
              {Array.from({ length: 30 }).map((_, index) => (
                <span
                  key={index}
                  className="h-5 flex-1 rounded-sm bg-emerald-500/80"
                />
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Bottom actions */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/restaurants"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
              R
            </div>

            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600">
              →
            </span>
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
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
              U
            </div>

            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600">
              →
            </span>
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
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
              $
            </div>

            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600">
              →
            </span>
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
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
              ⚙
            </div>

            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600">
              →
            </span>
          </div>

          <p className="mt-4 text-sm font-black text-slate-900">
            Platform settings
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Global configuration and system controls.
          </p>
        </Link>
      </section>
    </div>
  );
}

export default AdminDashboardPage;