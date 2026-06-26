import { useEffect, useState } from "react";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import WarehouseDetail from "./WarehouseDetail";
import * as warehouseService from "../../services/warehouseService";

// ─────────────────────────────────────────────────────────────────
// WarehouseList — Warehouse list pennawa naha.
// Directly main (kalin thiyana) warehouse eka load karanawa.
// ─────────────────────────────────────────────────────────────────

export default function WarehouseList({ onView }) {
  const [mainWarehouseId, setMainWarehouseId] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    loadMainWarehouse();
  }, []);

  const loadMainWarehouse = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await warehouseService.getMainWarehouse();
      if (result?.data?._id) {
        setMainWarehouseId(result.data._id);
      } else {
        setError("Main warehouse data load karanata bari una.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Warehouse load karanata bari una.");
      console.error("Error loading main warehouse:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="flex flex-col items-center gap-3 bg-white/10 dark:bg-black/20 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl">
          <FiLoader className="text-4xl text-blue-500 animate-spin" />
          <p className="text-sm font-medium tracking-wide text-slate-700 dark:text-slate-300 animate-pulse">
            Loading warehouse...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent p-6">
        <div className="flex flex-col items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-8 rounded-2xl border border-red-200 dark:border-red-800 shadow-xl max-w-md w-full text-center">
          <FiAlertCircle className="text-5xl text-red-500" />
          <p className="text-slate-800 dark:text-slate-100 font-bold text-lg">Warehouse Load Error</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
          <button
            onClick={loadMainWarehouse}
            className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main Warehouse Detail directly ───────────────────────────
  // WarehouseDetail eka ID ekak expect karanawa — main warehouse ID pass karanawa.
  // onBack prop naha (list ekak naha balanna).
  if (mainWarehouseId) {
    return (
      <WarehouseDetail
        warehouseId={mainWarehouseId}
        onBack={null}
      />
    );
  }

  return null;
}
