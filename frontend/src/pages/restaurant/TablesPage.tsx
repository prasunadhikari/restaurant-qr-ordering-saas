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

const initialTables: RestaurantTable[] = [
  { id: "1", tableNumber: "01", capacity: 2, status: "available" },
  { id: "2", tableNumber: "02", capacity: 2, status: "available" },
  {
    id: "3",
    tableNumber: "03",
    capacity: 4,
    status: "occupied",
    currentOrder: "#KTM-1041",
  },
  { id: "4", tableNumber: "04", capacity: 4, status: "available" },
  {
    id: "5",
    tableNumber: "05",
    capacity: 4,
    status: "occupied",
    currentOrder: "#KTM-1039",
  },
  { id: "6", tableNumber: "06", capacity: 6, status: "available" },
  { id: "7", tableNumber: "07", capacity: 2, status: "available" },
  {
    id: "8",
    tableNumber: "08",
    capacity: 4,
    status: "occupied",
    currentOrder: "#KTM-1042",
  },
  { id: "9", tableNumber: "09", capacity: 4, status: "available" },
  { id: "10", tableNumber: "10", capacity: 6, status: "available" },
  { id: "11", tableNumber: "11", capacity: 2, status: "available" },
  {
    id: "12",
    tableNumber: "12",
    capacity: 4,
    status: "occupied",
    currentOrder: "#KTM-1040",
  },
  { id: "13", tableNumber: "13", capacity: 4, status: "available" },
  { id: "14", tableNumber: "14", capacity: 2, status: "available" },
  { id: "15", tableNumber: "15", capacity: 6, status: "available" },
  {
    id: "16",
    tableNumber: "16",
    capacity: 4,
    status: "occupied",
    currentOrder: "#KTM-1038",
  },
  { id: "17", tableNumber: "17", capacity: 2, status: "available" },
  { id: "18", tableNumber: "18", capacity: 4, status: "available" },
  { id: "19", tableNumber: "19", capacity: 4, status: "available" },
  { id: "20", tableNumber: "20", capacity: 6, status: "available" },
];

function TablesPage() {
  const [tables, setTables] =
    useState<RestaurantTable[]>(initialTables);

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

  const toggleTableStatus = (id: string) => {
    setTables((current) =>
      current.map((table) => {
        if (table.id !== id) {
          return table;
        }

        if (table.status === "occupied") {
          return {
            ...table,
            status: "available",
            currentOrder: undefined,
          };
        }

        return {
          ...table,
          status: "occupied",
          currentOrder: "#DEMO",
        };
      }),
    );
  };

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

        <Button type="button">
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
                    filter.value as
                      | "all"
                      | TableStatus,
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
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No tables found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter.
            </p>
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
                {/* Top */}
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

                {/* Details */}
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

                {/* Actions */}
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
                    onClick={() =>
                      toggleTableStatus(
                        table.id,
                      )
                    }
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

      {/* Demo note */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
        <div className="flex gap-3">
          <div className="mt-0.5 text-lg">
            ℹ️
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Demo mode
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Table status is currently stored in browser
              memory. Once the backend is connected, table
              status, QR tokens and orders will be stored per
              restaurant in MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TablesPage;