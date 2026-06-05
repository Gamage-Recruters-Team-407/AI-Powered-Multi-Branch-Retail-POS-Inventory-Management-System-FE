import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiLoader, FiBox } from "react-icons/fi";
import WarehouseCard from "../../components/warehouse/WarehouseCard";
import WarehouseForm from "../../components/warehouse/WarehouseForm";
import * as warehouseService from "../../services/warehouseService";

export default function WarehouseList() {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-5xl text-blue-600 animate-spin" />
          <p className="text-slate-500 font-semibold animate-pulse">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans overflow-hidden p-4 md:p-8">
      
      {/* --- Abstract Background Ornaments --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-300/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] left-[60%] w-72 h-72 bg-cyan-200/40 rounded-full blur-[90px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 mt-4">
          <div className="pl-2">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 drop-shadow-sm tracking-tight mb-3">
              Warehouse Management
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage all warehouse locations and storage seamlessly.</p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <FiPlus size={20} /> New Warehouse
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100/90 backdrop-blur-md border border-red-300 text-red-700 rounded-2xl shadow-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Warehouses Grid / Empty State */}
        {warehouses.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border-2 border-white/60 border-dashed shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 text-center">
            <div className="w-24 h-24 bg-blue-50/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
              <FiBox className="text-4xl text-blue-400" />
            </div>
            <p className="text-slate-600 text-xl font-bold mb-2">No warehouses found</p>
            <p className="text-slate-500 mb-8 font-medium">Get started by creating your first storage location.</p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95 hover:shadow-md"
            >
              <FiPlus size={18} /> Create First Warehouse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {warehouses.map((warehouse) => (
              <WarehouseCard
                key={warehouse._id}
                warehouse={warehouse}
                onEdit={() => handleOpenForm(warehouse)}
                onDelete={handleDelete}
                onView={(id) => navigate(`/warehouse/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Form Modal - Enhanced Glass Look */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark backdrop with blur */}
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => {
              setShowForm(false);
              setEditingWarehouse(null);
            }}></div>
            
            <div className="relative z-10 w-full max-w-lg">
              <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden transform transition-all">
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