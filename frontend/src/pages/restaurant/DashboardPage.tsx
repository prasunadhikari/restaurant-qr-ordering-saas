import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

function DashboardPage() {
  const stats = [
    {
      label: "Today's orders",
      value: "24",
      change: "+12%",
      description: "vs yesterday",
      icon: "🛎",
    },
    {
      label: "Today's revenue",
      value: "NPR 18,450",
      change: "+8.4%",
      description: "vs yesterday",
      icon: "💰",
    },
    {
      label: "Active tables",
      value: "8 / 20",
      change: "40%",
      description: "currently occupied",
      icon: "▤",
    },
    {
      label: "Pending orders",
      value: "5",
      change: "Needs attention",
      description: "waiting to be prepared",
      icon: "⏱",
    },
  ];

  const recentOrders = [
    {
      order: "#KTM-1042",
      table: "Table 08",
      items: "2 items",
      total: "NPR 580",
      status: "Preparing",
      time: "2 min ago",
    },
    {
      order: "#KTM-1041",
      table: "Table 03",
      items: "4 items",
      total: "NPR 1,240",
      status: "Ready",
      time: "5 min ago",
    },
    {
      order: "#KTM-1040",
      table: "Table 12",
      items: "3 items",
      total: "NPR 890",
      status: "New",
      time: "8 min ago",
    },
    {
      order: "#KTM-1039",
      table: "Table 05",
      items: "5 items",
      total: "NPR 1,560",
      status: "Served",
      time: "14 min ago",
    },
  ];

  const quickActions = [
    {
      title: "Manage menu",
      description: "Add or update food items",
      icon: "☷",
    },
    {
      title: "Manage tables",
      description: "Create tables and QR codes",
      icon: "▤",
    },
    {
      title: "View orders",
      description: "Manage active orders",
      icon: "🛎",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm text-slate-500">
          Thursday, October 1, 2026
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Good evening 👋
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening at your restaurant today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-600">
                    {stat.change}
                  </span>

                  <span className="text-xs text-slate-400">
                    {stat.description}
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent orders */}
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Recent orders
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Latest activity from your tables
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div
                key={order.order}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                    {order.order.slice(-2)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {order.order}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {order.table} · {order.items} · {order.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-sm font-bold text-slate-900">
                    {order.total}
                  </span>

                  <Badge
                    variant={
                      order.status === "New"
                        ? "info"
                        : order.status === "Preparing"
                          ? "warning"
                          : order.status === "Ready"
                            ? "success"
                            : "default"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card padding="md">
          <div>
            <h3 className="font-bold text-slate-900">
              Quick actions
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Common restaurant tasks
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  {action.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {action.title}
                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">
                    {action.description}
                  </span>
                </span>

                <span className="text-slate-300">
                  →
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Table overview */}
      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              Table overview
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Current table activity
            </p>
          </div>

          <span className="text-sm font-semibold text-slate-500">
            8 occupied · 12 available
          </span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-10">
          {Array.from({ length: 20 }, (_, index) => {
            const tableNumber = index + 1;
            const occupied = [
              2,
              3,
              5,
              8,
              9,
              12,
              15,
              18,
            ].includes(tableNumber);

            return (
              <div
                key={tableNumber}
                className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-bold ${
                  occupied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {String(tableNumber).padStart(2, "0")}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Occupied
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Available
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;