import { useMemo, useState } from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

type TableStatus = "available" | "occupied";

type RestaurantTable = {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrder?: string;
};

function TablesPage() {
  // Real table data will come from the restaurant API.
  // Keeping this empty prevents demo data from being shown.
  const tables: RestaurantTable[] = [];

  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<"all" | TableStatus>("all");

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesSearch =
        !query ||
        table.tableNumber.toLowerCase().includes(query) ||
        table.currentOrder?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "all" ||
        table.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [tables, search, activeFilter]);

  const occupiedCount = tables.filter(
    (table) => table.status === "occupied",
  ).length;

  const availableCount = tables.filter(
    (table) => table.status === "available",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Restaurant floor
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Tables
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage restaurant tables and monitor their current status.
          </p>
        </div>

        <Button
          type="button"
          disabled
        >
          + Add table
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">
            Total tables
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {tables.length}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Available
            </p>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {availableCount}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Occupied
            </p>

            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {occupiedCount}
          </p>
        </Card>
      </div>

      {/* Controls */}
      <Card padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input
              id="table-search"
              placeholder="Search table number or order..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: "All", value: "all" },
              { label: "Available", value: "available" },
              { label: "Occupied", value: "occupied" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter.value as "all" | TableStatus,
                  )
                }
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table grid */}
      {filteredTables.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              ▦
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No tables available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              Your restaurant does not have any tables connected
              yet. Tables will appear here once they are created
              through the restaurant management system.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Table system
              </p>

              <p className="mt-1 text-sm text-slate-600">
                MongoDB table records, QR tokens, availability,
                capacity, and live order status will be connected
                here.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              padding="none"
              className={`overflow-hidden border-t-4 ${
                table.status === "occupied"
                  ? "border-t-amber-400"
                  : "border-t-emerald-400"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Table
                    </p>

                    <h3 className="mt-1 text-3xl font-bold text-slate-900">
                      {table.tableNumber}
                    </h3>
                  </div>

                  <Badge
                    variant={
                      table.status === "occupied"
                        ? "warning"
                        : "success"
                    }
                  >
                    {table.status === "occupied"
                      ? "Occupied"
                      : "Available"}
                  </Badge>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Capacity
                    </span>

                    <span className="font-semibold text-slate-700">
                      {table.capacity}{" "}
                      {table.capacity === 1
                        ? "person"
                        : "people"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      QR status
                    </span>

                    <span className="font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>

                  {table.currentOrder && (
                    <div className="rounded-xl bg-amber-50 px-3 py-2.5">
                      <p className="text-xs text-amber-600">
                        Current order
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-amber-800">
                        {table.currentOrder}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    QR Code
                  </Button>

                  <Button
                    type="button"
                    variant={
                      table.status === "occupied"
                        ? "secondary"
                        : "primary"
                    }
                    size="sm"
                  >
                    {table.status === "occupied"
                      ? "Free table"
                      : "Occupy"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Backend connection note */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
            i
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Table data is not connected yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              This page is now free of demo table data. The next
              backend step will connect real restaurant tables
              from MongoDB, including table numbers, capacity,
              QR tokens, availability, and active orders.
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Planned API: GET /api/tables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TablesPage;