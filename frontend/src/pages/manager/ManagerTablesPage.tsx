import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Table2, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import type { ManagerProfile, ManagerTable } from "../../services/managerService";
import {
  createManagerTable,
  deleteManagerTable,
  getManagerTables,
  updateManagerTable,
} from "../../services/managerService";

function ManagerTablesPage() {
  const profile = useOutletContext<ManagerProfile | null>();
  const [tables, setTables] = useState<ManagerTable[]>([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "occupied">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      setTables(await getManagerTables());
    } catch (cause) {
      console.error("Failed to load manager tables:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void Promise.resolve().then(load); }, []);

  const visibleTables = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tables.filter((table) =>
      (filter === "all" || table.status === filter) &&
      (!query || table.tableNumber.toLowerCase().includes(query)),
    );
  }, [filter, search, tables]);

  const addTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const table = await createManagerTable(number.trim(), Number(capacity));
      setTables((current) => [...current, table].sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)));
      setNumber("");
      setCapacity("2");
    } catch (cause) {
      console.error("Failed to add manager table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to add table.");
    } finally {
      setSaving(false);
    }
  };

  const editTable = async (table: ManagerTable) => {
    const tableNumber = window.prompt("Table number or name", table.tableNumber);
    if (tableNumber === null) return;
    const seats = window.prompt("Seating capacity", String(table.capacity));
    if (seats === null) return;
    setBusy(table._id);
    setError("");
    try {
      const updated = await updateManagerTable(table._id, {
        tableNumber: tableNumber.trim(),
        capacity: Number(seats),
      });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to edit manager table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to edit table.");
    } finally {
      setBusy("");
    }
  };

  const toggleEnabled = async (table: ManagerTable) => {
    setBusy(table._id);
    setError("");
    try {
      const updated = await updateManagerTable(table._id, { isActive: table.isActive === false });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to change manager table availability:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to change table availability.");
    } finally {
      setBusy("");
    }
  };

  const removeTable = async (table: ManagerTable) => {
    if (!window.confirm(`Delete table ${table.tableNumber}? Tables with order history cannot be deleted.`)) return;
    setBusy(table._id);
    setError("");
    try {
      await deleteManagerTable(table._id);
      setTables((current) => current.filter((entry) => entry._id !== table._id));
    } catch (cause) {
      console.error("Failed to delete manager table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to delete table.");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <Card><p className="text-sm text-slate-500">Loading tables…</p></Card>;

  const availableCount = tables.filter((table) => table.status === "available").length;
  const occupiedCount = tables.length - availableCount;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Restaurant floor</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Tables</h1>
        <p className="mt-1 text-sm text-slate-500">{profile?.restaurant.name} · Manage table capacity and availability.</p>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Total tables</p><p className="mt-2 text-2xl font-bold">{tables.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Available</p><p className="mt-2 text-2xl font-bold text-emerald-600">{availableCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Occupied</p><p className="mt-2 text-2xl font-bold text-amber-600">{occupiedCount}</p></Card>
      </div>

      <Card>
        <h2 className="font-bold text-slate-900">Add a table</h2>
        <form onSubmit={addTable} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input id="manager-table-number" label="Table number or name" required value={number} onChange={(event) => setNumber(event.target.value)} />
          <Input id="manager-table-capacity" label="Seating capacity" type="number" min="1" step="1" required value={capacity} onChange={(event) => setCapacity(event.target.value)} />
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
        <Card>
          <div className="py-12 text-center">
            <Table2 className="mx-auto text-slate-300" size={30} />
            <h2 className="mt-4 font-bold text-slate-900">{tables.length ? "No tables found" : "No tables yet"}</h2>
            <p className="mt-1 text-sm text-slate-500">{tables.length ? "Try another table number or filter." : "Add a table above to create its customer QR code."}</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTables.map((table) => {
            const active = table.isActive !== false;
            return (
              <Card key={table._id} padding="none" className={`overflow-hidden border-t-4 ${table.status === "occupied" ? "border-t-amber-400" : "border-t-emerald-400"} ${!active ? "opacity-75" : ""}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Table</p><h2 className="mt-1 text-3xl font-bold text-slate-900">{table.tableNumber}</h2></div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={table.status === "occupied" ? "warning" : "success"}>{table.status}</Badge>
                      <Badge variant={active ? "info" : "default"}>{active ? "Enabled" : "Disabled"}</Badge>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">Seats {table.capacity}</p>
                  <p className="mt-1 text-xs text-slate-400">{active ? "Unique menu QR code ready" : "QR ordering disabled"}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={busy === table._id} onClick={() => void editTable(table)}>Edit</Button>
                    <Button type="button" variant="outline" size="sm" disabled={busy === table._id} onClick={() => void toggleEnabled(table)}>{active ? "Disable QR" : "Enable QR"}</Button>
                  </div>
                  <button type="button" disabled={busy === table._id} onClick={() => void removeTable(table)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"><Trash2 size={13} /> Delete table</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ManagerTablesPage;
