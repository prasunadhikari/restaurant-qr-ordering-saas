import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import StaffOrderCard from "../../components/staff/StaffOrderCard";
import {
  advanceStaffOrder,
  closeStaffTableSession,
  getStaffOrders,
  getStaffTables,
  type StaffOrder,
  type StaffOrderStatus,
  type StaffTable,
} from "../../services/staffService";
import { nextOrderStatus } from "../../components/staff/staffOrderUtils";

const filters: Array<StaffOrderStatus | "all"> = [
  "all",
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
];

function StaffOrdersPage() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [tables, setTables] = useState<StaffTable[]>([]);
  const [filter, setFilter] = useState<StaffOrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    try {
      const [latestOrders, latestTables] = await Promise.all([
        getStaffOrders(),
        getStaffTables(),
      ]);
      setOrders(latestOrders);
      setTables(latestTables);
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
    const status = nextOrderStatus[order.status];
    if (!status) return;
    setUpdatingId(order._id);
    setError("");
    try {
      const updated = await advanceStaffOrder(order._id, status);
      setOrders((current) =>
        current.map((entry) => entry._id === updated._id ? updated : entry),
      );
      setTables(await getStaffTables());
    } catch (cause) {
      console.error("Failed to advance staff order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
      void loadOrders(true);
    } finally {
      setUpdatingId("");
    }
  };

  const visible = orders.filter(
    (order) => filter === "all" || order.status === filter,
  );
  const tableByNumber = new Map(tables.map((table) => [table.tableNumber, table]));
  const tableEmptyOrderIds = new Set<string>();
  const seenTables = new Set<string>();
  for (const order of orders) {
    const table = tableByNumber.get(order.tableNumber);
    if (table?.activeSessionId && !seenTables.has(order.tableNumber) && order.status === "served") {
      tableEmptyOrderIds.add(order._id);
      seenTables.add(order.tableNumber);
    }
  }

  const clearTable = async (table: StaffTable) => {
    if (!window.confirm(`Confirm Table ${table.tableNumber} is empty and cleaned? This closes its active customer session.`)) return;
    setUpdatingId(table._id);
    setError("");
    try {
      await closeStaffTableSession(table._id);
      await loadOrders(true);
    } catch (cause) {
      console.error("Failed to clear staff table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to clear this table.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Staff Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Restaurant orders · automatically refreshes every 12 seconds
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter orders">
        {filters.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
            className={`min-h-10 shrink-0 rounded-lg px-4 text-sm font-semibold capitalize ${
              filter === status
                ? "bg-[#173b32] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status === "all" ? "All" : status}
            <span className="ml-2 opacity-75">
              {status === "all"
                ? orders.length
                : orders.filter((order) => order.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading orders…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <h2 className="font-semibold text-slate-800">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Orders will appear here as soon as customers place them.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {visible.map((order) => (
            <StaffOrderCard
              key={order._id}
              order={order}
              onAdvance={advanceOrder}
              updating={updatingId === order._id}
              tableEmpty={tableEmptyOrderIds.has(order._id) ? (() => {
                const table = tableByNumber.get(order.tableNumber);
                if (!table?.activeSessionId) return undefined;
                return {
                  canClear: table.canClear,
                  busy: updatingId === table._id,
                  onClick: () => void clearTable(table),
                };
              })() : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffOrdersPage;
