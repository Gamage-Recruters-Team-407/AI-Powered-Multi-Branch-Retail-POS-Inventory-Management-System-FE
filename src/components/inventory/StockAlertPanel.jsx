import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const StockAlertPanel = ({ alerts, onAlertClick }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page if number of alerts changes
  useEffect(() => {
    setCurrentPage(1);
  }, [alerts?.length]);

  if (!alerts || alerts.length === 0) return null;

  // Sort alerts: newest first (using updatedAt)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt) : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt) : 0;
    return dateB - dateA;
  });

  const pageSize = 6;
  const totalPages = Math.ceil(sortedAlerts.length / pageSize);
  const activePage = Math.min(currentPage, totalPages || 1);

  const startIndex = (activePage - 1) * pageSize;
  const displayedAlerts = sortedAlerts.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    if (activePage > 1) {
      setCurrentPage(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      setCurrentPage(activePage + 1);
    }
  };

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

        <div className="mt-4 flex flex-col gap-2.5">
          {displayedAlerts.map((alert) => (
            <div
              key={alert._id}
              onClick={() => onAlertClick && onAlertClick(alert)}
              className={`flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 shadow-xs text-xs transition-all duration-200 ${
                onAlertClick
                  ? "cursor-pointer hover:border-[var(--danger-color)]/45 hover:translate-x-1 hover:shadow-sm"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 font-bold flex-shrink-0 text-sm">
                  ⚠️
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-[var(--text-primary)] truncate text-xs">
                    {alert.product?.name || "Unknown Product"}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">
                    📍 {alert.branch?.name || "Global"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-right flex-shrink-0">
                <div className="text-[10px] text-[var(--text-muted)] font-semibold">
                  Limit: <span className="text-[var(--text-primary)] font-bold">{alert.product?.reorderLevel || 0}</span>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-1.5 border border-red-100 dark:border-red-900/50">
                  <span className="text-[var(--danger-color)] font-black text-xs">
                    {alert.quantity} left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--danger-color)]/10 pt-4 text-xs font-semibold">
            <span className="text-[var(--danger-color)]/70">
              Showing {startIndex + 1} - {Math.min(startIndex + pageSize, sortedAlerts.length)} of {sortedAlerts.length} alerts
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={activePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--danger-color)]/25 bg-[var(--bg-secondary)] hover:bg-[var(--danger-light)] disabled:opacity-50 transition cursor-pointer"
              >
                <FiChevronLeft className="text-sm text-[var(--danger-color)]" />
              </button>
              <span className="text-[var(--danger-color)]">
                Page {activePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={activePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--danger-color)]/25 bg-[var(--bg-secondary)] hover:bg-[var(--danger-light)] disabled:opacity-50 transition cursor-pointer"
              >
                <FiChevronRight className="text-sm text-[var(--danger-color)]" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StockAlertPanel;
