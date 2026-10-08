import { LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import { apiRequest } from "../services/api";
import { clearAdminSession } from "../services/authSession";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminProfileResponse {
  success: boolean;
  data: { user: AdminProfile };
}

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(() => {
    const saved = localStorage.getItem("adminUser");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AdminProfile;
    } catch {
      localStorage.removeItem("adminUser");
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    apiRequest<AdminProfileResponse>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!active || response.data.user.role !== "platform_admin") return;
        setProfile(response.data.user);
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      })
      .catch((error: unknown) => {
        console.error("Failed to load admin profile:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    clearAdminSession();
    navigate("/signin", { replace: true });
  };

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

    if (pathname.startsWith("/admin/settings")) {
      return "Settings";
    }

    return "Admin";
  };

  return (
    <div className="portal-shell min-h-screen">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        adminName={profile?.name || "Platform Admin"}
        onLogout={logout}
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
        <header className="portal-header sticky top-0 z-30 h-[72px] border-b">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="portal-control flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
              >
                <Menu size={18} strokeWidth={1.8} />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
                  Platform administration
                </p>

                <h1 className="portal-header-title truncate text-[16px] font-bold sm:mt-0.5 sm:text-[18px]">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="portal-workspace-chip hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] font-bold text-slate-600">
                  Admin workspace
                </span>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-slate-800">{profile?.name || "Platform Admin"}</p>
                <p className="text-[10px] text-slate-500">{profile?.email || "Administrator"}</p>
              </div>
              <span className="portal-avatar hidden h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white sm:flex">
                {profile?.name?.slice(0, 1).toUpperCase() || "A"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="portal-control inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                aria-label="Sign out of admin"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
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