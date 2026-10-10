import { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Clock3, LoaderCircle, RefreshCw, ShoppingBag } from "lucide-react";

import Card from "../../components/ui/Card";
import {
  getOrders,
  updateOrderStatus,
} from "../../services/restaurantDashboardService";
import type {
  OrderStatus,
  RestaurantOrder,
} from "../../services/restaurantDashboardService";

const statuses: Array<OrderStatus | "All"> = [
  "All",
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
  "New",
  "Preparing",
  "Ready",
  "Served",
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "served",
  New: "Preparing",
  Preparing: "Ready",
  Ready: "Served",
};

const tableNumber = (order: RestaurantOrder): string =>
  typeof order.tableId === "string" ? "—" : order.tableId.tableNumber;

function OrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setOrders(await getOrders());
      setError("");
    } catch (err) {
      console.error("Failed to load restaurant orders:", err);
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void getOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error("Failed to load restaurant orders:", err);
        setError(err instanceof Error ? err.message : "Unable to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((order) => activeStatus === "All" || order.status === activeStatus),
    [orders, activeStatus],
  );

  const changeStatus = async (order: RestaurantOrder, status: OrderStatus) => {
    setUpdating(order._id);
    setError("");
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrders((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError(err instanceof Error ? err.message : "Unable to update order.");
    } finally {
      setUpdating("");
    }
  };

  const count = (status: OrderStatus | "All") =>
    status === "All" ? orders.length : orders.filter((order) => order.status === status).length;

  if (loading) return <Card><p className="text-sm text-slate-500">Loading orders…</p></Card>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Restaurant order management</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Orders</h2>
          <p className="mt-1 text-sm text-slate-500">Track incoming orders and update their preparation status.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map((status) => (
          <button key={status} type="button" onClick={() => setActiveStatus(status)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${activeStatus === status ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {status}<span className={`rounded-full px-2 py-0.5 text-xs ${activeStatus === status ? "bg-white/15" : "bg-slate-100"}`}>{count(status)}</span>
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <Card padding="lg">
          <div className="flex min-h-[340px] flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBag size={26} /></div>
            <h3 className="mt-5 text-lg font-black text-slate-900">{activeStatus === "All" ? "No orders yet" : `No ${activeStatus.toLowerCase()} orders`}</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Orders will be listed here as they are received. Refresh to check for new orders.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const next = nextStatus[order.status];
            const Icon = order.status === "New" || order.status === "pending" ? BellRing : order.status === "Preparing" || order.status === "preparing" || order.status === "accepted" ? LoaderCircle : CheckCircle2;
            return (
              <Card key={order._id} padding="none">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={19} /></div>
                    <div><h3 className="font-bold text-slate-900">Order {order.orderNumber}</h3><p className="mt-1 text-xs text-slate-500">Table {tableNumber(order)} · {order.fulfillmentType === "takeaway" ? "Take away" : "Dine in"} · {new Date(order.createdAt).toLocaleString()}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{order.status}</span>
                    {next && <button type="button" disabled={updating === order._id} onClick={() => void changeStatus(order, next)} className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{updating === order._id ? "Updating…" : `Mark ${next.toLowerCase()}`}</button>}
                    {(order.status === "Served" || order.status === "served") && <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 size={14} /> Complete</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={`${item.name}-${index}`}>
                        <p className="text-sm text-slate-600">
                          {item.quantity} × {item.name}{" "}
                          <span className="text-slate-400">
                            · ₨ {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </p>
                        {item.specialInstructions && (
                          <p className="ml-4 text-xs text-amber-700">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <p className="text-xs font-medium text-amber-700">
                        Order note: {order.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Clock3 size={15} className="text-slate-400" />Total ₨ {order.total.toLocaleString()}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
