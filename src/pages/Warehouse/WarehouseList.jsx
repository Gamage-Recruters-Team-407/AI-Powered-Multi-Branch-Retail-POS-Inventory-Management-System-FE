import { useEffect, useState } from "react";
import { FiPlus, FiLoader, FiBox } from "react-icons/fi";
import WarehouseCard from "../../components/warehouse/WarehouseCard";
import WarehouseForm from "../../components/warehouse/WarehouseForm";
import * as warehouseService from "../../services/warehouseService";

export default function WarehouseList({ onView }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const result = await warehouseService.getAllWarehouses();
      setWarehouses(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await warehouseService.createWarehouse(formData);
      setShowForm(false);
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      alert("Error creating warehouse: " + err.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await warehouseService.updateWarehouse(editingWarehouse._id, formData);
      setShowForm(false);
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      alert("Error updating warehouse: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this warehouse?")) {
      try {
        await warehouseService.deleteWarehouse(id);
        fetchWarehouses();
      } catch (err) {
        alert("Error deleting warehouse: " + err.message);
      }
    }
  };

  const handleOpenForm = (warehouse = null) => {
    setEditingWarehouse(warehouse);
    setShowForm(true);
  };

  const handleSubmitForm = (formData) => {
    if (editingWarehouse) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 bg-white/10 dark:bg-black/20 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl">
          <FiLoader className="text-4xl text-blue-500 animate-spin" />
          <p className="text-sm font-medium tracking-wide text-slate-700 dark:text-slate-300 animate-pulse">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent p-4 md:p-8 text-slate-800 dark:text-slate-100">
      
      {/* --- Abstract Background Ornaments (Subtle Glows) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mt-4">
          <div className="pl-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Warehouse Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm md:text-base">
              Manage all warehouse locations and storage seamlessly.
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95 w-full sm:w-fit"
          >
            <FiPlus size={18} /> New Warehouse
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl shadow-sm font-medium backdrop-blur-md text-sm">
            {error}
          </div>
        )}

        {/* Warehouses Grid / Empty State */}
        {warehouses.length === 0 ? (
          <div className="bg-white/30 dark:bg-slate-900/20 backdrop-blur-2xl border border-white/40 dark:border-white/[0.05] rounded-3xl shadow-xl p-12 md:p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white/50 dark:bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-white/40 dark:border-white/[0.05]">
              <FiBox className="text-3xl text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xl font-bold mb-1">No warehouses found</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">Get started by creating your first storage location.</p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <FiPlus size={16} /> Create First Warehouse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {warehouses.map((warehouse) => (
              <WarehouseCard
                key={warehouse._id}
                warehouse={warehouse}
                onEdit={() => handleOpenForm(warehouse)}
                onDelete={handleDelete}
                onView={(id) => onView ? onView(id) : null}
              />
            ))}
          </div>
        )}

        {/* Form Modal - Enhanced Glass Look */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            {/* Backdrop click handler */}
            <div className="absolute inset-0" onClick={() => {
              setShowForm(false);
              setEditingWarehouse(null);
            }}></div>
            
            <div className="relative z-10 w-full max-w-lg">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/[0.08] overflow-hidden transform transition-all">
                <WarehouseForm
                  warehouse={editingWarehouse}
                  onSubmit={handleSubmitForm}
                  onClose={() => {
                    setShowForm(false);
                    setEditingWarehouse(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}