import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiSearch, FiPackage, FiBox, FiLock,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────
// StockTable — Product list with total stock per product.
// Zone kaipa thiyanam zones sum karanawa — product ekak eka row.
// ─────────────────────────────────────────────────────────────────

export default function StockTable({ stocks }) {
  const [search, setSearch] = useState("");

  // ── Group by product, sum quantity across zones ───────────────
  const products = useMemo(() => {
    const map = new Map();

    stocks.forEach((s) => {
      const p = s.product;
      if (!p) return;
      const key = p._id || p;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.totalQuantity += s.quantity || 0;
        existing.zones.push({
          zoneName: s.zone?.zoneName || "—",
          quantity: s.quantity || 0,
        });
        // low stock: any zone low → whole product low
        if (s.isLowStock) existing.isLowStock = true;
      } else {
        map.set(key, {
          productId:     key,
          name:          p.name          || "—",
          barcode:       p.barcode       || "—",
          sku:           p.sku           || null,
          image:         p.image         || null,
          price:         p.price         ?? null,
          unit:          p.unit          || null,
          reorderLevel:  p.reorderLevel  ?? null,
          totalQuantity: s.quantity      || 0,
          minStock:      s.minStock      ?? 10,
          isLowStock:    s.isLowStock    || false,
          isUnstocked:   s.isUnstocked   || false,
          zones: s.zone?.zoneName
            ? [{ zoneName: s.zone.zoneName, quantity: s.quantity || 0 }]
            : [],
        });
      }
    });

    return Array.from(map.values());
  }, [stocks]);

  // ── Search filter ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, search]);

  // ── Counts ───────────────────────────────────────────────────
  const stockedCount   = products.filter((p) => !p.isUnstocked).length;
  const lowStockCount  = products.filter((p) => p.isLowStock).length;
  const unstockedCount = products.filter((p) => p.isUnstocked).length;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FiBox className="text-blue-600" />
            Product Stock List
          </h3>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              {stockedCount} in stock
            </span>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full flex items-center gap-1">
                <FiAlertTriangle size={11} /> {lowStockCount} low stock
              </span>
            )}
            {unstockedCount > 0 && (
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                {unstockedCount} not stocked
              </span>
            )}
          </div>
        </div>

        {/* Read-only notice */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0">
          <FiLock size={13} />
          Stock is managed via Product Management
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search by product name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
        />
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-white/20 dark:bg-white/5">
          <FiPackage className="text-5xl text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-bold text-slate-600 dark:text-slate-400 text-lg">
            {search ? "No products match your search" : "No stock records found"}
          </p>
          {!search && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Stock is updated from Product Management → Edit Product.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/50 dark:border-white/10 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/60 backdrop-blur-sm">
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Barcode
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Zones
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Stock
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Min Stock
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white/60 dark:bg-slate-900/30 backdrop-blur-sm">
                {filtered.map((product) => (
                  <tr
                    key={product.productId}
                    className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${
                      product.isUnstocked ? "opacity-50" : ""
                    }`}
                  >
                    {/* Product info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Image or placeholder */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 flex-shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                            <FiPackage className="text-slate-400" size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {product.name}
                          </p>
                          {product.unit && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              per {product.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {product.barcode}
                      </span>
                    </td>

                    {/* Zones breakdown */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {product.zones.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.zones.map((z, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold"
                              title={`${z.zoneName}: ${z.quantity} units`}
                            >
                              {z.zoneName}: {z.quantity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Total stock — main highlight */}
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-2xl font-black ${
                          product.isUnstocked
                            ? "text-slate-400"
                            : product.isLowStock
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {product.totalQuantity}
                      </span>
                    </td>

                    {/* Min stock */}
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">
                        {product.minStock}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4 text-center">
                      {product.isUnstocked ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">
                          Not Stocked
                        </span>
                      ) : product.isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                          <FiAlertTriangle size={11} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                          ✓ OK
                        </span>
                      )}
                    </td>
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