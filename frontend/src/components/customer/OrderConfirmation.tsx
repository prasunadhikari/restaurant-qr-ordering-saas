interface OrderConfirmationProps {
  orderNumber: string;
  tableNumber: string;
  itemCount: number;
  total: number;
  onBackToMenu: () => void;
}

function OrderConfirmation({
  orderNumber,
  tableNumber,
  itemCount,
  total,
  onBackToMenu,
}: OrderConfirmationProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Success header */}
        <div className="bg-emerald-600 px-6 pb-8 pt-10 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Order placed!
          </h1>

          <p className="mt-2 text-sm text-emerald-100">
            Your order has been sent to the restaurant.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Order number */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Order number
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">
              {orderNumber}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Table {tableNumber}</span>
              <span>•</span>
              <span>
                {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Current status */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Order status
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Preparing
              </span>
            </div>

            <div className="mt-5">
              <div className="relative flex items-start justify-between">
                <div className="absolute left-5 right-5 top-5 h-0.5 bg-slate-200" />

                <div className="relative z-10 flex w-1/4 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white ring-4 ring-white">
                    ✓
                  </div>

                  <span className="mt-2 text-center text-xs font-semibold text-emerald-700">
                    Received
                  </span>
                </div>

                <div className="relative z-10 flex w-1/4 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-4 ring-white">
                    2
                  </div>

                  <span className="mt-2 text-center text-xs font-semibold text-blue-700">
                    Preparing
                  </span>
                </div>

                <div className="relative z-10 flex w-1/4 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-sm font-bold text-slate-400 ring-4 ring-white">
                    3
                  </div>

                  <span className="mt-2 text-center text-xs text-slate-400">
                    Ready
                  </span>
                </div>

                <div className="relative z-10 flex w-1/4 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-sm font-bold text-slate-400 ring-4 ring-white">
                    4
                  </div>

                  <span className="mt-2 text-center text-xs text-slate-400">
                    Served
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-sm font-semibold text-slate-600">
              Order total
            </span>

            <span className="text-xl font-bold text-slate-900">
              NPR {total.toLocaleString()}
            </span>
          </div>

          <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-xs leading-5 text-amber-700">
            Please stay at your table. The restaurant will
            update your order status as it is prepared.
          </p>

          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;