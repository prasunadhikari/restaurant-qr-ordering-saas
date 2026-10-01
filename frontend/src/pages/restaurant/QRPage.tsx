import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

type RestaurantTable = {
  id: string;
  tableNumber: string;
  capacity: number;
};

const tables: RestaurantTable[] = [
  { id: "1", tableNumber: "01", capacity: 2 },
  { id: "2", tableNumber: "02", capacity: 2 },
  { id: "3", tableNumber: "03", capacity: 4 },
  { id: "4", tableNumber: "04", capacity: 4 },
  { id: "5", tableNumber: "05", capacity: 4 },
  { id: "6", tableNumber: "06", capacity: 6 },
  { id: "7", tableNumber: "07", capacity: 2 },
  { id: "8", tableNumber: "08", capacity: 4 },
  { id: "9", tableNumber: "09", capacity: 4 },
  { id: "10", tableNumber: "10", capacity: 6 },
  { id: "11", tableNumber: "11", capacity: 2 },
  { id: "12", tableNumber: "12", capacity: 4 },
  { id: "13", tableNumber: "13", capacity: 4 },
  { id: "14", tableNumber: "14", capacity: 2 },
  { id: "15", tableNumber: "15", capacity: 6 },
  { id: "16", tableNumber: "16", capacity: 4 },
  { id: "17", tableNumber: "17", capacity: 2 },
  { id: "18", tableNumber: "18", capacity: 4 },
  { id: "19", tableNumber: "19", capacity: 4 },
  { id: "20", tableNumber: "20", capacity: 6 },
];

const getCustomerUrl = (tableNumber: string) => {
  if (typeof window === "undefined") {
    return `/r/kathmandu-cafe/t/${tableNumber}`;
  }

  return `${window.location.origin}/r/kathmandu-cafe/t/${tableNumber}`;
};

function QRPage() {
  const [search, setSearch] = useState("");

  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tables;
    }

    return tables.filter((table) =>
      table.tableNumber.toLowerCase().includes(query),
    );
  }, [search]);

  const downloadQR = (table: RestaurantTable) => {
    const svg = document.getElementById(`qr-${table.id}`);

    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `kathmandu-cafe-table-${table.tableNumber}-qr.svg`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const printQR = (table: RestaurantTable) => {
    const customerUrl = getCustomerUrl(table.tableNumber);

    const svg = document.getElementById(`qr-${table.id}`);

    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    const svgBase64 = window.btoa(
      unescape(encodeURIComponent(svgData)),
    );

    const printWindow = window.open(
      "",
      "_blank",
      "width=600,height=700",
    );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${table.tableNumber} QR Code</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, Helvetica, sans-serif;
              background: white;
            }

            .card {
              width: 420px;
              padding: 40px;
              text-align: center;
            }

            h1 {
              margin: 0;
              font-size: 26px;
              color: #0f172a;
            }

            h2 {
              margin: 10px 0 24px;
              font-size: 20px;
              color: #059669;
            }

            img {
              display: block;
              width: 260px;
              height: 260px;
              margin: 0 auto;
            }

            p {
              margin-top: 24px;
              font-size: 14px;
              line-height: 1.6;
              color: #64748b;
            }

            .url {
              margin-top: 14px;
              padding: 10px;
              border-radius: 10px;
              background: #f8fafc;
              color: #334155;
              font-size: 11px;
              word-break: break-all;
            }

            @media print {
              body {
                min-height: auto;
              }

              .card {
                width: 100%;
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>Kathmandu Cafe</h1>

            <h2>Table ${table.tableNumber}</h2>

            <img
              src="data:image/svg+xml;base64,${svgBase64}"
              alt="QR Code"
            />

            <p>
              Scan this QR code to view our menu
              and place your order.
            </p>

            <div class="url">
              ${customerUrl}
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Digital ordering
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            QR Codes
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Generate table-specific QR codes that open the
            Kathmandu Cafe digital menu.
          </p>
        </div>

        <Badge variant="success">
          20 QR codes active
        </Badge>
      </div>

      {/* Information banner */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
        <div className="flex gap-3">
          <div className="mt-0.5 text-lg">
            📱
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              How it works
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Each table has a unique QR code. When a
              customer scans it, they are automatically
              taken to the menu for that specific table.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card padding="sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Input
              id="qr-search"
              placeholder="Search table number..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredTables.length}
            </span>{" "}
            of {tables.length} tables
          </p>
        </div>
      </Card>

      {/* QR grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {filteredTables.map((table) => {
          const customerUrl = getCustomerUrl(
            table.tableNumber,
          );

          return (
            <Card
              key={table.id}
              padding="none"
              className="overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Table
                  </p>

                  <p className="mt-0.5 text-xl font-bold text-slate-900">
                    {table.tableNumber}
                  </p>
                </div>

                <Badge variant="success">
                  Active
                </Badge>
              </div>

              {/* QR */}
              <div className="flex justify-center bg-slate-50 px-5 py-6">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    id={`qr-${table.id}`}
                    value={customerUrl}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Capacity
                  </span>

                  <span className="font-semibold text-slate-700">
                    {table.capacity} people
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-400">
                    Customer URL
                  </p>

                  <p className="mt-1 truncate text-xs font-medium text-slate-600">
                    {customerUrl}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedTable(table)
                    }
                  >
                    Preview
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      downloadQR(table)
                    }
                  >
                    Download
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="mt-2"
                  onClick={() =>
                    printQR(table)
                  }
                >
                  🖨 Print QR
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preview modal */}
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            setSelectedTable(null)
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  QR Preview
                </p>

                <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                  Table {selectedTable.tableNumber}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTable(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 text-center">
              <div className="mx-auto w-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <QRCodeSVG
                  value={getCustomerUrl(
                    selectedTable.tableNumber,
                  )}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>

              <h4 className="mt-5 text-xl font-bold text-slate-900">
                Kathmandu Cafe
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Table {selectedTable.tableNumber}
              </p>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Scan this code to open the restaurant menu
                and place a dine-in order.
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-left">
                <p className="text-xs font-medium text-slate-400">
                  Customer URL
                </p>

                <p className="mt-1 break-all text-xs font-medium text-slate-600">
                  {getCustomerUrl(
                    selectedTable.tableNumber,
                  )}
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    printQR(selectedTable)
                  }
                >
                  🖨 Print
                </Button>

                <Button
                  type="button"
                  fullWidth
                  onClick={() =>
                    downloadQR(selectedTable)
                  }
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRPage;