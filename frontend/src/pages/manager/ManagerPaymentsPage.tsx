import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getManagerPayments,
  updateManagerPayment,
  type ManagerBill,
} from "../../services/managerService";

const tableNumberFor = (order: ManagerBill) =>
  typeof order.tableId === "string" ? "—" : order.tableId?.tableNumber ?? "—";

function ManagerPaymentsPage() {
  const [orders, setOrders] = useState<ManagerBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setOrders(await getManagerPayments());
    } catch (cause) {
      console.error("Failed to load manager payments:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void Promise.resolve().then(load); }, []);

  const act = async (order: ManagerBill, action: "confirm" | "reject") => {
    setBusy(order._id);
    setError("");
    try {
      const paymentStatus = await updateManagerPayment(order._id, action);
      if (paymentStatus === "paid" || paymentStatus === "unpaid" || paymentStatus === "rejected") {
        setOrders((current) => current.filter((entry) => entry._id !== order._id));
      }
    } catch (cause) {
      console.error("Failed to verify manager payment:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update payment.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Payment desk</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Payments</h1><p className="mt-2 text-sm text-slate-500">Verify counter cash and customer-submitted QR payments.</p></div>
        <Button type="button" variant="outline" onClick={() => void load()}><RefreshCw size={15} /> Refresh</Button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <Card><p className="text-sm text-slate-500">Loading payments…</p></Card> : orders.length === 0 ? (
        <Card className="py-12 text-center"><h2 className="font-semibold">No payments to review</h2><p className="mt-1 text-sm text-slate-500">Customer payment activity will appear here.</p></Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Table</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const status = order.paymentStatus ?? "unpaid";
                  const canConfirm = status === "pending" || status === "pending_verification";
                  const canReject = status === "pending_verification" && order.paymentMethod !== "cash";
                  return (
                    <tr key={order._id}>
                      <td className="px-5 py-4 text-sm font-semibold">{order.orderNumber}</td>
                      <td className="px-5 py-4 text-sm">Table {tableNumberFor(order)}</td>
                      <td className="px-5 py-4 text-sm font-semibold">NPR {order.paymentAmount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm capitalize">{order.paymentMethod?.replace("_", " ") ?? "—"}</td>
                      <td className="px-5 py-4"><Badge variant={status === "paid" ? "success" : status === "pending_verification" ? "warning" : status === "rejected" ? "danger" : "default"}>{status.replaceAll("_", " ")}</Badge></td>
                      <td className="px-5 py-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {canConfirm && <Button type="button" size="sm" disabled={busy === order._id} onClick={() => void act(order, "confirm")}><Check size={14} />{order.paymentMethod === "cash" ? "Confirm cash" : "Confirm"}</Button>}
                          {canReject && <button type="button" disabled={busy === order._id} onClick={() => void act(order, "reject")} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-700 hover:bg-red-50"><X size={14} />Reject</button>}
                          {!canConfirm && !canReject && <span className="text-xs text-slate-400">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ManagerPaymentsPage;
