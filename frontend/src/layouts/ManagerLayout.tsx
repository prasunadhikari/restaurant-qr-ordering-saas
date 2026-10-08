import { useEffect, useState } from "react";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  QrCode,
  Store,
  Table2,
  Utensils,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  getManagerProfile,
  type ManagerProfile,
} from "../services/managerService";
import { clearManagerSession } from "../services/authSession";

const navigation = [
  { to: "/manager", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/manager/orders", label: "Orders", icon: ClipboardList, end: false },
  { to: "/manager/payments", label: "Payments", icon: Banknote, end: false },
  { to: "/manager/bills", label: "Bills", icon: ReceiptText, end: false },
  { to: "/manager/menu", label: "Menu", icon: Store, end: false },
  { to: "/manager/tables", label: "Tables", icon: Table2, end: false },
  { to: "/manager/qr", label: "Table QR", icon: QrCode, end: false },
];

function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getManagerProfile()
      .then((data) => {
        if (active) {
          setProfile(data);
          localStorage.setItem("managerUser", JSON.stringify(data.user));
          localStorage.setItem("managerRestaurant", JSON.stringify(data.restaurant));
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        console.error("Failed to load manager profile:", cause);
        setError(cause instanceof Error ? cause.message : "Unable to load manager profile.");
        clearManagerSession();
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    clearManagerSession();
    navigate("/manager/login", { replace: true });
  };

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname === "/manager") return "Dashboard";
    if (pathname.startsWith("/manager/orders")) return "Orders";
    if (pathname.startsWith("/manager/payments")) return "Payments";
    if (pathname.startsWith("/manager/bills")) return "Bills";
    if (pathname.startsWith("/manager/menu")) return "Menu";
    if (pathname.startsWith("/manager/tables")) return "Tables";
    if (pathname.startsWith("/manager/qr")) return "Table QR";
    return "Manager";
  };

  return (
    <div className="portal-shell min-h-screen">
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="portal-sidebar-brand flex h-[72px] shrink-0 items-center border-b px-5">
          <span className="portal-brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <Utensils size={19} />
          </span>
          <div className="ml-3 min-w-0 flex-1">
            <p className="portal-brand-title truncate font-serif text-xl font-semibold">Aagan</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Manager Portal</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="portal-control flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="portal-sidebar-context border-b px-4 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Restaurant</p>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="portal-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white">
              <Utensils size={16} />
            </span>
            <p className="truncate text-sm font-semibold text-slate-800">{profile?.restaurant.name ?? "Loading…"}</p>
          </div>
        </div>
        <nav aria-label="Manager navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Workspace</p>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `portal-nav-link group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
                  isActive ? "text-[#174f3d]" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 group-aria-[current=page]:text-[#287455]">
                <Icon size={18} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="portal-sidebar-context mt-auto border-t p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="portal-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
              {profile?.user.name?.slice(0, 1).toUpperCase() ?? "M"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.user.name ?? "Manager"}</p>
              <p className="truncate text-xs text-slate-500">{profile?.user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="portal-control mt-4 inline-flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 lg:pl-64">
        <header className="portal-header sticky top-0 z-30 flex h-[72px] items-center justify-between border-b px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="portal-control flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block">Manager workspace</p>
              <h1 className="portal-header-title truncate text-base font-bold sm:text-lg">{getPageTitle()}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-48 truncate text-xs font-semibold text-slate-800">{profile?.user.name ?? "Manager"}</p>
              <p className="max-w-48 truncate text-[10px] text-slate-500">{profile?.restaurant.name}</p>
            </div>
            <span className="portal-avatar flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white sm:hidden">
              {profile?.user.name?.slice(0, 1).toUpperCase() ?? "M"}
            </span>
            <button
              type="button"
              onClick={logout}
              className="portal-control inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 lg:hidden"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
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

export default ManagerLayout;
