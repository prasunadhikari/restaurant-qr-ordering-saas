import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
  adminName: string;
}

type NavigationItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onLogout,
  adminName,
}: AdminSidebarProps) {
  const navigation: NavigationGroup[] = [
    {
      label: "Overview",
      items: [
        {
          label: "Dashboard",
          path: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          label: "Restaurants",
          path: "/admin/restaurants",
          icon: Store,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: Users,
        },
        {
          label: "Orders",
          path: "/admin/orders",
          icon: ShoppingBag,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          label: "Settings",
          path: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-900 transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-64"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div
          className={`flex h-[72px] shrink-0 items-center border-b border-slate-100 ${
            collapsed ? "justify-center px-3" : "px-5"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-sm">
            A
          </div>

          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="truncate text-[14px] font-bold tracking-tight text-slate-900">
                Aagan
              </p>

              <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Platform Admin
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navigation.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {group.label}
                  </p>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin"}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `group relative flex items-center rounded-xl transition-all duration-150 ${
                            collapsed
                              ? "justify-center px-2 py-2.5"
                              : "gap-3 px-3 py-2.5"
                          } ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-600" />
                            )}

                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                isActive
                                  ? "text-emerald-600"
                                  : "text-slate-400 group-hover:text-slate-600"
                              }`}
                            >
                              <Icon
                                size={17}
                                strokeWidth={isActive ? 2 : 1.8}
                              />
                            </span>

                            {!collapsed && (
                              <span className="flex-1 truncate text-[13px] font-semibold">
                                {item.label}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          {/* Platform status */}
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                <div>
                  <p className="text-[10px] font-bold text-slate-700">
                    Aagan Platform
                  </p>

                  <p className="text-[9px] text-slate-500">
                    Administration console
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mb-2 hidden w-full items-center rounded-xl py-2 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 lg:flex ${
              collapsed ? "justify-center" : "justify-between px-3"
            }`}
          >
            {!collapsed && <span>Collapse sidebar</span>}

            <PanelLeft
              size={16}
              className={collapsed ? "" : "rotate-180"}
              strokeWidth={1.8}
            />
          </button>

          {/* Admin profile */}
          <div
            className={`rounded-xl border border-slate-200 bg-slate-50 ${
              collapsed ? "p-2" : "p-2.5"
            }`}
          >
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                A
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {adminName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      Administrator
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
            {collapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;