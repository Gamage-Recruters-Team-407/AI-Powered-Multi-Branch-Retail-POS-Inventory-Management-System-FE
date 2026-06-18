import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw, FiSearch, FiFilter, FiAlertTriangle,
  FiPackage, FiChevronRight, FiWifi, FiWifiOff
} from "react-icons/fi";
import { useInventory } from "../../context/InventoryContext";
import { useInventorySocket } from "../../hooks/useInventorySocket";
import * as inventoryService from "../../services/inventoryService";
import InventorySummaryCards from "../../components/inventory/InventorySummaryCards";
import StockAlertPanel from "../../components/inventory/StockAlertPanel";
import InventoryTable from "../../components/inventory/InventoryTable";
import MovementHistoryModal from "../../components/inventory/MovementHistoryModal";

export const InventoryDashboard = () => {
  const { inventory, summary, alerts, loading, error, refreshAll } = useInventory();

  const [selectedBranch, setSelectedBranch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline] = useState(true);

  useInventorySocket(selectedBranch, lowStockOnly);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await inventoryService.getBranches();
        if (res.success) setBranches(res.data);
      } catch (err) {
        console.error("Could not fetch branches list:", err);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    refreshAll(selectedBranch, lowStockOnly);
  }, [refreshAll, selectedBranch, lowStockOnly]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshAll(selectedBranch, lowStockOnly);
    setTimeout(() => setIsSyncing(false), 900);
  };

  // Client-side search filter across product name & branch name
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(
      (item) =>
        (item.product?.name || "").toLowerCase().includes(q) ||
        (item.branch?.name || "").toLowerCase().includes(q)
    );
  }, [inventory, searchQuery]);

  const handleRowClick = (item) => setSelectedItemForHistory(item);

  const timeString = new Date().toLocaleString("en-US", {
    weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const headerStats = [
    { label: "Unique SKUs",   value: loading ? "—" : summary.totalUniqueItems || 0,                  warn: false },
    { label: "Total Units",   value: loading ? "—" : (summary.totalQuantity || 0).toLocaleString(),   warn: false },
    { label: "Low Stock",     value: loading ? "—" : summary.lowStockCount || 0,                      warn: (summary.lowStockCount || 0) > 0 },
    { label: "Active Alerts", value: loading ? "—" : alerts.length,                                   warn: alerts.length > 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6" style={{ paddingBottom: "32px" }}>

        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 lg:p-8 shadow-2xl shadow-blue-900/25"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-8 -bottom-12 h-40 w-40 rounded-full bg-indigo-400/20" />
          <div className="pointer-events-none absolute right-48 top-4 h-20 w-20 rounded-full bg-blue-300/15" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: identity */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg ring-1 ring-white/30 flex-shrink-0">
                <FiPackage className="text-white text-3xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <span>POS System</span>
                  <FiChevronRight className="text-blue-300" />
                  <span>Module 9</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-sm">
                  Inventory Management
                </h1>
                <p className="text-blue-50 text-xs font-semibold mt-1 max-w-sm opacity-90">
                  Real-time stock tracking · Multi-branch visibility · Movement audit ledger
                </p>
              </div>
            </div>

            {/* Right: status + sync */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-1.5">
                {isOnline
                  ? <FiWifi className="text-emerald-300 text-xs" />
                  : <FiWifiOff className="text-red-300 text-xs" />}
                <span className="text-[10px] font-bold text-white/80">
                  {isOnline ? "Live" : "Offline"}
                </span>
              </div>
              <button
                onClick={handleManualSync}
                disabled={loading || isSyncing}
                className="flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-4 py-2.5 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-lg active:scale-95 cursor-pointer"
              >
                <FiRefreshCw className={`text-sm ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing…" : "Manual Sync"}
              </button>
              <div className="hidden sm:block text-right">
                <div className="text-blue-100 text-[9px] font-bold uppercase tracking-wider">Last refreshed</div>
                <div className="text-white text-[10px] font-bold mt-0.5">{timeString}</div>
              </div>
            </div>
          </div>

          {/* Quick-stats strip */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/20 pt-5">
            {headerStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="text-center"
              >
                <div className={`text-2xl font-black tabular-nums ${s.warn ? "text-amber-300" : "text-white"}`}>
                  {s.value}
                </div>
                <div className="text-white/90 text-[9px] font-extrabold uppercase tracking-widest mt-0.5">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ERROR BANNER ─────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-2xl border border-[var(--danger-color)]/20 bg-[var(--danger-light)] px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[var(--danger-light)] flex items-center justify-center border border-[var(--danger-color)]/10">
                  <FiAlertTriangle className="text-[var(--danger-color)] text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-[var(--danger-color)]">API Connection Error</div>
                  <div className="text-[10px] text-[var(--danger-color)]/80 mt-0.5 truncate">{error} — displaying mock data.</div>
                </div>
              </div>
              <button
                onClick={handleManualSync}
                className="flex-shrink-0 text-xs font-bold text-[var(--danger-color)] border border-[var(--danger-color)]/20 rounded-lg px-3 py-1.5 hover:bg-[var(--danger-light)]/85 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STOCK ALERTS ─────────────────────────────────────────── */}
        <StockAlertPanel alerts={alerts} />

        {/* ── SUMMARY CARDS ────────────────────────────────────────── */}
        <InventorySummaryCards summary={summary} loading={loading} />

        {/* ── FILTERS & SEARCH ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xs p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
              <FiFilter className="text-[var(--accent-color)] text-xs" />
            </div>
            <span className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
              Filter & Search Inventory
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-12 items-end">
            {/* Search input */}
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Search Products
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Product name or branch…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-9 pr-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:font-normal outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
                />
              </div>
            </div>

            {/* Branch select */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Branch Location
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Low stock toggle */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Stock Filter
              </label>
              <button
                type="button"
                onClick={() => setLowStockOnly((v) => !v)}
                className={`w-full flex items-center justify-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  lowStockOnly
                    ? "bg-[var(--danger-light)] border-[var(--danger-color)]/25 text-[var(--danger-color)] shadow-sm shadow-[var(--danger-light)]"
                    : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/50"
                }`}
              >
                <div
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    lowStockOnly ? "bg-[var(--danger-color)]" : "bg-[var(--border-color)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      lowStockOnly ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span>Low Stock Only</span>
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {(searchQuery || selectedBranch || lowStockOnly) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[var(--border-color)]"
              >
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Active:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--accent-light)] border border-[var(--accent-light)] text-[var(--accent-color)] rounded-full px-3 py-1 text-[10px] font-bold">
                    🔍 &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery("")} className="text-[var(--accent-color)]/60 hover:text-[var(--accent-color)] ml-0.5 leading-none cursor-pointer">✕</button>
                  </span>
                )}
                {selectedBranch && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-full px-3 py-1 text-[10px] font-bold">
                    📍 {branches.find((b) => b._id === selectedBranch)?.name}
                    <button onClick={() => setSelectedBranch("")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-0.5 leading-none cursor-pointer">✕</button>
                  </span>
                )}
                {lowStockOnly && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--danger-light)] border border-[var(--danger-color)]/20 text-[var(--danger-color)] rounded-full px-3 py-1 text-[10px] font-bold">
                    ⚠️ Low Stock Only
                    <button onClick={() => setLowStockOnly(false)} className="text-[var(--danger-color)]/60 hover:text-[var(--danger-color)] ml-0.5 leading-none cursor-pointer">✕</button>
                  </span>
                )}
                <button
                  onClick={() => { setSearchQuery(""); setSelectedBranch(""); setLowStockOnly(false); }}
                  className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── INVENTORY TABLE ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          {loading && inventory.length === 0 ? (
            /* Skeleton loader */
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between">
                <div className="h-4 w-44 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
              </div>
              <div className="p-5 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-xl bg-[var(--bg-tertiary)] flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
                      <div className="h-2.5 bg-[var(--bg-tertiary)] rounded w-1/2" />
                    </div>
                    <div className="h-3 w-16 bg-[var(--bg-tertiary)] rounded" />
                    <div className="h-3 w-16 bg-[var(--bg-tertiary)] rounded" />
                    <div className="h-6 w-20 bg-[var(--bg-tertiary)] rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <InventoryTable
              items={filteredInventory}
              totalUnfiltered={inventory.length}
              onRowClick={handleRowClick}
            />
          )}
        </motion.div>

        {/* ── MOVEMENT HISTORY MODAL ────────────────────────────────── */}
        {selectedItemForHistory && (
          <MovementHistoryModal
            item={selectedItemForHistory}
            onClose={() => setSelectedItemForHistory(null)}
          />
        )}
    </div>
  );
};

export default InventoryDashboard;
