import { useMemo, useState } from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

type OrderStatus =
  | "New"
  | "Preparing"
  | "Ready"
  | "Served";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

interface Order {
  id: string;
  table: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  time: string;
  note?: string;
}

const initialOrders: Order[] = [
  {
    id: "#KTM-1042",
    table: "Table 08",
    customer: "Prasun",
    items: [
      {
        name: "Chicken Momo",
        quantity: 2,
        price: 280,
      },
      {
        name: "Masala Tea",
        quantity: 2,
        price: 120,
      },
    ],
    total: 800,
    status: "New",
    time: "Just now",
    note: "Less spicy please",
  },
  {
    id: "#KTM-1041",
    table: "Table 03",
    customer: "Guest",
    items: [
      {
        name: "Chicken Chowmein",
        quantity: 1,
        price: 320,
      },
      {
        name: "Chicken Sekuwa",
        quantity: 2,
        price: 450,
      },
    ],
    total: 1_220,
    status: "Preparing",
    time: "3 min ago",
  },
  {
    id: "#KTM-1040",
    table: "Table 12",
    customer: "Guest",
    items: [
      {
        name: "Veg Momo",
        quantity: 2,
        price: 220,
      },
      {
        name: "Cold Coffee",
        quantity: 1,
        price: 180,
      },
    ],
    total: 620,
    status: "Ready",
    time: "6 min ago",
  },
  {
    id: "#KTM-1039",
    table: "Table 05",
    customer: "Guest",
    items: [
      {
        name: "Dal Bhat",
        quantity: 2,
        price: 450,
      },
      {
        name: "Lassi",
        quantity: 2,
        price: 180,
      },
    ],
    total: 1_260,
    status: "Served",
    time: "15 min ago",
  },
  {
    id: "#KTM-1038",
    table: "Table 16",
    customer: "Guest",
    items: [
      {
        name: "Chicken Fried Rice",
        quantity: 1,
        price: 380,
      },
      {
        name: "French Fries",
        quantity: 1,
        price: 220,
      },
    ],
    total: 600,
    status: "New",
    time: "18 min ago",
  },
];

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    badge: "info" | "warning" | "success" | "default";
    description: string;
  }
> = {
  New: {
    label: "New",
    badge: "info",
    description: "New orders",
  },
  Preparing: {
    label: "Preparing",
    badge: "warning",
    description: "Being prepared",
  },
  Ready: {
    label: "Ready",
    badge: "success",
    description: "Ready to serve",
  },
  Served: {
    label: "Served",
    badge: "default",
    description: "Completed",
  },
};

function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>(initialOrders);

  const [activeStatus, setActiveStatus] =
    useState<OrderStatus | "All">("All");

  const filteredOrders = useMemo(() => {
    if (activeStatus === "All") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === activeStatus,
    );
  }, [orders, activeStatus]);

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );
  };

  const getNextAction = (
    status: OrderStatus,
  ): {
    label: string;
    nextStatus: OrderStatus;
  } | null => {
    switch (status) {
      case "New":
        return {
          label: "Start preparing",
          nextStatus: "Preparing",
        };

      case "Preparing":
        return {
          label: "Mark ready",
          nextStatus: "Ready",
        };

      case "Ready":
        return {
          label: "Mark served",
          nextStatus: "Served",
        };

      case "Served":
        return null;
    }
  };

  const statusTabs: Array<
    OrderStatus | "All"
  > = [
    "All",
    "New",
    "Preparing",
    "Ready",
    "Served",
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Restaurant order management
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage incoming dine-in orders and update their
            status.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-emerald-700">
            Live order system
          </span>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((status) => {
          const count =
            status === "All"
              ? orders.length
              : orders.filter(
                  (order) =>
                    order.status === status,
                ).length;

          const active =
            activeStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setActiveStatus(status)
              }
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

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <Card padding="lg">
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🛎
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No orders here
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Orders matching this status will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredOrders.map((order) => {
            const action =
              getNextAction(order.status);

            return (
              <Card
                key={order.id}
                padding="none"
                className="overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">
                        {order.id}
                      </h3>

                      <Badge
                        variant={
                          statusConfig[
                            order.status
                          ].badge
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {order.table} ·{" "}
                      {order.customer} ·{" "}
                      {order.time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      NPR{" "}
                      {order.total.toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-400">
                      {order.items.reduce(
                        (sum, item) =>
                          sum + item.quantity,
                        0,
                      )}{" "}
                      items
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {order.items.map(
                      (item) => (
                        <div
                          key={item.name}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="flex min-w-0 gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                              {item.quantity}
                            </span>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {item.name}
                              </p>

                              {item.note && (
                                <p className="mt-0.5 text-xs text-amber-600">
                                  Note: {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="shrink-0 text-sm font-medium text-slate-600">
                            NPR{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {order.note && (
                    <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-700">
                        Customer note
                      </p>

                      <p className="mt-0.5 text-xs text-amber-600">
                        {order.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {action ? (
                      <Button
                        type="button"
                        fullWidth
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            action.nextStatus,
                          )
                        }
                      >
                        {action.label}
                      </Button>
                    ) : (
                      <div className="flex w-full items-center justify-center rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        ✓ Order completed
                      </div>
                    )}

                    {order.status !==
                      "Served" && (
                      <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Served",
                          )
                        }
                      >
                        Mark served
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;