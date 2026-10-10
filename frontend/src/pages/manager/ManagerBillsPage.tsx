import { useEffect, useState } from "react";
import { Printer, ReceiptText, Settings2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getManagerBills, type ManagerBill, type ManagerProfile } from "../../services/managerService";

type ReceiptPaperSize = "58mm" | "80mm" | "A4";
const PAPER_SIZE_KEY = "aaganManagerReceiptPaperSize";
const paperSizes: ReceiptPaperSize[] = ["58mm", "80mm", "A4"];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);

function ManagerBillsPage() {
  const profile = useOutletContext<ManagerProfile | null>();
  const [bills, setBills] = useState<ManagerBill[]>([]);
  const [selected, setSelected] = useState<ManagerBill | null>(null);
  const [paperSize, setPaperSize] = useState<ReceiptPaperSize>(() => {
    const saved = localStorage.getItem(PAPER_SIZE_KEY);
    return paperSizes.find((size) => size === saved) ?? "80mm";
  });
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

  const table = (bill: ManagerBill) =>
    typeof bill.tableId === "string" ? "—" : bill.tableId?.tableNumber ?? "—";

  const printBill = (order: ManagerBill) => {
    const printWindow = window.open("", "_blank", "width=520,height=760");
    if (!printWindow) {
      setError("Allow pop-ups for this site to print a bill.");
      return;
    }
    setError("");

    const restaurantName = escapeHtml(profile?.restaurant.name ?? "Restaurant");
    const safeOrderNumber = escapeHtml(order.orderNumber);
    const tableNumber = escapeHtml(table(order));
    const paymentMethod = escapeHtml(order.paymentMethod?.replaceAll("_", " ") ?? "—");
    const paymentStatus = escapeHtml((order.paymentStatus ?? "unpaid").replaceAll("_", " "));
    const paidAmount = order.paidAmount;
    const amountDue = Math.max(0, order.total - paidAmount);
    const orderDate = escapeHtml(new Date(order.createdAt).toLocaleString());
    const isA4 = paperSize === "A4";
    const pageSize = isA4 ? "A4 portrait" : `${paperSize} auto`;
    const pageMargin = isA4 ? "12mm" : "3mm";
    const contentWidth = isA4 ? "90mm" : paperSize;
    const rows = order.items.map((item) => `
      <div class="item">
        <span class="item-name">${escapeHtml(item.name)} <small>× ${item.quantity}</small></span>
        <span class="item-price">NPR ${(item.unitPrice * item.quantity).toLocaleString()}</span>
      </div>
      ${item.specialInstructions ? `<p class="note">Note: ${escapeHtml(item.specialInstructions)}</p>` : ""}
    `).join("");

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Bill ${safeOrderNumber} · ${restaurantName}</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: ${pageSize}; margin: ${pageMargin}; }
            html, body { margin: 0; padding: 0; }
            body {
              width: ${contentWidth}; max-width: 100%; margin: 0 auto; padding: 4mm;
              color: #111; background: #fff;
              font: 10pt/1.4 Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            h1 { margin: 0; font-size: 19pt; letter-spacing: .08em; }
            .restaurant { margin-top: 1mm; font-size: 12pt; font-weight: 700; }
            .subtitle { margin-top: 1mm; color: #555; font-size: 8pt; }
            .meta { display: flex; justify-content: space-between; gap: 4mm; margin-top: 5mm; padding: 3mm 0; border-top: 1px dashed #777; border-bottom: 1px dashed #777; }
            .meta-date { max-width: 48%; text-align: right; font-size: 8pt; color: #444; }
            .items { padding: 2mm 0; }
            .item { display: flex; justify-content: space-between; gap: 3mm; padding: 1.7mm 0; }
            .item-name { min-width: 0; overflow-wrap: anywhere; }
            .item-name small { white-space: nowrap; color: #444; }
            .item-price { flex: 0 0 auto; white-space: nowrap; }
            .note { margin: 0 0 1mm; color: #555; font-size: 8pt; }
            .total { display: flex; justify-content: space-between; margin-top: 1mm; padding-top: 3mm; border-top: 1px solid #111; font-size: 13pt; font-weight: 700; }
            .payment-summary { display: flex; justify-content: space-between; gap: 3mm; margin-top: 2mm; font-size: 9pt; }
            .payment { display: flex; justify-content: space-between; gap: 3mm; margin-top: 2mm; font-size: 9pt; }
            .thanks { margin-top: 7mm; text-align: center; font-size: 8pt; color: #444; }
            @media screen { body { min-height: 100vh; padding-top: 8mm; } }
          </style>
        </head>
        <body>
          <main>
            <header>
              <h1>AAGAN</h1>
              <p class="restaurant">${restaurantName}</p>
              <p class="subtitle">Restaurant bill</p>
            </header>
            <section class="meta">
              <div><strong>Bill #${safeOrderNumber}</strong><br />Table ${tableNumber}</div>
              <div class="meta-date">${orderDate}</div>
            </section>
            <section class="items">${rows}</section>
            <div class="total"><span>Total</span><span>NPR ${order.total.toLocaleString()}</span></div>
            <div class="payment-summary"><span>Paid</span><span>NPR ${paidAmount.toLocaleString()}</span></div>
            <div class="payment-summary"><strong>Due</strong><strong>NPR ${amountDue.toLocaleString()}</strong></div>
            <div class="payment"><span>Payment</span><span>${paymentMethod}</span></div>
            <div class="payment"><span>Status</span><span>${paymentStatus}</span></div>
            <p class="thanks">Thank you for dining with us.</p>
          </main>
          <script>window.addEventListener("load", function () { window.setTimeout(function () { window.print(); }, 200); });</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  const changePaperSize = (value: string) => {
    const size = paperSizes.find((option) => option === value);
    if (!size) return;
    setPaperSize(size);
    localStorage.setItem(PAPER_SIZE_KEY, size);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Order close-out</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Bills</h1>
        <p className="mt-2 text-sm text-slate-500">Each table session has one combined bill with its orders.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <Card className="border-[#e8e0cf] bg-[#fbf9f2]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#173b32]"><Settings2 size={19} /></span>
            <div>
              <h2 className="font-semibold text-[#173b32]">Receipt printer settings</h2>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">Choose your receipt width. In the print dialog, select any printer connected to this device, including a thermal receipt printer.</p>
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-3 text-sm font-medium text-slate-700">
            Paper size
            <select
              aria-label="Receipt paper size"
              value={paperSize}
              onChange={(event) => changePaperSize(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3"
            >
              <option value="58mm">58 mm thermal</option>
              <option value="80mm">80 mm thermal</option>
              <option value="A4">A4 paper</option>
            </select>
          </label>
        </div>
      </Card>
      <p className="text-xs text-slate-500">Printer selection is handled by your browser’s print dialog. Direct printer pairing is not available from this web portal.</p>

      {loading ? <Card><p className="text-sm text-slate-500">Loading bills…</p></Card> : bills.length === 0 ? (
        <Card className="py-12 text-center"><ReceiptText className="mx-auto text-slate-300" /><h2 className="mt-3 font-semibold">No bills yet</h2></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <div className="space-y-2">
            {bills.map((order) => (
              <button key={order._id} type="button" onClick={() => setSelected(order)} className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-4 text-left hover:border-emerald-300 ${selected?._id === order._id ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>
                <span><span className="block text-sm font-bold">Table {table(order)}</span><span className="mt-1 block text-xs text-slate-500">{order.items.length} bill lines · {new Date(order.createdAt).toLocaleString()}</span></span>
                <span className="text-right"><span className="block text-sm font-semibold">NPR {order.total.toLocaleString()}</span><span className="mt-1 block text-xs capitalize text-slate-500">{(order.paymentStatus ?? "unpaid").replaceAll("_", " ")}</span></span>
              </button>
            ))}
          </div>
          {selected ? (
            <Card>
              <div className="mx-auto max-w-sm">
                <div className="text-center"><p className="font-serif text-2xl font-bold tracking-wide">AAGAN</p><p className="mt-1 text-lg font-semibold">{profile?.restaurant.name}</p><p className="mt-1 text-xs text-slate-500">Restaurant bill</p></div>
                <div className="mt-5 flex justify-between border-y border-dashed border-slate-300 py-3 text-sm"><div><p className="font-bold">Combined table bill</p><p className="mt-1 text-slate-500">Table {table(selected)}</p></div><p className="text-right text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString()}</p></div>
                <div className="py-3">{selected.items.map((item, index) => <div key={`${selected._id}-${index}`} className="flex justify-between gap-3 py-2 text-sm"><span>{item.name}<span className="ml-1 text-xs text-slate-500">× {item.quantity}</span></span><span className="shrink-0">NPR {(item.unitPrice * item.quantity).toLocaleString()}</span></div>)}</div>
                <div className="border-t border-slate-300 pt-3"><div className="flex justify-between text-base font-bold"><span>Total</span><span>NPR {selected.total.toLocaleString()}</span></div><div className="mt-2 flex justify-between text-sm"><span>Paid</span><span>NPR {selected.paidAmount.toLocaleString()}</span></div><div className="mt-2 flex justify-between text-sm font-semibold"><span>Due</span><span>NPR {Math.max(0, selected.total - selected.paidAmount).toLocaleString()}</span></div><div className="mt-4 flex justify-between text-sm"><span>Payment</span><span className="capitalize">{selected.paymentMethod?.replaceAll("_", " ") ?? "—"}</span></div><div className="mt-2 flex items-center justify-between text-sm"><span>Status</span><Badge variant={selected.paymentStatus === "paid" ? "success" : "warning"}>{(selected.paymentStatus ?? "unpaid").replaceAll("_", " ")}</Badge></div></div>
              </div>
              <div className="mt-6 flex justify-end"><Button type="button" onClick={() => printBill(selected)}><Printer size={16} /> Print bill</Button></div>
            </Card>
          ) : <Card className="hidden items-center justify-center text-center text-sm text-slate-500 lg:flex">Select an order to view its bill.</Card>}
        </div>
      )}
    </div>
  );
}

export default ManagerBillsPage;
