import { useEffect, useState, type ReactNode } from "react";
import { Activity, ArrowRight, Clock3, Store, UsersRound, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { getAdminOverview, type AdminOverview } from "../../services/adminService";

function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((cause: unknown) => {
        console.error("Failed to load platform overview:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load overview.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = overview?.summary;
  const metrics = [
    { label: "Restaurants", value: stats?.restaurants, detail: `${stats?.activeRestaurants ?? 0} active`, icon: Store, tint: "bg-emerald-50 text-emerald-700" },
    { label: "Orders", value: stats?.orders, detail: `${stats?.pendingOrders ?? 0} awaiting action`, icon: Activity, tint: "bg-amber-50 text-amber-700" },
    { label: "Tables", value: stats?.tables, detail: "Across all restaurants", icon: Utensils, tint: "bg-sky-50 text-sky-700" },
    { label: "Restaurant accounts", value: (stats?.owners ?? 0) + (stats?.managers ?? 0) + (stats?.staff ?? 0), detail: `${stats?.owners ?? 0} owners · ${stats?.managers ?? 0} managers · ${stats?.staff ?? 0} staff`, icon: UsersRound, tint: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Platform overview</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Welcome to Aagan Admin</h2>
          <p className="mt-2 text-sm text-slate-500">A live view of restaurants and operations across the platform.</p>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}
        </p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section aria-label="Platform summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tint }) => (
          <Card key={label} className="transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {loading ? "—" : (value ?? 0).toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-slate-500">{detail}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
                <Icon size={20} />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card padding="none">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="font-bold text-slate-950">Recently added restaurants</h3>
              <p className="mt-1 text-xs text-slate-500">Latest restaurant accounts registered on Aagan</p>
            </div>
            <Link to="/admin/restaurants" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              All restaurants <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading platform data…</p>
          ) : overview?.recentRestaurants.length ? (
            <div className="divide-y divide-slate-100">
              {overview.recentRestaurants.map((restaurant) => (
                <Link key={restaurant._id} to={`/admin/restaurants/${restaurant._id}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">{restaurant.name.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{restaurant.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{restaurant.address || `/${restaurant.slug}`}</span>
                  </span>
                  <Badge variant={restaurant.status === "active" ? "success" : restaurant.status === "pending" ? "warning" : "danger"}>{restaurant.status}</Badge>
                  <span className="hidden text-xs text-slate-400 sm:block">{new Date(restaurant.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Store size={24} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No restaurants yet</p>
              <Link to="/admin/restaurants" className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline">Add a restaurant</Link>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-bold text-slate-950">Platform status</h3>
          <p className="mt-1 text-xs text-slate-500">Live application and database health check</p>
          <div className="mt-5 space-y-3">
            <HealthRow label="API server" status={overview ? "Connected" : loading ? "Checking" : "Unavailable"} />
            <HealthRow label="Database" status={overview ? "Connected" : loading ? "Checking" : "Unavailable"} />
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">Operational summary</p>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${stats?.pendingRestaurants ?? 0} restaurants pending · ${stats?.suspendedRestaurants ?? 0} suspended`}
            </p>
          </div>
        </Card>
      </section>

      <section>
        <h3 className="font-bold text-slate-950">Quick access</h3>
        <p className="mt-1 text-sm text-slate-500">Go directly to the tools connected to your platform data.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink to="/admin/restaurants" icon={<Store size={18} />} label="Manage restaurants" />
          <QuickLink to="/admin/orders" icon={<Activity size={18} />} label="Review orders" />
          <QuickLink to="/admin/users" icon={<UsersRound size={18} />} label="View user accounts" />
          <QuickLink to="/admin/settings" icon={<Clock3 size={18} />} label="Account security" />
        </div>
      </section>
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const isConnected = status === "Connected";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`inline-flex items-center gap-2 text-xs font-semibold ${isConnected ? "text-emerald-700" : "text-slate-500"}`}>
        <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`} />
        {status}
      </span>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-800">
      <span className="text-emerald-700">{icon}</span>
      {label}
      <ArrowRight size={15} className="ml-auto text-slate-400" />
    </Link>
  );
}

export default AdminDashboardPage;
