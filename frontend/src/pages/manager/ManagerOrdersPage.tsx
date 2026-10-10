import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, CircleX, Clock3, RefreshCw, X } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  closeManagerTableSession,
  getManagerOrders,
  getManagerTables,
  updateManagerOrder,
  type ManagerOrder,
  type ManagerTable,
} from "../../services/managerService";

const statusLabel = (status: string) =>
  status.toLowerCase() === "new" ? "pending" : status.toLowerCase();

const cancellationReasons = [
  "Item unavailable or out of stock",
  "Kitchen temporarily unavailable (equipment issue)",
  "Unexpected staffing shortage",
  "Restaurant closing or temporary closure",
  "Preparation time is longer than expected",
  "Table or dining area is unavailable",
  "Duplicate order",
  "Incorrect order details",
  "Unable to fulfill a special request",
  "Dietary or allergy requirements need clarification",
  "Payment verification issue",
  "Customer requested cancellation",
  "Menu or pricing error",
  "Other reason",
];

function ManagerOrdersPage() {
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [tables, setTables] = useState<ManagerTable[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [cancellationOrder, setCancellationOrder] = useState<ManagerOrder | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationDetails, setCancellationDetails] = useState("");
  const requestInFlight = useRef(false);

  const load = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setError("");
    try {
      const [latestOrders, latestTables] = await Promise.all([
        getManagerOrders(),
        getManagerTables(),
      ]);
      setOrders(latestOrders);
      setTables(latestTables);
      setLastRefresh(new Date());
    } catch (cause) {
      console.error("Failed to load manager orders:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load orders.");
    } finally {
      setLoading(false);
      requestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
    const interval = window.setInterval(() => { void load(); }, 5000);
    return () => window.clearInterval(interval);
  }, [load]);

  const visibleOrders = useMemo(
    () => filter === "all" ? orders : orders.filter((order) => statusLabel(order.status) === filter),
    [orders, filter],
  );

  const changeStatus = async (order: ManagerOrder, status: string) => {
    if (status === "cancelled") {
      setCancellationOrder(order);
      setCancellationReason("");
      setCancellationDetails("");
      setError("");
      return;
    }
    await saveOrderStatus(order, status);
  };

  const saveOrderStatus = async (
    order: ManagerOrder,
    status: string,
    reason?: string,
  ): Promise<boolean> => {
    setBusyId(order._id);
    setError("");
    try {
      const updated = await updateManagerOrder(order._id, status, reason);
      setOrders((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
      setTables(await getManagerTables());
      return true;
    } catch (cause) {
      console.error("Failed to update manager order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
      return false;
    } finally {
      setBusyId("");
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationOrder || !cancellationReason) return;
    const isOther = cancellationReason === "Other reason";
    const details = cancellationDetails.trim();
    if (isOther && !details) {
      setError("Please enter a reason for cancelling this order.");
      return;
    }
    const reason = isOther
      ? details
      : details
        ? `${cancellationReason}: ${details}`
        : cancellationReason;
    if (await saveOrderStatus(cancellationOrder, "cancelled", reason)) {
      setCancellationOrder(null);
    }
  };

  const nextStatus: Record<string, string> = {
    pending: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: "served",
  };
  const tableByNumber = new Map(tables.map((table) => [table.tableNumber, table]));
  const tableEmptyOrderIds = new Set<string>();
  const seenTables = new Set<string>();
  for (const order of orders) {
    const tableNumber = typeof order.tableId === "string" ? "" : order.tableId?.tableNumber ?? "";
    const table = tableByNumber.get(tableNumber);
    if (table?.activeSessionId && !seenTables.has(tableNumber) && statusLabel(order.status) === "served") {
      tableEmptyOrderIds.add(order._id);
      seenTables.add(tableNumber);
    }
  }

  const clearTable = async (table: ManagerTable) => {
    if (!window.confirm(`Confirm Table ${table.tableNumber} is empty and cleaned? This closes its active customer session.`)) return;
    setBusyId(table._id);
    setError("");
    try {
      await closeManagerTableSession(table._id);
      const [latestOrders, latestTables] = await Promise.all([
        getManagerOrders(),
        getManagerTables(),
      ]);
      setOrders(latestOrders);
      setTables(latestTables);
      setLastRefresh(new Date());
    } catch (cause) {
      console.error("Failed to clear manager table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to clear this table.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Service queue</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Orders</h1><p className="mt-2 text-sm text-slate-500">Accept, guide, and close restaurant orders.</p>{lastRefresh && <p className="mt-1 text-xs text-slate-400">Live · refreshed {lastRefresh.toLocaleTimeString()} · every 5 seconds</p>}</div>
        <Button type="button" variant="outline" onClick={() => void load()}><RefreshCw size={15} /> Refresh now</Button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "accepted", "preparing", "ready", "served", "cancelled"].map((value) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${filter === value ? "bg-[#173b32] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
            {value === "all" ? "All orders" : value}
          </button>
        ))}
      </div>
      {loading ? <Card><p className="text-sm text-slate-500">Loading orders…</p></Card> : visibleOrders.length === 0 ? (
        <Card className="py-12 text-center"><Clock3 className="mx-auto text-slate-300" /><h2 className="mt-3 font-semibold">No orders in this queue</h2><p className="mt-1 text-sm text-slate-500">New table orders will appear here.</p></Card>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const status = statusLabel(order.status);
            const tableNumber = typeof order.tableId === "string" ? "—" : order.tableId?.tableNumber ?? "—";
            const open = expanded === order._id;
            const next = nextStatus[status];
            return (
              <Card key={order._id} padding="none" className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5">
                  <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setExpanded(open ? "" : order._id)} aria-expanded={open}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ec] text-[#315b40]"><span className="text-xs font-bold">{tableNumber}</span></span>
                    <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-950">#{order.orderNumber}</span><Badge variant={status === "pending" ? "warning" : status === "ready" ? "success" : status === "cancelled" ? "danger" : "info"}>{status}</Badge><Badge variant={order.fulfillmentType === "takeaway" ? "warning" : "default"}>{order.fulfillmentType === "takeaway" ? "Take away" : "Dine in"}</Badge></span><span className="mt-1 block text-xs text-slate-500">Table {tableNumber} · {new Date(order.createdAt).toLocaleString()}</span></span>
                    {open ? <ChevronUp size={17} className="ml-auto text-slate-400" /> : <ChevronDown size={17} className="ml-auto text-slate-400" />}
                  </button>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <span className="font-bold text-slate-900">NPR {order.total.toLocaleString()}</span>
                    {next && <Button type="button" size="sm" disabled={busyId === order._id} onClick={() => void changeStatus(order, next)}><Check size={15} />{busyId === order._id ? "Saving…" : status === "pending" ? "Accept" : `Mark ${next}`}</Button>}
                    {status === "served" && tableEmptyOrderIds.has(order._id) && (() => {
                      const table = tableByNumber.get(tableNumber);
                      if (!table?.activeSessionId) return null;
                      return (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!table.canClear || busyId === table._id}
                          title={!table.canClear ? "Serve all table orders and settle the bill before clearing this table" : undefined}
                          onClick={() => void clearTable(table)}
                        >
                          {busyId === table._id ? "Clearing…" : "Table Empty"}
                        </Button>
                      );
                    })()}
                    {(status === "pending" || status === "accepted") && <button type="button" disabled={busyId === order._id} onClick={() => void changeStatus(order, "cancelled")} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-700 hover:bg-red-50"><CircleX size={15} />Decline</button>}
                  </div>
                </div>
                {status === "served" && tableEmptyOrderIds.has(order._id) && !tableByNumber.get(tableNumber)?.canClear && (
                  <p className="px-5 pb-3 text-right text-xs text-amber-800">
                    Serve every order and settle the full table bill to clear this table.
                  </p>
                )}
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Items</h3>
                        <ul className="mt-2 divide-y divide-slate-200">
                          {order.items.map((item, index) => (
                            <li key={`${order._id}-${index}`} className="flex justify-between gap-4 py-2 text-sm">
                              <span>{item.quantity} × {item.name}{item.specialInstructions && <span className="mt-1 block text-xs text-slate-500">Note: {item.specialInstructions}</span>}</span>
                              <span className="shrink-0 font-medium">NPR {(item.quantity * item.unitPrice).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                        {order.specialInstructions && <p className="mt-3 rounded-lg bg-white p-3 text-sm"><strong>Order note:</strong> {order.specialInstructions}</p>}
                        {order.declineReason && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"><strong>Decline reason:</strong> {order.declineReason}</p>}
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm lg:min-w-48">
                        <p className="text-xs text-slate-500">Payment</p><p className="mt-1 font-semibold capitalize">{order.paymentMethod?.replace("_", " ") ?? "Not selected"}</p>
                        <p className="mt-3 text-xs text-slate-500">Payment status</p><p className="mt-1 font-semibold capitalize">{(order.paymentStatus ?? "unpaid").replaceAll("_", " ")}</p>
                        {status === "pending" && <p className="mt-3 text-xs leading-5 text-slate-500">Accept the order to send it into the kitchen workflow.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      {cancellationOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyId) setCancellationOrder(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Order #{cancellationOrder.orderNumber}</p>
                <h2 id="cancel-order-title" className="mt-1 text-xl font-bold text-slate-950">Why are you cancelling?</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a reason to let the customer know what happened.</p>
              </div>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => setCancellationOrder(null)}
                aria-label="Close cancellation dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>
            <div className="space-y-4 p-5 sm:p-6">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-800">Select the most suitable reason</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cancellationReasons.map((reason) => (
                    <label
                      key={reason}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                        cancellationReason === reason
                          ? "border-red-300 bg-red-50 text-red-900 ring-2 ring-red-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="manager-cancellation-reason"
                        value={reason}
                        checked={cancellationReason === reason}
                        onChange={() => {
                          setCancellationReason(reason);
                          setError("");
                        }}
                        className="accent-red-700"
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              </fieldset>
              {cancellationReason && (
                <label className="block text-sm font-medium text-slate-700">
                  {cancellationReason === "Other reason" ? "Please specify the reason" : "Add a note for the customer (optional)"}
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={cancellationDetails}
                    onChange={(event) => setCancellationDetails(event.target.value)}
                    placeholder={cancellationReason === "Other reason" ? "Explain why this order cannot be fulfilled…" : "Add helpful details…"}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <span className="mt-1 block text-right text-xs font-normal text-slate-400">{cancellationDetails.length}/500</span>
                </label>
              )}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" disabled={Boolean(busyId)} onClick={() => setCancellationOrder(null)}>Keep order</Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={!cancellationReason || Boolean(busyId) || (cancellationReason === "Other reason" && !cancellationDetails.trim())}
                  onClick={() => void confirmCancellation()}
                >
                  <CircleX size={16} /> {busyId === cancellationOrder._id ? "Cancelling…" : "Cancel order"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManagerOrdersPage;
