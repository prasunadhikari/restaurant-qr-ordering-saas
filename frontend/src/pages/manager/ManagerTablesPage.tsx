import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import {
  createManagerTable,
  deleteManagerTable,
  getManagerTables,
  updateManagerTable,
  type ManagerTable,
} from "../../services/managerService";
import { useOutletContext } from "react-router-dom";
import type { ManagerProfile } from "../../services/managerService";

function ManagerTablesPage() {
  const profile = useOutletContext<ManagerProfile | null>();
  const [tables, setTables] = useState<ManagerTable[]>([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [expanded, setExpanded] = useState("");
  const baseUrl = window.location.origin;

  const load = async () => {
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
    try {
      const updated = await updateManagerTable(table._id, { tableNumber: tableNumber.trim(), capacity: Number(seats) });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to edit table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to edit table.");
    } finally {
      setBusy("");
    }
  };

  const toggleEnabled = async (table: ManagerTable) => {
    setBusy(table._id);
    try {
      const updated = await updateManagerTable(table._id, { isActive: table.isActive === false });
      setTables((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (cause) {
      console.error("Failed to change table availability:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to change table availability.");
    } finally {
      setBusy("");
    }
  };

  const removeTable = async (table: ManagerTable) => {
    if (!window.confirm(`Delete table ${table.tableNumber}? Tables with order history cannot be deleted.`)) return;
    try {
      await deleteManagerTable(table._id);
      setTables((current) => current.filter((entry) => entry._id !== table._id));
    } catch (cause) {
      console.error("Failed to delete table:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to delete table.");
    }
  };

  const menuUrl = (table: ManagerTable) =>
    `${baseUrl}/r/${encodeURIComponent(profile?.restaurant.slug ?? "")}/t/${encodeURIComponent(table.tableNumber)}`;

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Dining room</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Tables & QR</h1><p className="mt-2 text-sm text-slate-500">Manage table availability and print the same customer menu QR links used across Aagan.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <Card>
        <h2 className="font-semibold">Add a table</h2>
        <form onSubmit={addTable} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input id="manager-table-number" label="Table number or name" required value={number} onChange={(event) => setNumber(event.target.value)} />
          <Input id="manager-table-capacity" label="Seating capacity" type="number" min="1" step="1" required value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          <div className="self-end"><Button type="submit" disabled={saving}><Plus size={16} /> Add table</Button></div>
        </form>
      </Card>
      {loading ? <Card><p className="text-sm text-slate-500">Loading tables…</p></Card> : tables.length === 0 ? (
        <Card className="py-12 text-center"><h2 className="font-semibold">No tables yet</h2><p className="mt-1 text-sm text-slate-500">Add a table to create its QR menu link.</p></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            const url = menuUrl(table);
            const active = table.isActive !== false;
            return <Card key={table._id} className={!active ? "opacity-70" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Table</p><h2 className="mt-1 text-2xl font-bold">{table.tableNumber}</h2><p className="mt-1 text-xs text-slate-500">{table.capacity} seats</p></div>
                <div className="flex flex-col items-end gap-1"><Badge variant={table.status === "occupied" ? "warning" : "success"}>{table.status}</Badge><Badge variant={active ? "info" : "default"}>{active ? "Enabled" : "Disabled"}</Badge></div>
              </div>
              <button type="button" onClick={() => setExpanded(expanded === table._id ? "" : table._id)} className="mt-4 flex w-full justify-center rounded-xl border border-slate-100 bg-slate-50 p-4" aria-expanded={expanded === table._id}>
                <QRCodeSVG value={url} size={148} level="H" includeMargin />
              </button>
              {expanded === table._id && <p className="mt-2 break-all text-center text-xs text-slate-500">{url}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={14} /> Open menu</a>
                <button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Printer size={14} /> Print QR</button>
                <button type="button" disabled={busy === table._id} onClick={() => void editTable(table)} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={14} /> Edit</button>
                <button type="button" disabled={busy === table._id} onClick={() => void toggleEnabled(table)} className="min-h-10 rounded-xl border border-slate-200 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{active ? "Disable" : "Enable"}</button>
                <button type="button" onClick={() => void removeTable(table)} className="col-span-2 inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 size={14} /> Delete table</button>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">QR routes to {profile?.restaurant.name} · Table {table.tableNumber}</p>
            </Card>;
          })}
        </div>
      )}
    </div>
  );
}

export default ManagerTablesPage;
