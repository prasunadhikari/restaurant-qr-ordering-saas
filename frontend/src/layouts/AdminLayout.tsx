import { LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import { apiRequest } from "../services/api";
import { clearPortalSessions } from "../services/authSession";

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
    clearPortalSessions();
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
    <div className="min-h-screen bg-[#f6f7f9]">
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
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] font-bold text-slate-600">
                  Admin workspace
                </span>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-slate-800">{profile?.name || "Platform Admin"}</p>
                <p className="text-[10px] text-slate-500">{profile?.email || "Administrator"}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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