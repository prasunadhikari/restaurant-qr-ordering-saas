import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";

import type {
  StaffOrder,
  StaffOrderStatus,
} from "../../services/staffService";
import { nextStatusLabels, statusLabels } from "./staffOrderUtils";

const statusStyle: Record<StaffOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-blue-100 text-blue-900",
  preparing: "bg-violet-100 text-violet-900",
  ready: "bg-emerald-100 text-emerald-900",
  served: "bg-slate-100 text-slate-700",
};

interface StaffOrderCardProps {
  order: StaffOrder;
  onAdvance?: (order: StaffOrder) => void;
  updating?: boolean;
  compact?: boolean;
}

function StaffOrderCard({
  order,
  onAdvance,
  updating = false,
  compact = false,
}: StaffOrderCardProps) {
  const actionLabel = nextStatusLabels[order.status];
  const action = actionLabel && onAdvance;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-950">
              Order #{order.orderNumber}
            </h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            {order.status === "pending" && (
              <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                New order
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Table {order.tableNumber}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} />
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <p className="text-lg font-bold text-slate-950">
          ₨ {order.total.toLocaleString()}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {order.items.slice(0, compact ? 4 : undefined).map((item, index) => (
          <li key={`${item.name}-${index}`} className="text-sm">
            <span className="font-bold text-slate-900">{item.quantity} ×</span>{" "}
            <span className="text-slate-700">{item.name}</span>
            {item.specialInstructions && (
              <span className="mt-0.5 block pl-5 text-xs text-amber-800">
                Note: {item.specialInstructions}
              </span>
            )}
          </li>
        ))}
        {compact && order.items.length > 4 && (
          <li className="pl-5 text-xs text-slate-500">
            +{order.items.length - 4} more items
          </li>
        )}
      </ul>

      {order.specialInstructions && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="font-semibold">Order instructions:</span>{" "}
          {order.specialInstructions}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <Link
          to={`/staff/orders/${order._id}`}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#173b32] hover:underline"
        >
          Order details <ArrowRight size={15} />
        </Link>
        {action && (
          <button
            type="button"
            disabled={updating}
            onClick={() => onAdvance(order)}
            className="min-h-11 rounded-xl bg-[#173b32] px-5 text-sm font-bold text-white hover:bg-[#245747] disabled:cursor-wait disabled:opacity-60"
          >
            {updating ? "Updating…" : actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}

export default StaffOrderCard;
