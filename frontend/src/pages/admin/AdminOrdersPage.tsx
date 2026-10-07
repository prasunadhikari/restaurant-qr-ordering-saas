import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { getAdminOrders, type AdminOrder } from "../../services/adminService";

const restaurantName = (order: AdminOrder): string =>
  !order.restaurantId || typeof order.restaurantId === "string"
    ? "Restaurant unavailable"
    : order.restaurantId.name;

const tableNumber = (order: AdminOrder): string =>
  !order.tableId || typeof order.tableId === "string" ? "—" : order.tableId.tableNumber;

function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((cause: unknown) => {
        console.error("Failed to load platform orders:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const statuses = useMemo(
    () => [...new Set(orders.map((order) => order.status))].sort(),
    [orders],
  );
  const visibleOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      order.orderNumber.toLowerCase().includes(query) ||
      restaurantName(order).toLowerCase().includes(query) ||
      tableNumber(order).toLowerCase().includes(query);
    return matchesQuery && (status === "all" || order.status === status);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Platform management</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Orders</h2>
        <p className="mt-2 text-sm text-slate-500">Review recent orders across all restaurants.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <Card padding="none">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input id="admin-order-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, restaurant, table" className="pl-9" />
          </div>
          <select aria-label="Filter orders by status" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="all">All statuses</option>
            {statuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </div>
        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">Loading orders…</p>
        ) : visibleOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={26} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">No matching orders</p>
            <p className="mt-1 text-sm text-slate-500">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Order</th><th className="px-5 py-3">Restaurant</th><th className="px-5 py-3">Table</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">#{order.orderNumber}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{restaurantName(order)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{tableNumber(order)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">₨ {order.total.toLocaleString()}</td>
                    <td className="px-5 py-4"><Badge variant={["ready", "served", "Ready", "Served"].includes(order.status) ? "success" : ["pending", "New"].includes(order.status) ? "warning" : "info"}>{order.status}</Badge></td>
                    <td className="px-5 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Showing the latest {orders.length} orders (up to 200).</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrdersPage;
