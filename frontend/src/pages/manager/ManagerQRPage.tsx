import { useEffect, useMemo, useState } from "react";
import { Download, Printer, QrCode, Search, Sparkles, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useOutletContext } from "react-router-dom";
import RestaurantQrCard from "../../components/restaurant/RestaurantQrCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import type { ManagerProfile, ManagerTable } from "../../services/managerService";
import { getManagerTables } from "../../services/managerService";
import { resolveMediaUrl } from "../../services/api";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);

function ManagerQRPage() {
  const profile = useOutletContext<ManagerProfile | null>();
  const [tables, setTables] = useState<ManagerTable[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState<ManagerTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getManagerTables()
      .then((data) => { if (active) setTables(data); })
      .catch((cause: unknown) => {
        console.error("Failed to load manager table QR codes:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load QR codes.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const restaurantName = profile?.restaurant.name || "Your Restaurant";
  const restaurantLogo = profile?.restaurant.logo ? resolveMediaUrl(profile.restaurant.logo) : "";
  const getCustomerUrl = (tableNumber: string) => {
    if (!profile?.restaurant.slug) return "";
    return `${window.location.origin}/r/${encodeURIComponent(profile.restaurant.slug)}/t/${encodeURIComponent(tableNumber)}`;
  };
  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? tables.filter((table) => table.tableNumber.toLowerCase().includes(query))
      : tables;
  }, [search, tables]);

  const downloadQR = (table: ManagerTable) => {
    const svg =
      document.getElementById(`manager-qr-${table._id}`) ??
      document.getElementById(`manager-qr-preview-${table._id}`);
    if (!svg) {
      setError("Could not prepare this QR code for download. Please try again.");
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(profile?.restaurant.slug || "restaurant").toLowerCase()}-table-${table.tableNumber}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printQR = (table: ManagerTable) => {
    if (table.isActive === false) {
      setError("Enable this table's QR ordering before printing its customer card.");
      return;
    }
    const svg =
      document.getElementById(`manager-qr-${table._id}`) ??
      document.getElementById(`manager-qr-preview-${table._id}`);
    if (!svg) {
      setError("Could not prepare this QR code for printing. Please try again.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=760,height=920");
    if (!printWindow) {
      setError("Allow pop-ups for this site to print a table QR card.");
      return;
    }

    const safeName = escapeHtml(restaurantName);
    const tableNumber = escapeHtml(table.tableNumber);
    const customerUrl = escapeHtml(getCustomerUrl(table.tableNumber));
    const logoUrl = restaurantLogo ? escapeHtml(restaurantLogo) : "";
    const svgBase64 = window.btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg))));
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${safeName} · Table ${tableNumber} menu</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A6 portrait; margin: 0; }
            html, body { margin: 0; min-height: 100%; }
            body {
              display: grid; place-items: center; padding: 12mm;
              background: #ece9e0; color: #173b32;
              font-family: Inter, "Segoe UI", Arial, sans-serif;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .card {
              position: relative; width: 105mm; min-height: 148mm;
              padding: 9mm 8mm 8mm; overflow: hidden;
              border: 1px solid #d8cfb9; border-radius: 5mm;
              background: #fbf9f2; text-align: center;
              box-shadow: 0 12px 38px #173b321c;
            }
            .card:before { position: absolute; top: 0; left: 0; right: 0; height: 3mm; background: #b28a50; content: ""; }
            .brand { display: flex; align-items: center; justify-content: center; gap: 3mm; min-height: 13mm; }
            .brand img, .monogram { width: 12mm; height: 12mm; border-radius: 50%; }
            .brand img { object-fit: cover; }
            .monogram { display: grid; place-items: center; border: 1px solid #b28a50; font-family: Georgia, serif; font-size: 19pt; }
            .restaurant { max-width: 67mm; font: 700 17pt/1.08 Georgia, "Times New Roman", serif; }
            .eyebrow { margin: 6mm 0 2mm; color: #9b7540; font-size: 7pt; font-weight: 700; letter-spacing: 2.1pt; text-transform: uppercase; }
            h1 { margin: 0; font: 25pt/1 Georgia, "Times New Roman", serif; }
            .rule { margin: 5mm 0; color: #b28a50; font-size: 9pt; }
            .qr-frame { display: inline-grid; width: 75mm; height: 75mm; place-items: center; border: 1px solid #e4ddcd; border-radius: 4mm; background: white; padding: 4mm; }
            .qr-frame img { display: block; width: 66mm; height: 66mm; }
            .scan { margin: 5mm 0 1.5mm; font-size: 12pt; font-weight: 800; letter-spacing: 1.3pt; }
            .caption { margin: 0; color: #68736c; font: italic 11pt Georgia, "Times New Roman", serif; }
            .url { margin-top: 5mm; padding: 2.5mm 3mm; border: 1px solid #e5dece; border-radius: 2mm; background: #f5f1e7; color: #52645a; font-size: 6.5pt; overflow-wrap: anywhere; }
            .footer { margin-top: 5mm; color: #9b7540; font-size: 6pt; font-weight: 700; letter-spacing: 1.5pt; text-transform: uppercase; }
            @media print { body { display: block; padding: 0; background: white; } .card { width: 105mm; height: 148mm; min-height: 148mm; margin: 0; border-radius: 0; box-shadow: none; } }
          </style>
        </head>
        <body>
          <main class="card">
            <div class="brand">
              ${logoUrl ? `<img src="${logoUrl}" alt="" />` : `<span class="monogram">${escapeHtml(restaurantName.charAt(0))}</span>`}
              <div class="restaurant">${safeName}</div>
            </div>
            <p class="eyebrow">A seat at our table</p>
            <h1>Table ${tableNumber}</h1>
            <p class="rule">✦</p>
            <div class="qr-frame"><img src="data:image/svg+xml;base64,${svgBase64}" alt="Scan to open the restaurant menu for table ${tableNumber}" /></div>
            <p class="scan">SCAN TO ORDER</p>
            <p class="caption">Good food is just a scan away.</p>
            <div class="url">${customerUrl}</div>
            <p class="footer">Freshly made · Thoughtfully served</p>
          </main>
          <script>window.addEventListener("load", function () { window.setTimeout(function () { window.print(); }, 250); });</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  if (loading || !profile) return <Card><p className="text-sm text-slate-500">Preparing your table QR codes…</p></Card>;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <header className="relative overflow-hidden rounded-3xl bg-[#173b32] px-6 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-9 sm:py-9">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-10 h-44 w-44 rounded-full border border-[#c5a36b]/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#e5d4b1]"><QrCode size={23} /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d7bd8c]">The table-side welcome</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Your menu, one scan away.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Beautiful, table-specific QR cards that take guests straight to {restaurantName}&apos;s menu.</p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <span className="font-serif text-2xl font-semibold text-[#e5d4b1]">{tables.filter((table) => table.isActive !== false).length}</span>
            <span className="text-xs leading-4 text-white/75">active<br />{tables.filter((table) => table.isActive !== false).length === 1 ? "code" : "codes"}</span>
          </div>
        </div>
      </header>

      <Card className="border-[#e8e0cf] bg-[#fbf9f2]">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 shrink-0 text-[#9b7540]" size={18} />
          <div>
            <h2 className="text-sm font-bold text-[#173b32]">Made to look at home on your tables</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Preview each design, then print a crisp A6 table card. Every code opens the menu for that exact table—no restaurant or table selection required.</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Table cards</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a table to preview, download, or print.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input id="manager-qr-search" className="pl-9" placeholder="Find a table…" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {filteredTables.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <QrCode className="mx-auto text-emerald-700" size={26} />
            <h2 className="mt-4 font-bold text-slate-900">{tables.length ? "No tables match your search" : "Your first QR card starts with a table"}</h2>
            <p className="mt-1 text-sm text-slate-500">{tables.length ? "Try another table number." : "Add tables in Table Management. Their custom menu cards will appear here automatically."}</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTables.map((table) => {
            const customerUrl = getCustomerUrl(table.tableNumber);
            const active = table.isActive !== false;
            return (
              <Card key={table._id} padding="none" className="group overflow-hidden border-[#e4ddcd] bg-[#fbf9f2] transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                <div className="flex items-center justify-between px-5 pb-3 pt-5">
                  <div className="flex min-w-0 items-center gap-3">
                    {restaurantLogo ? <img src={restaurantLogo} alt="" className="h-10 w-10 rounded-full border border-[#d8cfb9] object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b28a50] font-serif text-lg text-[#173b32]">{restaurantName.charAt(0)}</span>}
                    <div className="min-w-0">
                      <p className="truncate font-serif text-sm font-bold text-[#173b32]">{restaurantName}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b7540]">Guest menu</p>
                    </div>
                  </div>
                  <Badge variant={active ? "success" : "default"}>{active ? "Ready" : "Disabled"}</Badge>
                </div>
                <div className="mx-4 overflow-hidden rounded-2xl border border-[#e4ddcd] bg-white shadow-sm">
                  <div className="bg-[#173b32] px-4 pb-4 pt-3 text-center text-white">
                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d7bd8c]">A seat at our table</p>
                    <p className="mt-1 font-serif text-2xl font-semibold">Table {table.tableNumber}</p>
                  </div>
                  <div className="px-4 pb-3 pt-4 text-center">
                    <div className="mx-auto w-fit rounded-xl border border-[#eee8da] bg-white p-2">
                      <QRCodeSVG id={`manager-qr-${table._id}`} value={customerUrl} size={160} level="H" includeMargin fgColor="#173b32" bgColor="#ffffff" title={`${restaurantName} menu for table ${table.tableNumber}`} />
                    </div>
                    <p className="mt-3 text-[10px] font-extrabold tracking-[0.2em] text-[#173b32]">SCAN TO ORDER</p>
                    <p className="mt-1 font-serif text-xs italic text-slate-500">Good food is just a scan away.</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="truncate rounded-lg bg-white/70 px-3 py-2 text-center text-[10px] text-slate-500" title={customerUrl}>{customerUrl}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTable(table)}>Preview</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => downloadQR(table)}><Download size={14} /> SVG</Button>
                    <Button type="button" size="sm" disabled={!active} onClick={() => printQR(table)}><Printer size={14} /> Print</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedTable(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="manager-qr-preview-title" className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-[#fbf9f2] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between bg-[#173b32] px-5 py-4 text-white">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#d7bd8c]">Print-ready table card</p>
                <h2 id="manager-qr-preview-title" className="mt-1 font-serif text-xl font-semibold">Preview · Table {selectedTable.tableNumber}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTable(null)} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close preview"><X size={19} /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-7">
              <RestaurantQrCard restaurantName={restaurantName} logo={restaurantLogo} tableNumber={selectedTable.tableNumber} url={getCustomerUrl(selectedTable.tableNumber)} size={220} qrId={`manager-qr-preview-${selectedTable._id}`} />
              <div className="mt-5 flex gap-3">
                <Button type="button" variant="outline" fullWidth disabled={selectedTable.isActive === false} onClick={() => printQR(selectedTable)}><Printer size={16} /> Print A6</Button>
                <Button type="button" fullWidth onClick={() => downloadQR(selectedTable)}><Download size={16} /> Download QR</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerQRPage;
