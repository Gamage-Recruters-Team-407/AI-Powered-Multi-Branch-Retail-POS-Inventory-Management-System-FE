import { useState } from "react";
import { FiDownload, FiPrinter, FiLoader } from "react-icons/fi";

export default function ReportsTab({ warehouse, stats, stocks, zones }) {
  const [exporting, setExporting] = useState(false);

  const formatDate = (d = new Date()) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });

  const now = formatDate();

  // ── CSV Export ─────────────────────────────────
  const exportCSV = () => {
    setExporting(true);
    try {
      const rows = [
        ["Product", "SKU", "Zone", "Quantity", "Min Stock", "Status"],
        ...stocks.map((s) => [
          s.product?.name || "—",
          s.product?.sku || "—",
          s.zone?.zoneName || "—",
          s.quantity,
          s.minStock,
          s.isLowStock ? "Low Stock" : "OK",
        ]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${warehouse?.name || "warehouse"}-stock-report-${now}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ── Print Report ────────────────────────────────
  const printReport = () => {
    const printWindow = window.open("", "_blank");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${warehouse?.name} — Warehouse Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #1a1a1a; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
          .section { margin-bottom: 28px; }
          .section h2 { font-size: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin-bottom: 12px; color: #1d4ed8; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
          .stat-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
          .stat-box .val { font-size: 22px; font-weight: bold; color: #2563eb; }
          .stat-box .lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
          td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          .ok { background: #dcfce7; color: #16a34a; }
          .low { background: #fee2e2; color: #dc2626; }
          .progress-bar-bg { background: #e5e7eb; border-radius: 4px; height: 8px; }
          .progress-bar { background: #3b82f6; border-radius: 4px; height: 8px; }
          @media print { body { margin: 16px; } }
        </style>
      </head>
      <body>
        <h1>${warehouse?.name || "Warehouse"} — Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Location: ${warehouse?.location || "—"}</p>

        <!-- Summary Stats -->
        <div class="section">
          <h2>Summary</h2>
          <div class="stats-grid">
            <div class="stat-box"><div class="val">${stats?.usagePercent ?? 0}%</div><div class="lbl">Capacity Used</div></div>
            <div class="stat-box"><div class="val">${stats?.totalUsed ?? 0} / ${stats?.totalCapacity ?? 0}</div><div class="lbl">Units Used / Total</div></div>
            <div class="stat-box"><div class="val">${stats?.totalZones ?? zones.length}</div><div class="lbl">Zones</div></div>
            <div class="stat-box"><div class="val">${stats?.lowStockCount ?? 0}</div><div class="lbl">Low Stock Items</div></div>
          </div>
        </div>

        <!-- Zones -->
        <div class="section">
          <h2>Storage Zones</h2>
          <table>
            <thead><tr><th>Zone Name</th><th>Code</th><th>Capacity</th><th>Current Stock</th><th>Usage %</th></tr></thead>
            <tbody>
              ${zones.map((z) => `
                <tr>
                  <td>${z.zoneName}</td>
                  <td>${z.zoneCode}</td>
                  <td>${z.capacity}</td>
                  <td>${z.currentStock ?? 0}</td>
                  <td>${z.capacity ? Math.round(((z.currentStock ?? 0) / z.capacity) * 100) : 0}%</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <!-- Stock Inventory -->
        <div class="section">
          <h2>Stock Inventory</h2>
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Zone</th><th>Quantity</th><th>Min Stock</th><th>Status</th></tr></thead>
            <tbody>
              ${stocks.map((s) => `
                <tr>
                  <td>${s.product?.name || "—"}</td>
                  <td>${s.product?.sku || "—"}</td>
                  <td>${s.zone?.zoneName || "—"}</td>
                  <td><strong>${s.quantity}</strong></td>
                  <td>${s.minStock}</td>
                  <td><span class="badge ${s.isLowStock ? "low" : "ok"}">${s.isLowStock ? "Low Stock" : "OK"}</span></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <!-- Transaction Summary (last 30 days) -->
        ${stats?.transactionSummary?.length ? `
        <div class="section">
          <h2>Transaction Summary (Last 30 Days)</h2>
          <table>
            <thead><tr><th>Type</th><th>Count</th><th>Total Qty</th></tr></thead>
            <tbody>
              ${stats.transactionSummary.map((t) => `
                <tr>
                  <td>${t._id}</td>
                  <td>${t.count}</td>
                  <td>${t.totalQty}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>` : ""}
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div>
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Warehouse Report</h3>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={exporting || stocks.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiDownload size={15} /> Export CSV
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiPrinter size={15} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats?.usagePercent ?? 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Capacity Used</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-gray-700">{stats?.totalUsed ?? 0}<span className="text-sm font-normal text-gray-400"> / {stats?.totalCapacity ?? warehouse?.capacity}</span></p>
          <p className="text-xs text-gray-500 mt-1">Units Used / Total</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats?.totalZones ?? zones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Zones</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{stats?.lowStockCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Low Stock Items</p>
        </div>
      </div>

      {/* Zones table */}
      {zones.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Storage Zones</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-right">Capacity</th>
                  <th className="px-4 py-3 text-right">Used</th>
                  <th className="px-4 py-3">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {zones.map((z) => {
                  const pct = z.capacity ? Math.round(((z.currentStock ?? 0) / z.capacity) * 100) : 0;
                  return (
                    <tr key={z._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{z.zoneName}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{z.zoneCode}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{z.capacity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{z.currentStock ?? 0}</td>
                      <td className="px-4 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock table */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">
          Stock Inventory
          {stocks.length === 0 && <span className="text-gray-400 font-normal ml-2">(no stock records)</span>}
        </h4>
        {stocks.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Zone</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Min</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {stocks.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.product?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.product?.sku || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {s.zone?.zoneName || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{s.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{s.minStock}</td>
                    <td className="px-4 py-3 text-center">
                      {s.isLowStock
                        ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">Low Stock</span>
                        : <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction summary */}
      {stats?.transactionSummary?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Transaction Summary (Last 30 Days)</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Count</th>
                  <th className="px-4 py-3 text-right">Total Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {stats.transactionSummary.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">{t._id}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-semibold">{t.count}</td>
                    <td className="px-4 py-3 text-right text-gray-700 font-semibold">{t.totalQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
