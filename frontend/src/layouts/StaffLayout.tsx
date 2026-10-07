import { useEffect, useState } from "react";
import { ClipboardList, LayoutDashboard, LogOut, Utensils } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getStaffProfile, type StaffProfile } from "../services/staffService";

function StaffLayout() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getStaffProfile()
      .then((data) => {
        if (active) {
          setProfile(data);
          localStorage.setItem("staffUser", JSON.stringify(data.user));
          localStorage.setItem("staffRestaurant", JSON.stringify(data.restaurant));
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error("Failed to load staff profile:", cause);
        setError(cause instanceof Error ? cause.message : "Unable to load staff profile.");
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staffUser");
        localStorage.removeItem("staffRestaurant");
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");
    localStorage.removeItem("staffRestaurant");
    navigate("/staff/login", { replace: true });
  };

  const navigation = [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/staff/orders", label: "Orders", icon: ClipboardList, end: false },
  ];

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-slate-900 lg:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173b32] text-white">
            <Utensils size={19} />
          </span>
          <span>
            <span className="block font-serif text-xl font-semibold">Aagan</span>
            <span className="block text-xs text-slate-500">Staff Portal</span>
          </span>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Restaurant
          </p>
          <p className="mt-1 truncate text-sm font-semibold">
            {profile?.restaurant.name ?? "Loading…"}
          </p>
        </div>

        <nav aria-label="Staff navigation" className="flex gap-2 px-3 pb-3 lg:flex-col lg:px-3">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#eaf0ec] text-[#173b32]"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-slate-100 p-4 lg:block">
          <p className="truncate text-sm font-semibold">
            {profile?.user.name ?? "Staff member"}
          </p>
          <p className="truncate text-xs text-slate-500">{profile?.user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 inline-flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 lg:justify-end lg:px-8">
          <p className="text-sm font-semibold text-slate-700">
            {profile?.user.name ?? "Staff"}
          </p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <LogOut size={16} /> Sign out
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {error ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <Outlet context={profile} />
          )}
        </div>
      </main>
    </div>
  );
}

export default StaffLayout;
