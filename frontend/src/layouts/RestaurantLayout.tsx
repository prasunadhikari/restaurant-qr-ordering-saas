import { NavLink, Outlet } from "react-router-dom";

function RestaurantLayout() {
  const navigation = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: "▦",
    },
    {
      label: "Orders",
      path: "/dashboard/orders",
      icon: "🛎",
    },
    {
      label: "Menu",
      path: "/dashboard/menu",
      icon: "☷",
    },
    {
      label: "Tables",
      path: "/dashboard/tables",
      icon: "▤",
    },
    {
      label: "QR Codes",
      path: "/dashboard/qr",
      icon: "▣",
    },
    {
      label: "Analytics",
      path: "/dashboard/analytics",
      icon: "↗",
    },
    {
      label: "Settings",
      path: "/dashboard/settings",
      icon: "⚙",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
            R
          </div>

          <div className="ml-3">
            <p className="text-sm font-bold text-slate-900">
              Restaurant SaaS
            </p>

            <p className="text-xs text-slate-400">
              Management Portal
            </p>
          </div>
        </div>

        {/* Restaurant */}
        <div className="border-b border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-bold text-slate-900">
              Kathmandu Cafe
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Thamel, Kathmandu
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-medium text-emerald-600">
                Open
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              PA
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                Restaurant Owner
              </p>

              <p className="truncate text-xs text-slate-500">
                Admin
              </p>
            </div>

            <button
              type="button"
              className="text-lg text-slate-400 hover:text-slate-700"
              aria-label="Account options"
            >
              ⋮
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Restaurant Dashboard
            </p>

            <h1 className="text-lg font-bold text-slate-900">
              Kathmandu Cafe
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
            >
              🔔

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white"
              aria-label="Account"
            >
              PA
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RestaurantLayout;