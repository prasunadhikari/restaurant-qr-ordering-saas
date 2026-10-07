import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, CircleX, Clock3, RefreshCw } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getManagerOrders,
  updateManagerOrder,
  type ManagerOrder,
} from "../../services/managerService";

const statusLabel = (status: string) =>
  status.toLowerCase() === "new" ? "pending" : status.toLowerCase();

function ManagerOrdersPage() {
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const requestInFlight = useRef(false);

  const load = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setError("");
    try {
      setOrders(await getManagerOrders());
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
    let reason: string | undefined;
    if (status === "cancelled") {
      const enteredReason = window.prompt("Reason for declining or cancelling this order?");
      if (enteredReason === null) return;
      reason = enteredReason;
      if (!reason.trim()) {
        setError("A reason is required to decline or cancel an order.");
        return;
      }
    }
    setBusyId(order._id);
    setError("");
    try {
      const updated = await updateManagerOrder(order._id, status, reason);
      setOrders((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to update manager order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
    } finally {
      setBusyId("");
    }
  };

  const nextStatus: Record<string, string> = {
    pending: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: "served",
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
                    <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-950">#{order.orderNumber}</span><Badge variant={status === "pending" ? "warning" : status === "ready" ? "success" : status === "cancelled" ? "danger" : "info"}>{status}</Badge></span><span className="mt-1 block text-xs text-slate-500">Table {tableNumber} · {new Date(order.createdAt).toLocaleString()}</span></span>
                    {open ? <ChevronUp size={17} className="ml-auto text-slate-400" /> : <ChevronDown size={17} className="ml-auto text-slate-400" />}
                  </button>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <span className="font-bold text-slate-900">NPR {order.total.toLocaleString()}</span>
                    {next && <Button type="button" size="sm" disabled={busyId === order._id} onClick={() => void changeStatus(order, next)}><Check size={15} />{busyId === order._id ? "Saving…" : status === "pending" ? "Accept" : `Mark ${next}`}</Button>}
                    {(status === "pending" || status === "accepted") && <button type="button" disabled={busyId === order._id} onClick={() => void changeStatus(order, "cancelled")} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-700 hover:bg-red-50"><CircleX size={15} />Decline</button>}
                  </div>
                </div>
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
    </div>
  );
}

export default ManagerOrdersPage;
