import type { CustomerOrder } from "../../services/customerService";

interface OrderConfirmationProps {
  order: CustomerOrder;
  itemCount: number;
  onContinueBrowsing: () => void;
}

const orderStages = [
  { status: "pending", label: "Pending" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "served", label: "Served" },
] as const;

function OrderConfirmation({
  order,
  itemCount,
  onContinueBrowsing,
}: OrderConfirmationProps) {
  const currentIndex = orderStages.findIndex(
    (stage) => stage.status === order.status,
  );
  const currentStage = orderStages[Math.max(0, currentIndex)];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmation-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="bg-[#173b32] px-6 pb-8 pt-9 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl">
            ✓
          </div>
          <h1 id="order-confirmation-title" className="mt-4 text-2xl font-semibold">
            Order placed
          </h1>
          <p className="mt-2 text-sm text-white/75">
            {order.restaurantName} · Table {order.tableNumber}
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Order number
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">
              {order.orderNumber}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {itemCount} {itemCount === 1 ? "item" : "items"} · ₨{" "}
              {order.total.toLocaleString()}
            </p>
          </div>

          <div id="order-progress">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900">Track your order</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                {currentStage.label}
              </span>
            </div>
            <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Order progress">
              {orderStages.map((stage, index) => {
                const complete = index < currentIndex;
                const current = index === currentIndex;
                return (
                  <li key={stage.status} className="text-center">
                    <div
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        complete || current
                          ? "bg-[#173b32] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                      aria-current={current ? "step" : undefined}
                    >
                      {complete ? "✓" : index + 1}
                    </div>
                    <span
                      className={`mt-2 block text-[10px] leading-4 ${
                        complete || current ? "font-semibold text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-center text-xs text-slate-500">
              This page updates as the restaurant moves your order along.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="#order-progress"
              className="rounded-xl border border-slate-200 px-4 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Track order
            </a>
            <button
              type="button"
              onClick={onContinueBrowsing}
              className="rounded-xl bg-[#173b32] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#245747]"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderConfirmation;
