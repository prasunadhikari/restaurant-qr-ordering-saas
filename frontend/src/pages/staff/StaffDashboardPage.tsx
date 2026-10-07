import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";

import StaffOrderCard from "../../components/staff/StaffOrderCard";
import {
  advanceStaffOrder,
  getStaffOrders,
  type StaffOrder,
  type StaffOrderStatus,
} from "../../services/staffService";

const workflowStatuses: StaffOrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
];

function StaffDashboardPage() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const pendingOrderIds = useRef<Set<string> | null>(null);

  const loadOrders = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    try {
      const latest = await getStaffOrders();
      const latestPendingIds = new Set(
        latest.filter((order) => order.status === "pending").map((order) => order._id),
      );
      if (pendingOrderIds.current) {
        const arrivals = [...latestPendingIds].filter(
          (id) => !pendingOrderIds.current?.has(id),
        ).length;
        if (arrivals > 0) setNewOrderCount((count) => count + arrivals);
      }
      pendingOrderIds.current = latestPendingIds;
      setOrders(latest);
      setError("");
    } catch (cause) {
      console.error("Failed to load staff orders:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrders(), 0);
    const timer = window.setInterval(() => void loadOrders(true), 12000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadOrders]);

  const advanceOrder = async (order: StaffOrder) => {
    const next: Partial<Record<StaffOrderStatus, StaffOrderStatus>> = {
      pending: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "served",
    };
    const status = next[order.status];
    if (!status) return;
    setUpdatingId(order._id);
    setError("");
    try {
      const updated = await advanceStaffOrder(order._id, status);
      setOrders((current) =>
        current.map((entry) => entry._id === updated._id ? updated : entry),
      );
    } catch (cause) {
      console.error("Failed to advance staff order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
      void loadOrders(true);
    } finally {
      setUpdatingId("");
    }
  };

  const count = (status: StaffOrderStatus) =>
    orders.filter((order) => order.status === status).length;

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading today’s orders…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Staff Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Service dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your live order board · refreshes every 12 seconds
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewOrderCount(0);
            void loadOrders(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh orders
        </button>
      </div>

      {newOrderCount > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-bold text-amber-950">
            {newOrderCount === 1 ? "A new order has arrived" : `${newOrderCount} new orders have arrived`}
          </p>
          <button
            type="button"
            onClick={() => setNewOrderCount(0)}
            className="text-sm font-semibold text-amber-900 underline"
          >
            Got it
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section aria-label="Today's order counts" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {(["pending", "accepted", "preparing", "ready", "served"] as StaffOrderStatus[]).map((status) => (
          <div key={status} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{count(status)}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={19} className="text-[#173b32]" />
          <h2 className="text-lg font-bold">Live orders</h2>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold">
            {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <h3 className="font-semibold text-slate-800">No orders yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              New dine-in orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {workflowStatuses.map((status) => {
              const group = orders.filter((order) => order.status === status);
              if (group.length === 0) return null;
              return (
                <section key={status} aria-label={`${status} orders`}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {status}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">{group.length}</span>
                  </div>
                  <div className="grid gap-3 xl:grid-cols-2">
                    {group.map((order) => (
                      <StaffOrderCard
                        key={order._id}
                        order={order}
                        onAdvance={advanceOrder}
                        updating={updatingId === order._id}
                        compact
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffDashboardPage;
