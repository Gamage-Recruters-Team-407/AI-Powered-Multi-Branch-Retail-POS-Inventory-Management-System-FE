import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiLoader } from "react-icons/fi";
import ZoneCard from "../../components/warehouse/ZoneCard";
import ZoneForm from "../../components/warehouse/ZoneForm";
import StockTable from "../../components/warehouse/StockTable";
import StockForm from "../../components/warehouse/StockForm";
import TransferForm from "../../components/warehouse/TransferForm";
import TransactionsTab from "../../components/warehouse/TransactionsTab";
import ReportsTab from "../../components/warehouse/ReportsTab";
import * as warehouseService from "../../services/warehouseService";

export default function WarehouseDetail({ warehouseId, onBack }) {
  const id = warehouseId;

  const [warehouse, setWarehouse] = useState(null);
  const [zones, setZones] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Zone form state
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [zoneError, setZoneError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehouseRes, zonesRes, stocksRes, statsRes] = await Promise.all([
        warehouseService.getWarehouseById(id),
        warehouseService.getZonesByWarehouse(id),
        warehouseService.getWarehouseStock(id),
        warehouseService.getWarehouseStats(id),
      ]);
      setWarehouse(warehouseRes.data);
      setZones(zonesRes.data);
      setStocks(stocksRes.data);
      setStats(statsRes.data?.data ?? statsRes.data);
    } catch (err) {
      console.error("Error fetching warehouse data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await warehouseService.getZonesByWarehouse(id);
      setZones(res.data);
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  };

  // ── Zone handlers ──────────────────────────────

  const handleOpenZoneForm = (zone = null) => {
    setEditingZone(zone);
    setZoneError(null);
    setShowZoneForm(true);
  };

  const handleCloseZoneForm = () => {
    setShowZoneForm(false);
    setEditingZone(null);
    setZoneError(null);
  };

  const handleZoneSubmit = async (formData) => {
    setZoneLoading(true);
    setZoneError(null);
    try {
      if (editingZone) {
        await warehouseService.updateZone(editingZone._id, formData);
      } else {
        await warehouseService.createZone(id, formData);
      }
      handleCloseZoneForm();
      fetchZones();
    } catch (err) {
      setZoneError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setZoneLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await warehouseService.deleteZone(zoneId);
      fetchZones();
    } catch (err) {
      alert("Error deleting zone: " + (err.response?.data?.message || err.message));
    }
  };

  // ── Stock handlers ─────────────────────────────

  const [stockFormMode, setStockFormMode] = useState(null); // "add" | "remove" | null
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);

  const fetchStocks = async () => {
    try {
      const res = await warehouseService.getWarehouseStock(id);
      setStocks(res.data);
    } catch (err) {
      console.error("Error refreshing stock:", err);
    }
  };

  const handleStockSubmit = async (formData) => {
    setStockLoading(true);
    setStockError(null);
    try {
      if (stockFormMode === "add") {
        await warehouseService.addStock(id, formData);
      } else {
        await warehouseService.removeStock(id, formData);
      }
      setStockFormMode(null);
      fetchStocks();
    } catch (err) {
      setStockError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setStockLoading(false);
    }
  };

  // ── Transfer handlers ──────────────────────────

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);

  const handleTransferSubmit = async (formData) => {
    setTransferLoading(true);
    setTransferError(null);
    try {
      await warehouseService.transferStock(formData);
      setShowTransferForm(false);
      fetchStocks();
    } catch (err) {
      setTransferError(err.response?.data?.message || err.message || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 bg-white/10 dark:bg-black/20 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl">
          <FiLoader className="text-4xl text-blue-600 animate-spin" />
          <p className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-transparent p-8 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-md rounded-2xl p-6 max-w-md text-center shadow-lg">
          <p className="text-red-600 dark:text-red-400 font-bold text-lg">Warehouse not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 text-slate-900 dark:text-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onBack && onBack()}
            className="group flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-bold transition-all w-fit bg-white/30 dark:bg-black/20 px-4 py-2 rounded-lg backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm"
          >
            <FiArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" /> 
            Back to Warehouses
          </button>

          <div className="mt-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {warehouse.name}
            </h1>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mt-2 flex items-center gap-2 text-base">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              {warehouse.location}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <p className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Capacity Used</p>
              <p className="text-4xl font-black text-blue-700 dark:text-blue-400 drop-shadow-sm">{stats.usagePercent}%</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 bg-white/60 dark:bg-black/40 py-1.5 px-3 rounded-lg w-fit shadow-sm border border-white/20 dark:border-white/5">
                {stats.totalUsed} / {stats.totalCapacity}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <p className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Total Zones</p>
              <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 drop-shadow-sm">{stats.totalZones}</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <p className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Low Stock Items</p>
              <p className="text-4xl font-black text-amber-600 dark:text-amber-400 drop-shadow-sm">{stats.lowStockCount}</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <p className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Manager</p>
              <p className="text-xl font-black text-slate-900 dark:text-white truncate mt-1">{warehouse.manager?.name || "N/A"}</p>
            </div>
          </div>
        )}

        {/* Main Tabs Container */}
        <div className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-white/30 dark:border-white/10 overflow-x-auto bg-white/20 dark:bg-black/20">
            {["overview", "zones", "stock", "transactions", "transfer", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold text-sm tracking-wide transition-all whitespace-nowrap outline-none ${
                  activeTab === tab
                    ? "text-blue-700 dark:text-blue-400 border-b-4 border-blue-600 dark:border-blue-500 bg-white/40 dark:bg-white/5"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-4">Warehouse Details</h3>
                  <div className="space-y-4 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 p-5 rounded-2xl shadow-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Location</p>
                      <p className="font-black text-lg text-slate-900 dark:text-white mt-0.5">{warehouse.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Address</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{warehouse.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Phone</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{warehouse.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-4">Capacity Info</h3>
                  <div className="space-y-5 bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5 p-5 rounded-2xl shadow-sm">
                    <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-white/30 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 tracking-wider">Total Capacity</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{warehouse.capacity} units</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                        <span>Usage</span>
                        <span>{Math.min(stats?.usagePercent || 0, 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-4 p-0.5 shadow-inner">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all duration-500"
                          style={{ width: `${Math.min(stats?.usagePercent || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zones Tab */}
            {activeTab === "zones" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Storage Zones
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/5 px-3 py-1 rounded-full shadow-sm">
                      {zones.length} zone{zones.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  <button
                    onClick={() => handleOpenZoneForm()}
                    className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg active:scale-95"
                  >
                    <FiPlus size={18} /> Add Zone
                  </button>
                </div>

                {zones.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-400/50 dark:border-white/20 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-sm">
                    <p className="text-slate-700 dark:text-slate-300 font-bold mb-4 text-lg">No zones created yet</p>
                    <button
                      onClick={() => handleOpenZoneForm()}
                      className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg hover:shadow-blue-500/30"
                    >
                      <FiPlus size={18} /> Create First Zone
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {zones.map((zone) => (
                      <ZoneCard
                        key={zone._id}
                        zone={zone}
                        onEdit={() => handleOpenZoneForm(zone)}
                        onDelete={() => handleDeleteZone(zone._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stock Tab */}
            {activeTab === "stock" && (
              <StockTable
                stocks={stocks}
                onAddStock={() => { setStockError(null); setStockFormMode("add"); }}
                onRemoveStock={() => { setStockError(null); setStockFormMode("remove"); }}
              />
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <TransactionsTab warehouseId={id} />
            )}

            {/* Transfer Tab */}
            {activeTab === "transfer" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Stock Transfers</h3>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">Move stock from this warehouse to another location</p>
                  </div>
                  <button
                    onClick={() => { setTransferError(null); setShowTransferForm(true); }}
                    className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg active:scale-95"
                  >
                    <FiPlus size={18} /> New Transfer
                  </button>
                </div>
                {transferError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl px-5 py-4 text-sm shadow-sm">
                    {transferError}
                  </div>
                )}
                <div className="bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/5 rounded-2xl p-10 text-center shadow-sm">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Click "New Transfer" to move stock to another warehouse.</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">Transfer history is visible in the Transactions tab.</p>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <ReportsTab
                warehouse={warehouse}
                stats={stats}
                stocks={stocks}
                zones={zones}
              />
            )}
          </div>
        </div>
      </div>

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-lg relative">
            {zoneError && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-2.5 rounded-xl shadow-xl text-sm font-bold border border-red-400">
                {zoneError}
              </div>
            )}
            <ZoneForm
              zone={editingZone}
              onSubmit={handleZoneSubmit}
              onClose={handleCloseZoneForm}
              loading={zoneLoading}
            />
          </div>
        </div>
      )}

      {/* Stock Form Modal */}
      {stockFormMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-2xl relative">
            {stockError && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-2.5 rounded-xl shadow-xl text-sm font-bold border border-red-400">
                {stockError}
              </div>
            )}
            <StockForm
              mode={stockFormMode}
              zones={zones}
              stocks={stocks}
              onSubmit={handleStockSubmit}
              onClose={() => setStockFormMode(null)}
              loading={stockLoading}
            />
          </div>
        </div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-2xl relative">
            <TransferForm
              currentWarehouseId={id}
              currentZones={zones}
              currentStocks={stocks}
              onSubmit={handleTransferSubmit}
              onClose={() => { setShowTransferForm(false); setTransferError(null); }}
              loading={transferLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}