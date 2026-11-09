import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "../../context/InventoryContext";

export const MovementHistoryModal = ({ item, onClose }) => {
  const { history, fetchHistory, loading } = useInventory();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (item?._id) {
      fetchHistory(item._id, item.branch?._id, startDate, endDate);
    }
  }, [item, fetchHistory, startDate, endDate]);

  const getBadgeClass = (type) => {
    switch (type) {
      case "sale":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "purchase":
        return "bg-[var(--success-light)] text-[var(--success-color)] border-[var(--success-color)]/20";
      case "return":
        return "bg-[var(--warning-light)] text-[var(--warning-color)] border-[var(--warning-color)]/20";
      case "adjustment":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "transfer_in":
        return "bg-[var(--info-light)] text-[var(--info-color)] border-[var(--info-color)]/20";
      case "transfer_out":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      default:
        return "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]";
    }
  };

  const formatType = (type) => {
    return type ? type.replace("_", " ").toUpperCase() : "MOVEMENT";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-3xl rounded-3xl bg-[var(--bg-secondary)] shadow-2xl p-6 flex flex-col z-10 max-h-[85vh] overflow-hidden border border-[var(--border-color)]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block tracking-wider">
                Audited Stock History
              </span>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">
                {item?.product?.name || "Product Stock Movement Log"}
              </h3>
              <span className="text-xs text-[var(--text-secondary)] font-bold mt-1 block">
                📍 {item?.branch?.name || "Global / Base"} • Current: {item?.quantity} units
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg font-bold bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-[var(--bg-tertiary)]/40 p-4 mb-5 border border-[var(--border-color)]">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] bg-[var(--bg-secondary)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] bg-[var(--bg-secondary)]"
              />
            </div>
          </div>

          {/* Ledger logs */}
          <div className="flex-1 overflow-y-auto min-h-[250px] border border-[var(--border-color)] rounded-2xl">
            {loading ? (
              <div className="flex h-[250px] items-center justify-center">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent-color)] border-t-transparent mx-auto" />
                  <p className="mt-3 text-[10px] font-bold text-[var(--text-muted)]">Loading audit history ledger...</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-center p-8">
                <div>
                  <span className="text-3xl block mb-2">📋</span>
                  <p className="text-[var(--text-muted)] font-semibold text-xs">No stock movements found within this timeframe.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold uppercase text-[9px] tracking-wider sticky top-0 z-5">
                    <th className="px-5 py-3">Date / Time</th>
                    <th className="px-4 py-3">Activity Type</th>
                    <th className="px-4 py-3 text-right">Shift Qty</th>
                    <th className="px-4 py-3">Audit Reason</th>
                    <th className="px-5 py-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-medium">
                  {history.map((log) => {
                    const isPositive = log.quantityChange > 0;
                    return (
                      <tr key={log._id} className="hover:bg-[var(--bg-tertiary)]/30 text-[var(--text-primary)]">
                        <td className="px-5 py-3 text-[var(--text-primary)] font-bold whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] border ${getBadgeClass(log.type)}`}>
                            {formatType(log.type)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-black ${isPositive ? "text-[var(--success-color)]" : "text-[var(--danger-color)]"}`}>
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-primary)] font-semibold max-w-[200px] truncate" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="px-5 py-3 text-[var(--text-primary)] whitespace-nowrap">
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System Job"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] transition-colors"
            >
              Close Ledger
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MovementHistoryModal;
