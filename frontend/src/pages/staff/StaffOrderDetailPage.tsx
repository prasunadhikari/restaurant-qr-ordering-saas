import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";

import {
  nextOrderStatus,
  nextStatusLabels,
  statusLabels,
} from "../../components/staff/staffOrderUtils";
import {
  advanceStaffOrder,
  getStaffOrder,
  type StaffOrder,
} from "../../services/staffService";

function StaffOrderDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [order, setOrder] = useState<StaffOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      setOrder(await getStaffOrder(id));
      setError("");
    } catch (cause) {
      console.error("Failed to load staff order details:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrder(), 0);
    const timer = window.setInterval(() => void loadOrder(), 12000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadOrder]);

  const advance = async () => {
    if (!order) return;
    const next = nextOrderStatus[order.status];
    if (!next) return;
    setUpdating(true);
    setError("");
    try {
      setOrder(await advanceStaffOrder(order._id, next));
    } catch (cause) {
      console.error("Failed to advance staff order:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update order.");
      void loadOrder();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading order…</p>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link to="/staff/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-[#173b32]">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Order not found."}
        </p>
      </div>
    );
  }

  const actionLabel = nextStatusLabels[order.status];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/staff/orders" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#173b32] hover:underline">
        <ArrowLeft size={16} /> Back to orders
      </Link>
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order details</p>
            <h1 className="mt-1 text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Clock3 size={15} />
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold capitalize">
              {statusLabels[order.status]}
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-600">Table {order.tableNumber}</p>
          </div>
        </div>

        <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">
          Items
        </h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {item.quantity} × {item.name}
                </p>
                {item.specialInstructions && (
                  <p className="mt-1 text-sm text-amber-800">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-sm font-medium text-slate-600">
                ₨ {(item.quantity * item.unitPrice).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        {order.specialInstructions && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <span className="font-semibold">Order instructions:</span>{" "}
            {order.specialInstructions}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p className="text-sm font-semibold text-slate-600">Order total</p>
          <p className="text-xl font-bold">₨ {order.total.toLocaleString()}</p>
        </div>
        {actionLabel && (
          <button
            type="button"
            disabled={updating}
            onClick={() => void advance()}
            className="mt-5 min-h-12 w-full rounded-xl bg-[#173b32] px-5 text-sm font-bold text-white hover:bg-[#245747] disabled:opacity-60"
          >
            {updating ? "Updating…" : actionLabel}
          </button>
        )}
      </section>
    </div>
  );
}

export default StaffOrderDetailPage;
