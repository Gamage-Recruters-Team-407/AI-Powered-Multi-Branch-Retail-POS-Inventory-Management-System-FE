import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const StockAlertPanel = ({ alerts, onAlertClick }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 rounded-2xl border border-[var(--danger-color)]/20 bg-[var(--danger-light)] p-5 text-[var(--danger-color)] shadow-xs"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--danger-color)]">Critical Stock Shortages Detected</h3>
            <p className="text-xs text-[var(--danger-color)]/80 mt-0.5">
              The following products are at or below their designated reorder thresholds. Click an alert to select a supplier and place a restock order.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              onClick={() => onAlertClick && onAlertClick(alert)}
              className={`rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 shadow-sm text-xs ${
                onAlertClick
                  ? "cursor-pointer hover:border-[var(--danger-color)]/40 hover:scale-[1.02] hover:shadow-md transition-all duration-200"
                  : ""
              }`}
            >
              <div className="flex justify-between font-bold text-[var(--text-primary)]">
                <span className="truncate max-w-[150px]">{alert.product?.name || "Unknown Product"}</span>
                <span className="text-[var(--danger-color)] font-extrabold">{alert.quantity} left</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-2 font-medium">
                <span>📍 {alert.branch?.name || "Global"}</span>
                <span>Limit: {alert.product?.reorderLevel || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StockAlertPanel;
