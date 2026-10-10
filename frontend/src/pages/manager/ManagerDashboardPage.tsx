import { useEffect, useState } from "react";
import { ArrowRight, Banknote, CheckCircle2, Clock3, CookingPot, ReceiptText, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import {
  attendManagerStaffCall,
  getManagerDashboard,
  getManagerStaffCalls,
  type ManagerDashboard,
  type ManagerStaffCall,
} from "../../services/managerService";

const initial: ManagerDashboard = {
  orders: { pending: 0, accepted: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 },
  pendingPayments: 0,
  todaySales: 0,
  todayOrders: 0,
};

function ManagerDashboardPage() {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffCalls, setStaffCalls] = useState<ManagerStaffCall[]>([]);
  const [attendingCallId, setAttendingCallId] = useState("");

  useEffect(() => {
    let active = true;
    getManagerDashboard()
      .then((result) => { if (active) setData(result); })
      .catch((cause: unknown) => {
        console.error("Failed to load manager dashboard:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load dashboard.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const requests = await getManagerStaffCalls();
        if (active) setStaffCalls(requests.filter((request) => request.status === "pending"));
      } catch (cause) {
        console.error("Failed to load customer staff requests:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load customer requests.");
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const markStaffCallAttended = async (id: string) => {
    setAttendingCallId(id);
    setError("");
    try {
      await attendManagerStaffCall(id);
      setStaffCalls((current) => current.filter((request) => request._id !== id));
    } catch (cause) {
      console.error("Failed to resolve customer staff request:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to resolve this request.");
    } finally {
      setAttendingCallId("");
    }
  };

  const statuses = [
    { label: "Pending", value: data.orders.pending, icon: Clock3, color: "text-amber-700 bg-amber-50" },
    { label: "Accepted", value: data.orders.accepted, icon: CheckCircle2, color: "text-blue-700 bg-blue-50" },
    { label: "Preparing", value: data.orders.preparing, icon: CookingPot, color: "text-orange-700 bg-orange-50" },
    { label: "Ready", value: data.orders.ready, icon: ShoppingBag, color: "text-emerald-800 bg-emerald-50" },
    { label: "Served", value: data.orders.served, icon: CheckCircle2, color: "text-slate-700 bg-slate-100" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Restaurant operations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Manager dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">A clear view of today&apos;s service and payment queue.</p>
        </div>
        <Link to="/manager/orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 text-sm font-semibold text-white hover:bg-[#245747]">
          Open orders <ArrowRight size={16} />
        </Link>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900">Customer requests</h2><p className="mt-1 text-sm text-slate-500">Staff calls are linked to the active table session.</p></div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{staffCalls.length} pending</span>
        </div>
        {staffCalls.length === 0 ? <p className="mt-4 text-sm text-slate-500">No customer requests waiting.</p> : (
          <ul className="mt-4 divide-y divide-slate-100">
            {staffCalls.map((request) => (
              <li key={request._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="font-semibold">Table {typeof request.tableId === "string" ? "—" : request.tableId.tableNumber} · Assistance requested</p><p className="mt-1 text-xs text-slate-500">{new Date(request.createdAt).toLocaleTimeString()}</p></div>
                <button type="button" disabled={attendingCallId === request._id} onClick={() => void markStaffCallAttended(request._id)} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Mark attended</button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statuses.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></span>
            <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{loading ? "—" : value}</p></div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/manager/payments">
          <Card hover className="h-full">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Banknote size={20} /></span>
            <p className="mt-4 text-sm text-slate-500">Payments to review</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{loading ? "—" : data.pendingPayments}</p>
            <p className="mt-3 text-xs font-semibold text-[#173b32]">Review payments <ArrowRight size={14} className="ml-1 inline" /></p>
          </Card>
        </Link>
        <Card>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><ReceiptText size={20} /></span>
          <p className="mt-4 text-sm text-slate-500">Today&apos;s verified sales</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">NPR {loading ? "—" : data.todaySales.toLocaleString()}</p>
        </Card>
        <Card>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><ShoppingBag size={20} /></span>
          <p className="mt-4 text-sm text-slate-500">Orders placed today</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{loading ? "—" : data.todayOrders}</p>
        </Card>
      </div>
      <Card className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="font-semibold text-slate-900">Need to close out a table?</h2><p className="mt-1 text-sm text-slate-500">Review the order bill and payment state before printing.</p></div>
        <Link to="/manager/bills" className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto">View bills <ArrowRight size={15} /></Link>
      </Card>
    </div>
  );
}

export default ManagerDashboardPage;
