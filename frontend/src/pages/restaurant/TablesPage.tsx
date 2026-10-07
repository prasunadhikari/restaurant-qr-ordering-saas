import { useEffect, useMemo, useState } from "react";
import { Plus, Table2, Trash2 } from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from "../../services/restaurantDashboardService";
import type { RestaurantTable } from "../../services/restaurantDashboardService";

function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getTables()
      .then((data) => {
        if (active) setTables(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error("Failed to load restaurant tables:", err);
        setError(err instanceof Error ? err.message : "Unable to load tables.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleTables = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tables.filter((table) =>
      (filter === "all" || table.status === filter) &&
      (!query || table.tableNumber.toLowerCase().includes(query)),
    );
  }, [tables, search, filter]);

  const addTable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const table = await createTable({
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity),
      });
      setTables((current) => [...current, table].sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)));
      setTableNumber("");
      setCapacity("2");
    } catch (err) {
      console.error("Failed to create restaurant table:", err);
      setError(err instanceof Error ? err.message : "Unable to create table.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (table: RestaurantTable) => {
    try {
      const updated = await updateTable(table._id, {
        status: table.status === "occupied" ? "available" : "occupied",
      });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (err) {
      console.error("Failed to update table status:", err);
      setError(err instanceof Error ? err.message : "Unable to update table.");
    }
  };

  const editTable = async (table: RestaurantTable) => {
    const nextNumber = window.prompt("Table number", table.tableNumber);
    if (nextNumber === null) return;
    const nextCapacity = window.prompt("Seating capacity", String(table.capacity));
    if (nextCapacity === null) return;
    try {
      const updated = await updateTable(table._id, {
        tableNumber: nextNumber.trim(),
        capacity: Number(nextCapacity),
      });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (err) {
      console.error("Failed to edit restaurant table:", err);
      setError(err instanceof Error ? err.message : "Unable to edit table.");
    }
  };

  const removeTable = async (table: RestaurantTable) => {
    if (!window.confirm(`Delete table ${table.tableNumber}?`)) return;
    try {
      await deleteTable(table._id);
      setTables((current) => current.filter((entry) => entry._id !== table._id));
    } catch (err) {
      console.error("Failed to delete restaurant table:", err);
      setError(err instanceof Error ? err.message : "Unable to delete table.");
    }
  };

  if (loading) return <Card><p className="text-sm text-slate-500">Loading tables…</p></Card>;

  const availableCount = tables.filter((table) => table.status === "available").length;
  const occupiedCount = tables.length - availableCount;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Restaurant floor</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Tables</h2>
        <p className="mt-1 text-sm text-slate-500">Manage table capacity, availability, and QR codes.</p>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Total tables</p><p className="mt-2 text-2xl font-bold">{tables.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Available</p><p className="mt-2 text-2xl font-bold text-emerald-600">{availableCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Occupied</p><p className="mt-2 text-2xl font-bold text-amber-600">{occupiedCount}</p></Card>
      </div>

      <Card>
        <h3 className="font-bold text-slate-900">Add a table</h3>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={addTable}>
          <Input id="table-number" label="Table number or name" required value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} />
          <Input id="table-capacity" label="Seating capacity" type="number" min="1" step="1" required value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          <div className="self-end"><Button type="submit" disabled={saving}><Plus size={16} /> Add table</Button></div>
        </form>
      </Card>

      <Card padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            aria-label="Search tables"
            placeholder="Search table number…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:max-w-sm"
          />
          <div className="flex gap-2">
            {(["all", "available", "occupied"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${filter === value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{value}</button>
            ))}
          </div>
        </div>
      </Card>

      {visibleTables.length === 0 ? (
        <Card><div className="py-12 text-center"><Table2 className="mx-auto text-slate-300" size={30} /><h3 className="mt-4 font-bold text-slate-900">No tables found</h3><p className="mt-1 text-sm text-slate-500">Add tables above to create restaurant QR codes.</p></div></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTables.map((table) => (
            <Card key={table._id} padding="none" className={`overflow-hidden border-t-4 ${table.status === "occupied" ? "border-t-amber-400" : "border-t-emerald-400"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Table</p><h3 className="mt-1 text-3xl font-bold text-slate-900">{table.tableNumber}</h3></div>
                  <Badge variant={table.status === "occupied" ? "warning" : "success"}>{table.status}</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-500">Seats {table.capacity}</p>
                <p className="mt-1 text-xs text-slate-400">Unique QR code ready</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => void editTable(table)}>Edit</Button>
                  <Button type="button" variant={table.status === "occupied" ? "secondary" : "primary"} size="sm" onClick={() => void toggleStatus(table)}>{table.status === "occupied" ? "Free table" : "Occupy"}</Button>
                </div>
                <button type="button" onClick={() => void removeTable(table)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"><Trash2 size={13} /> Delete table</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TablesPage;
