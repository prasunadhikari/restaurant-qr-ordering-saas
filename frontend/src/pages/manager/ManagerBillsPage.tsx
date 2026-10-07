import { useEffect, useState } from "react";
import { Printer, ReceiptText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getManagerBills, type ManagerOrder } from "../../services/managerService";
import { useOutletContext } from "react-router-dom";
import type { ManagerProfile } from "../../services/managerService";

function ManagerBillsPage() {
  const profile = useOutletContext<ManagerProfile | null>();
  const [bills, setBills] = useState<ManagerOrder[]>([]);
  const [selected, setSelected] = useState<ManagerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getManagerBills().then((data) => { if (active) setBills(data); })
      .catch((cause: unknown) => {
        console.error("Failed to load manager bills:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load bills.");
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const table = (order: ManagerOrder) =>
    typeof order.tableId === "string" ? "—" : order.tableId?.tableNumber ?? "—";

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Order close-out</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Bills</h1><p className="mt-2 text-sm text-slate-500">Review or print a bill from an existing restaurant order.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <Card><p className="text-sm text-slate-500">Loading bills…</p></Card> : bills.length === 0 ? (
        <Card className="py-12 text-center"><ReceiptText className="mx-auto text-slate-300" /><h2 className="mt-3 font-semibold">No bills yet</h2></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <div className="space-y-2">
            {bills.map((order) => (
              <button key={order._id} type="button" onClick={() => setSelected(order)} className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-4 text-left hover:border-emerald-300 ${selected?._id === order._id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>
                <span><span className="block text-sm font-bold">#{order.orderNumber}</span><span className="mt-1 block text-xs text-slate-500">Table {table(order)} · {new Date(order.createdAt).toLocaleString()}</span></span>
                <span className="text-right"><span className="block text-sm font-semibold">NPR {order.total.toLocaleString()}</span><span className="mt-1 block text-xs capitalize text-slate-500">{(order.paymentStatus ?? "unpaid").replaceAll("_", " ")}</span></span>
              </button>
            ))}
          </div>
          {selected ? (
            <Card className="print:fixed print:inset-0 print:z-50 print:rounded-none print:border-0 print:p-10 print:shadow-none">
              <div id="manager-bill" className="manager-bill-print mx-auto max-w-sm">
                <div className="text-center"><p className="font-serif text-2xl font-bold tracking-wide">AAGAN</p><p className="mt-1 text-lg font-semibold">{profile?.restaurant.name}</p><p className="mt-1 text-xs text-slate-500">Restaurant bill</p></div>
                <div className="mt-5 flex justify-between border-y border-dashed border-slate-300 py-3 text-sm"><div><p className="font-bold">Bill #{selected.orderNumber}</p><p className="mt-1 text-slate-500">Table {table(selected)}</p></div><p className="text-right text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString()}</p></div>
                <div className="py-3">{selected.items.map((item, index) => <div key={`${selected._id}-${index}`} className="flex justify-between gap-3 py-2 text-sm"><span>{item.name}<span className="ml-1 text-xs text-slate-500">× {item.quantity}</span></span><span className="shrink-0">NPR {(item.unitPrice * item.quantity).toLocaleString()}</span></div>)}</div>
                <div className="border-t border-slate-300 pt-3"><div className="flex justify-between text-base font-bold"><span>Total</span><span>NPR {selected.total.toLocaleString()}</span></div><div className="mt-4 flex justify-between text-sm"><span>Payment</span><span className="capitalize">{selected.paymentMethod?.replace("_", " ") ?? "—"}</span></div><div className="mt-2 flex items-center justify-between text-sm"><span>Status</span><Badge variant={selected.paymentStatus === "paid" ? "success" : "warning"}>{(selected.paymentStatus ?? "unpaid").replaceAll("_", " ")}</Badge></div></div>
              </div>
              <div className="mt-6 flex justify-end print:hidden"><Button type="button" onClick={() => window.print()}><Printer size={16} /> Print bill</Button></div>
            </Card>
          ) : <Card className="hidden items-center justify-center text-center text-sm text-slate-500 lg:flex">Select an order to view its bill.</Card>}
        </div>
      )}
    </div>
  );
}

export default ManagerBillsPage;
