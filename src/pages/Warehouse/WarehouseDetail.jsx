import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiLoader } from "react-icons/fi";
import ZoneCard from "../../components/warehouse/ZoneCard";
import ZoneForm from "../../components/warehouse/ZoneForm";
import StockTable from "../../components/warehouse/StockTable";
import StockForm from "../../components/warehouse/StockForm";
import TransferForm from "../../components/warehouse/TransferForm";
import TransactionsTab from "../../components/warehouse/TransactionsTab";
import ReportsTab from "../../components/warehouse/ReportsTab";
import * as warehouseService from "../../services/warehouseService";

export default function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="text-4xl text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">Warehouse not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/warehouse")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft size={20} /> Back to Warehouses
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{warehouse.name}</h1>
          <p className="text-gray-600 mt-1">{warehouse.location}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-1">Capacity Used</p>
              <p className="text-3xl font-bold text-blue-600">{stats.usagePercent}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.totalUsed} / {stats.totalCapacity}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Zones</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalZones}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600">{stats.lowStockCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-1">Manager</p>
              <p className="text-lg font-bold text-gray-800">{warehouse.manager?.name || "N/A"}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            {["overview", "zones", "stock", "transactions", "transfer", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold text-sm transition ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Warehouse Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-semibold text-gray-800">{warehouse.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="font-semibold text-gray-800">{warehouse.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-800">{warehouse.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Capacity Info</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Capacity</p>
                      <p className="text-2xl font-bold text-gray-800">{warehouse.capacity} units</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min(stats?.usagePercent || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zones Tab */}
            {activeTab === "zones" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Storage Zones
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({zones.length} zone{zones.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <button
                    onClick={() => handleOpenZoneForm()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    <FiPlus size={16} /> Add Zone
                  </button>
                </div>

                {zones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No zones created yet</p>
                    <button
                      onClick={() => handleOpenZoneForm()}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      <FiPlus size={16} /> Create First Zone
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Stock Transfers</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Move stock from this warehouse to another</p>
                  </div>
                  <button
                    onClick={() => { setTransferError(null); setShowTransferForm(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    <FiPlus size={16} /> New Transfer
                  </button>
                </div>
                {transferError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                    {transferError}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
                  <p className="font-medium">Click "New Transfer" to move stock to another warehouse.</p>
                  <p className="text-sm mt-1">Transfer history is visible in the Transactions tab.</p>
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
        <div>
          {zoneError && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg">
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
      )}

      {/* Stock Form Modal */}
      {stockFormMode && (
        <div>
          {stockError && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg">
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
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <TransferForm
          currentWarehouseId={id}
          currentZones={zones}
          currentStocks={stocks}
          onSubmit={handleTransferSubmit}
          onClose={() => { setShowTransferForm(false); setTransferError(null); }}
          loading={transferLoading}
        />
      )}
    </div>
  );
}
