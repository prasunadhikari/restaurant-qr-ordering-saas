import { useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

import Card from "../../components/ui/Card";

type OrderStatus =
  | "New"
  | "Preparing"
  | "Ready"
  | "Served";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    badge: "info" | "warning" | "success" | "default";
    description: string;
    icon: typeof BellRing;
  }
> = {
  New: {
    label: "New",
    badge: "info",
    description: "New orders",
    icon: BellRing,
  },
  Preparing: {
    label: "Preparing",
    badge: "warning",
    description: "Being prepared",
    icon: LoaderCircle,
  },
  Ready: {
    label: "Ready",
    badge: "success",
    description: "Ready to serve",
    icon: CheckCircle2,
  },
  Served: {
    label: "Served",
    badge: "default",
    description: "Completed",
    icon: CheckCircle2,
  },
};

function OrdersPage() {
  const [activeStatus, setActiveStatus] =
    useState<OrderStatus | "All">("All");

  /*
   * TEMPORARY EMPTY STATE
   *
   * There are intentionally no demo orders here.
   *
   * Real orders will come from:
   *
   * GET /api/orders
   *
   * and status changes will use:
   *
   * PATCH /api/orders/:orderId/status
   *
   * Socket.IO will later keep this page updated in real time.
   */

  const orders: unknown[] = [];

  const statusTabs: Array<OrderStatus | "All"> = [
    "All",
    "New",
    "Preparing",
    "Ready",
    "Served",
  ];

  const getCount = (status: OrderStatus | "All") => {
    if (status === "All") {
      return orders.length;
    }

    return 0;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          PAGE HEADING
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Restaurant order management
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage incoming dine-in orders and update their
            status.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

          <span className="text-xs font-semibold text-slate-500">
            Waiting for order system
          </span>
        </div>
      </div>

      {/* =====================================================
          STATUS FILTERS
      ====================================================== */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((status) => {
          const count = getCount(status);
          const active = activeStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status}

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      <Card padding="lg">
        <div className="flex min-h-[420px] flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ShoppingBag
              size={26}
              strokeWidth={1.7}
            />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-900">
            No orders yet
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Orders will appear here when customers scan a
            restaurant table QR code and place an order.
          </p>

          <div className="mt-6 grid w-full max-w-lg gap-3 sm:grid-cols-3">
            {(
              Object.entries(statusConfig) as [
                OrderStatus,
                (typeof statusConfig)[OrderStatus],
              ][]
            ).map(([status, config]) => {
              const Icon = config.icon;

              return (
                <div
                  key={status}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4"
                >
                  <Icon
                    size={17}
                    className="mx-auto text-slate-400"
                    strokeWidth={1.8}
                  />

                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {config.label}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* =====================================================
          ORDER SYSTEM ROADMAP
      ====================================================== */}
      <Card padding="none">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Clock3
                size={18}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-950">
                Order system
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Backend integration status
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Order model
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Not connected
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              MongoDB Order model will store customer
              orders.
            </p>
          </div>

          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              REST API
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Not connected
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Orders will be loaded and updated through the
              backend API.
            </p>
          </div>

          <div className="bg-white px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Real-time
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Socket.IO planned
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              New orders and status changes will update the
              dashboard live.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default OrdersPage;