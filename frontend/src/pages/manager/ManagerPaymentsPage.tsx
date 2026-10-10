import { useCallback, useEffect, useState } from "react";
import { Banknote, Check, CreditCard, RefreshCw, X } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getManagerPayments,
  updateManagerPayment,
  type ManagerPayment,
} from "../../services/managerService";

const timeZone = "Asia/Kathmandu";
const todayInRestaurantTimeZone = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
};
const paymentMethodLabel: Record<NonNullable<ManagerPayment["paymentMethod"]>, string> = {
  cash: "Cash",
  esewa: "eSewa",
  khalti: "Khalti",
  bank_qr: "Bank QR",
};
const tableNumberFor = (order: ManagerPayment) =>
  typeof order.tableId === "string" ? "—" : order.tableId?.tableNumber ?? "—";

function ManagerPaymentsPage() {
  const [payments, setPayments] = useState<ManagerPayment[]>([]);
  const [date, setDate] = useState(todayInRestaurantTimeZone);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setPayments(await getManagerPayments(date));
    } catch (cause) {
      console.error("Failed to load manager payments:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }, [date]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const act = async (payment: ManagerPayment, action: "confirm" | "reject") => {
    setBusy(payment._id);
    setError("");
    try {
      await updateManagerPayment(payment.tableSessionId, action);
      await load();
    } catch (cause) {
      console.error("Failed to verify manager payment:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to update payment.");
    } finally {
      setBusy("");
    }
  };

  const paid = payments.filter((payment) => payment.paymentStatus === "paid");
  const totalPaid = paid.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  const paidByMethod = (method: NonNullable<ManagerPayment["paymentMethod"]>) =>
    paid.filter((payment) => payment.paymentMethod === method)
      .reduce((sum, payment) => sum + payment.paymentAmount, 0);
  const selectedDay = new Date(`${date}T12:00:00+05:45`);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Payment desk</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Payments</h1><p className="mt-2 text-sm text-slate-500">Daily payment activity, collection status, and payment source.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="payment-date" className="text-sm font-medium text-slate-600">Business day</label>
          <input
            id="payment-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
        <Button type="button" variant="outline" onClick={() => void load()}><RefreshCw size={15} /> Refresh</Button>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Collected {selectedDay.toLocaleDateString("en-NP", { timeZone })}</p><p className="mt-2 text-2xl font-bold">NPR {totalPaid.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{paid.length} confirmed payments</p></Card>
        {(["cash", "esewa", "khalti", "bank_qr"] as const).map((method) => (
          <Card key={method}>
            <div className="flex items-center gap-2 text-slate-500">
              {method === "cash" ? <Banknote size={16} /> : <CreditCard size={16} />}
              <p className="text-xs font-semibold uppercase tracking-wide">{paymentMethodLabel[method]}</p>
            </div>
            <p className="mt-2 text-2xl font-bold">NPR {paidByMethod(method).toLocaleString()}</p>
          </Card>
        ))}
      </div>
      {loading ? <Card><p className="text-sm text-slate-500">Loading payments…</p></Card> : payments.length === 0 ? (
        <Card className="py-12 text-center"><h2 className="font-semibold">No payment activity for this day</h2><p className="mt-1 text-sm text-slate-500">Payment requests and completed collections will appear here.</p></Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Bill / table</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Paid from</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Payment time (Nepal)</th><th className="px-5 py-3">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const status = payment.paymentStatus ?? "unpaid";
                  const method = payment.paymentMethod;
                  const activityTime = status === "paid" || status === "rejected" || status === "pending_verification"
                    ? payment.updatedAt
                    : payment.createdAt;
                  const timeLabel = status === "paid"
                    ? "Confirmed"
                    : status === "rejected"
                      ? "Rejected"
                      : status === "pending_verification"
                        ? "Submitted"
                        : "Requested";
                  const canConfirm = payment.canConfirm;
                  const canReject = payment.canReject;
                  const bankDetails = payment.paymentDetails;
                  return (
                    <tr key={payment._id}>
                      <td className="px-5 py-4"><p className="text-sm font-semibold">{payment.orderNumber}</p><p className="mt-1 text-xs text-slate-500">Table {tableNumberFor(payment)}</p></td>
                      <td className="px-5 py-4"><p className="text-sm font-semibold">NPR {payment.paymentAmount.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">Bill total NPR {payment.total.toLocaleString()}</p></td>
                      <td className="px-5 py-4 text-sm">
                        <p className="font-semibold">{method ? paymentMethodLabel[method] : "—"}</p>
                        {method === "bank_qr" && (
                          <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                            {bankDetails?.bankName && <p>Bank: {bankDetails.bankName}</p>}
                            {bankDetails?.accountName && <p>Account name: {bankDetails.accountName}</p>}
                            {bankDetails?.accountNumber && <p>Account no.: {bankDetails.accountNumber}</p>}
                          </div>
                        )}
                        {method === "cash" && <p className="mt-1 text-xs text-slate-500">Paid at counter</p>}
                      </td>
                      <td className="px-5 py-4"><Badge variant={status === "paid" ? "success" : status === "pending_verification" || status === "pending" ? "warning" : status === "rejected" ? "danger" : "default"}>{status.replaceAll("_", " ")}</Badge></td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {activityTime ? <><p className="font-semibold">{timeLabel}</p><p className="mt-1">{new Date(activityTime).toLocaleString("en-NP", { timeZone })}</p></> : "Time not recorded"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {canConfirm && <Button type="button" size="sm" disabled={busy === payment._id} onClick={() => void act(payment, "confirm")}><Check size={14} />{method === "cash" ? "Confirm cash" : "Confirm"}</Button>}
                          {canReject && <button type="button" disabled={busy === payment._id} onClick={() => void act(payment, "reject")} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-red-700 hover:bg-red-50"><X size={14} />Reject</button>}
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
