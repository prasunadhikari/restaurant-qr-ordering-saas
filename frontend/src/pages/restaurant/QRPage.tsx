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
  qrToken?: string;
};

function QRPage() {
  const [search, setSearch] = useState("");

  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);

  // Real table data will come from the restaurant API.
  const tables: RestaurantTable[] = [];

  const restaurantSlug = "";

  const getCustomerUrl = (tableNumber: string) => {
    if (!restaurantSlug) {
      return `/r/[restaurant-slug]/t/${tableNumber}`;
    }

    if (typeof window === "undefined") {
      return `/r/${restaurantSlug}/t/${tableNumber}`;
    }

    return `${window.location.origin}/r/${restaurantSlug}/t/${tableNumber}`;
  };

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tables;
    }

    return tables.filter((table) =>
      table.tableNumber.toLowerCase().includes(query),
    );
  }, [search, tables]);

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
    link.download = `table-${table.tableNumber}-qr.svg`;

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
            <h1>Restaurant QR Menu</h1>

            <h2>Table ${table.tableNumber}</h2>

            <img
              src="data:image/svg+xml;base64,${svgBase64}"
              alt="QR Code"
            />

            <p>
              Scan this QR code to view the menu
              and place your dine-in order.
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
            restaurant digital menu.
          </p>
        </div>

        <Badge variant="default">
          {tables.length} QR codes
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
              Each restaurant table will have a unique QR code.
              Customers can scan the code to open the menu for
              that specific table and place a dine-in order.
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

      {/* Empty state */}
      {filteredTables.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              ▦
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              No QR codes available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              QR codes will appear here automatically after
              restaurant tables are created and connected to
              the database.
            </p>

            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                QR system
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Each table will receive a unique QR token.
                Scanning the QR code will open:
              </p>

              <code className="mt-3 block break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                /r/[restaurant-slug]/t/[table-number]
              </code>
            </div>
          </div>
        </Card>
      ) : (
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
      )}

      {/* Backend connection note */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
            i
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              QR data is not connected yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              This page is now free of demo restaurant and table
              data. Once the Table API is connected, QR codes
              will be generated from real restaurant records and
              each code will point to its restaurant and table.
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Planned API: GET /api/tables
            </p>
          </div>
        </div>
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
                Restaurant QR Menu
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Table {selectedTable.tableNumber}
              </p>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Scan this code to open the restaurant menu and
                place a dine-in order.
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