import { useEffect, useRef, useState } from "react";
import { Check, Clock3, X } from "lucide-react";

export interface NewOrderNotice {
  id: string;
  orderNumber: string;
  status: string;
  tableNumber: string;
  items: Array<{ name: string; quantity: number }>;
  createdAt: string;
}

interface NewOrderAlertProps {
  orders: () => Promise<NewOrderNotice[]>;
  onAccept: (orderId: string) => Promise<void>;
  onDecline?: (orderId: string) => Promise<void>;
}

const ALERT_DURATION_SECONDS = 10;
const POLL_INTERVAL_MS = 4_000;

function NewOrderAlert({
  orders: loadOrders,
  onAccept,
  onDecline,
}: NewOrderAlertProps) {
  const [queue, setQueue] = useState<NewOrderNotice[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(ALERT_DURATION_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const knownOrderIds = useRef<Set<string> | null>(null);
  const requestInFlight = useRef(false);
  const activeOrder = queue[0];

  useEffect(() => {
    let active = true;

    const poll = async () => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;
      try {
        const pendingOrders = (await loadOrders()).filter(
          (order) => order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "new",
        );
        if (!active) return;

        const pendingIds = new Set(pendingOrders.map((order) => order.id));
        if (knownOrderIds.current === null) {
          const recentCutoff = Date.now() - ALERT_DURATION_SECONDS * 1_000;
          const recentOrders = pendingOrders.filter(
            (order) => new Date(order.createdAt).getTime() >= recentCutoff,
          );
          knownOrderIds.current = pendingIds;
          if (recentOrders.length > 0) setQueue(recentOrders);
          return;
        }

        const arrivals = pendingOrders.filter(
          (order) => !knownOrderIds.current?.has(order.id),
        );
        knownOrderIds.current = pendingIds;
        if (arrivals.length > 0) {
          setQueue((current) => {
            const queuedIds = new Set(current.map((order) => order.id));
            return [
              ...current,
              ...arrivals.filter((order) => !queuedIds.has(order.id)),
            ];
          });
        }
        setError("");
      } catch (cause) {
        if (!active) return;
        console.error("Failed to check for new orders:", cause);
        setError(cause instanceof Error ? cause.message : "Unable to check for new orders.");
      } finally {
        requestInFlight.current = false;
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  useEffect(() => {
    if (!activeOrder) return;

    const timeout = window.setTimeout(() => {
      if (secondsRemaining <= 1) {
        setQueue((orders) => orders.filter((order) => order.id !== activeOrder.id));
        setSecondsRemaining(ALERT_DURATION_SECONDS);
      } else {
        setSecondsRemaining(secondsRemaining - 1);
      }
    }, 1_000);
    return () => window.clearTimeout(timeout);
  }, [activeOrder, secondsRemaining]);

  const handleAction = async (action: (orderId: string) => Promise<void>) => {
    if (!activeOrder || busy) return;
    setBusy(true);
    setError("");
    try {
      await action(activeOrder.id);
      setQueue((current) => current.filter((order) => order.id !== activeOrder.id));
      setSecondsRemaining(ALERT_DURATION_SECONDS);
    } catch (cause) {
      console.error("Failed to respond to new order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
    } finally {
      setBusy(false);
    }
  };

  if (!activeOrder && !error) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[70] mx-auto max-w-lg sm:inset-x-auto sm:right-5 sm:top-5 sm:w-full">
      {activeOrder ? (
        <section
          aria-live="assertive"
          aria-label={`New order ${activeOrder.orderNumber}`}
          className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_18px_55px_-18px_rgba(15,45,34,0.45)]"
        >
          <div
            className="h-1 bg-emerald-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(secondsRemaining / ALERT_DURATION_SECONDS) * 100}%` }}
          />
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Clock3 size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">New order received</p>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {secondsRemaining}s
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Order #{activeOrder.orderNumber} · Table {activeOrder.tableNumber}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                  {activeOrder.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                </p>
              </div>
            </div>
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              {onDecline && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAction(onDecline)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <X size={16} /> Decline
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleAction(onAccept)}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                <Check size={16} /> {busy ? "Updating…" : "Accept"}
              </button>
            </div>
            {queue.length > 1 && (
              <p className="mt-2 text-center text-[11px] text-slate-500">
                {queue.length - 1} more new {queue.length === 2 ? "order" : "orders"} in queue
              </p>
            )}
          </div>
        </section>
      ) : (
        <p role="alert" className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-700 shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}

export default NewOrderAlert;
