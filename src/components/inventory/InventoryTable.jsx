import React from "react";

export const InventoryTable = ({ items, onRowClick }) => {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Live Inventory Registers</h3>
        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
          Click any row to view stock movement history logs
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold uppercase text-[10px]">
              <th className="px-5 py-3.5">Product Name</th>
              <th className="px-4 py-3.5">Branch Location</th>
              <th className="px-4 py-3.5 text-right">Quantity In Hand</th>
              <th className="px-4 py-3.5 text-right">Reorder Threshold</th>
              <th className="px-5 py-3.5 text-center">Status Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-[var(--text-muted)] font-semibold">
                  No inventory records match the selected filter presets.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLow = item.quantity <= (item.product?.reorderLevel || 0);
                return (
                  <tr
                    key={item._id}
                    onClick={() => onRowClick(item)}
                    className={`cursor-pointer transition-colors ${
                      isLow ? "bg-[var(--danger-light)] hover:bg-[var(--danger-light)]/80" : "hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-[var(--text-primary)]">
                      {item.product?.name || "Unknown Product"}
                    </td>
                    <td className="px-4 py-4 font-medium text-[var(--text-secondary)]">
                      📍 {item.branch?.name || "Global / Base"}
                    </td>
                    <td className={`px-4 py-4 text-right font-black ${isLow ? "text-[var(--danger-color)]" : "text-[var(--text-primary)]"}`}>
                      {(item.quantity || 0).toLocaleString()} units
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-[var(--text-muted)]">
                      {(item.product?.reorderLevel || 0).toLocaleString()} units
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-black text-[9px] uppercase border ${
                          isLow
                            ? "bg-[var(--danger-light)] text-[var(--danger-color)] border-[var(--danger-color)]/20"
                            : "bg-[var(--success-light)] text-[var(--success-color)] border-[var(--success-color)]/20"
                        }`}
                      >
                        {isLow ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
