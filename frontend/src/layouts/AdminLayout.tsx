import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    const pathname = location.pathname;

    if (pathname === "/admin") {
      return "Dashboard";
    }

    if (pathname.startsWith("/admin/restaurants")) {
      return "Restaurants";
    }

    if (pathname.startsWith("/admin/users")) {
      return "Users";
    }

    if (pathname.startsWith("/admin/orders")) {
      return "Orders";
    }

    if (pathname.startsWith("/admin/subscriptions")) {
      return "Subscriptions";
    }

    if (pathname.startsWith("/admin/payments")) {
      return "Payments";
    }

    if (pathname.startsWith("/admin/analytics")) {
      return "Analytics";
    }

    if (pathname.startsWith("/admin/health")) {
      return "Platform Health";
    }

    if (pathname.startsWith("/admin/settings")) {
      return "Settings";
    }

    return "Admin";
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() =>
          setCollapsed((value) => !value)
        }
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} strokeWidth={1.8} />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
                  Platform administration
                </p>

                <h1 className="truncate text-[16px] font-bold tracking-tight text-slate-950 sm:mt-0.5 sm:text-[18px]">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] font-bold text-emerald-700">
                  Operational
                </span>
              </div>

              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell size={17} strokeWidth={1.8} />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white transition hover:bg-slate-800"
                aria-label="Admin profile"
              >
                PA
              </button>
            </div>
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

export default AdminLayout;