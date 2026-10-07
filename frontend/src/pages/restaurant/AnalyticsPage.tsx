import { useEffect, useState } from "react";
import { BarChart3, Clock3, ShoppingBag, WalletCards } from "lucide-react";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import {
  getRestaurantAnalytics,
} from "../../services/restaurantDashboardService";
import type { RestaurantAnalytics } from "../../services/restaurantDashboardService";

const formatNPR = (amount: number) => `₨ ${amount.toLocaleString("en-IN")}`;

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getRestaurantAnalytics()
      .then(setAnalytics)
      .catch((err: unknown) => {
        console.error("Failed to load restaurant analytics:", err);
        setError(err instanceof Error ? err.message : "Unable to load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card><p className="text-sm text-slate-500">Loading analytics…</p></Card>;
  if (!analytics) return <Card><p className="font-semibold text-slate-900">Analytics unavailable</p><p className="mt-2 text-sm text-red-700">{error || "No analytics data was returned."}</p></Card>;

  const { summary, dailyRevenue, topDishes, busyHours } = analytics;
  const maxRevenue = Math.max(...dailyRevenue.map((day) => day.revenue), 0);
  const maxBusyOrders = Math.max(...busyHours.map((hour) => hour.orders), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-slate-500">Business performance</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Analytics</h2><p className="mt-1 text-sm text-slate-500">Your restaurant activity over the last seven days.</p></div>
        <Badge variant="info">Last 7 days</Badge>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Today's revenue</p><WalletCards className="text-emerald-700" size={18} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{formatNPR(summary.todayRevenue)}</p><p className="mt-2 text-xs text-slate-400">From today's orders</p></Card>
        <Card><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Today's orders</p><ShoppingBag className="text-emerald-700" size={18} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{summary.todayOrders}</p><p className="mt-2 text-xs text-slate-400">Orders received today</p></Card>
        <Card><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Occupied tables</p><BarChart3 className="text-emerald-700" size={18} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{summary.occupiedTables} / {summary.totalTables}</p><p className="mt-2 text-xs text-slate-400">Current floor activity</p></Card>
        <Card><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Pending orders</p><Clock3 className="text-emerald-700" size={18} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{summary.pendingOrders}</p><p className="mt-2 text-xs text-slate-400">Still being prepared or served</p></Card>
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="text-lg font-bold text-slate-900">Revenue overview</h3><p className="mt-1 text-sm text-slate-500">Daily sales for the last seven days.</p></div>
          <Badge variant="default">{formatNPR(summary.weekRevenue)} · {summary.weekOrders} orders</Badge>
        </div>
        {summary.weekOrders === 0 ? (
          <div className="mt-6 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center"><div><p className="font-semibold text-slate-800">No order data for this week</p><p className="mt-1 text-sm text-slate-500">Revenue will show here when restaurant orders are recorded.</p></div></div>
        ) : (
          <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
            {dailyRevenue.map((day, index) => {
              const height = maxRevenue ? (day.revenue / maxRevenue) * 100 : 0;
              return <div key={`${day.day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-3"><div className="relative flex w-full flex-1 items-end"><div className="group relative w-full rounded-t-xl bg-emerald-500 transition hover:bg-emerald-600" style={{ height: `${height}%`, minHeight: day.revenue > 0 ? "18px" : "0" }}><span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">{formatNPR(day.revenue)}</span></div></div><div className="text-center"><p className="text-xs font-semibold text-slate-600">{day.day}</p><p className="text-[11px] text-slate-400">{day.orders} orders</p></div></div>;
            })}
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold text-slate-900">Popular dishes</h3><p className="mt-1 text-sm text-slate-500">Most ordered items this week.</p></div>
          {topDishes.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-500">Dish sales will appear after orders are recorded.</div> : <div className="divide-y divide-slate-100">{topDishes.map((dish, index) => <div key={dish.name} className="flex items-center gap-4 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{index + 1}</div><p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">{dish.name}</p><div className="text-right"><p className="text-sm font-bold">{dish.orders} sold</p><p className="text-xs text-slate-500">{formatNPR(dish.revenue)}</p></div></div>)}</div>}
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-900">Busiest hours</h3><p className="mt-1 text-sm text-slate-500">Order volume by time of day this week.</p>
          {busyHours.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">Busy hours will appear after orders are recorded.</div> : <div className="mt-6 space-y-4">{busyHours.map((hour) => <div key={hour.time}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{hour.time}</span><span className="text-slate-500">{hour.orders} orders</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${maxBusyOrders ? hour.orders / maxBusyOrders * 100 : 0}%` }} /></div></div>)}</div>}
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;
