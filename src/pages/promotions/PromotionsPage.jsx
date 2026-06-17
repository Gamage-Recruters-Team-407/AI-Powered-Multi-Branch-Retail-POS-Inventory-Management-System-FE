import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Search, Tag, AlertCircle, RefreshCw } from "lucide-react";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../services/promotionApi";
import PromotionsList from "../../components/promotions/PromotionsList";
import PromotionForm from "../../components/promotions/PromotionForm";
import PromotionDetailsModal from "../../components/promotions/PromotionDetailsModal";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [currentView, setCurrentView] = useState("list"); // list, add, edit, details
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await getPromotions();
      setPromotions(response.data || []);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      toast.error("Failed to load promotions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async (data) => {
    setSubmitLoading(true);
    try {
      await createPromotion(data);
      toast.success("Promotion created successfully!");
      setCurrentView("list");
      fetchPromotions();
    } catch (err) {
      console.error("Error creating promotion:", err);
      toast.error(err.response?.data?.message || "Failed to create promotion.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedPromo?._id) return;
    setSubmitLoading(true);
    try {
      await updatePromotion(selectedPromo._id, data);
      toast.success("Promotion updated successfully!");
      setCurrentView("list");
      setSelectedPromo(null);
      fetchPromotions();
    } catch (err) {
      console.error("Error updating promotion:", err);
      toast.error(err.response?.data?.message || "Failed to update promotion.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await deletePromotion(id);
      toast.success("Promotion deleted successfully!");
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
      toast.error("Failed to delete promotion.");
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const updatedData = { ...promo, isActive: !promo.isActive };
      // Omit DB fields that shouldn't be sent back in put payload if any, but backend usually handles it
      await updatePromotion(promo._id, updatedData);
      toast.success(`Promotion ${!promo.isActive ? "activated" : "deactivated"} successfully!`);
      fetchPromotions();
    } catch (err) {
      console.error("Error toggling promotion status:", err);
      toast.error("Failed to update status.");
    }
  };

  // Filter promotions based on search query and status filter
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") {
      return matchesSearch && promo.isActive;
    }
    if (statusFilter === "inactive") {
      return matchesSearch && !promo.isActive;
    }
    return matchesSearch;
  });

  return (
    <div className="bg-slate-50/50 backdrop-blur-md rounded-[28px] p-6 min-h-[calc(100vh-100px)] border border-slate-100/50 shadow-lg text-slate-800">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏷️</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketing & Campaigns</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Promotion & Discount Management
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Create discount rules, promo codes, branch exclusions, and track campaigns.
          </p>
        </div>

        {currentView === "list" && (
          <button
            onClick={() => setCurrentView("add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-blue-100"
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        )}
      </div>

      {/* Main Views */}
      {currentView === "list" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by code, campaign name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-semibold border border-transparent focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="all">All Campaigns</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <button
                onClick={fetchPromotions}
                disabled={loading}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-500 flex items-center justify-center"
                title="Refresh List"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <RefreshCw size={36} className="animate-spin text-blue-500" />
              </div>
              <p className="text-slate-500 font-bold text-sm">Loading campaigns...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                <Tag size={28} />
              </div>
              <h3 className="text-slate-800 font-extrabold text-base mb-1">No promotions found</h3>
              <p className="text-slate-400 text-xs font-medium max-w-sm mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search query or filters to find what you are looking for."
                  : "Launch your first promotional campaign to boost checkout conversion rates."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <button
                  onClick={() => setCurrentView("add")}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition duration-200 shadow-md shadow-blue-100"
                >
                  <Plus size={14} /> Create Promotion
                </button>
              )}
            </div>
          ) : (
            <PromotionsList
              promotions={filteredPromotions}
              onEdit={(promo) => {
                setSelectedPromo(promo);
                setCurrentView("edit");
              }}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onViewDetails={(promo) => {
                setSelectedPromo(promo);
                setCurrentView("details");
              }}
            />
          )}
        </div>
      )}

      {currentView === "add" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <button
              onClick={() => setCurrentView("list")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              ← Back to List
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">New Promotion Campaign</span>
          </div>
          <PromotionForm
            onSubmit={handleCreate}
            onCancel={() => setCurrentView("list")}
            loading={submitLoading}
          />
        </div>
      )}

      {currentView === "edit" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <button
              onClick={() => {
                setCurrentView("list");
                setSelectedPromo(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              ← Back to List
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">Edit Campaign: {selectedPromo?.name}</span>
          </div>
          <PromotionForm
            initialData={selectedPromo}
            onSubmit={handleUpdate}
            onCancel={() => {
              setCurrentView("list");
              setSelectedPromo(null);
            }}
            loading={submitLoading}
          />
        </div>
      )}

      {currentView === "details" && selectedPromo && (
        <PromotionDetailsModal
          promotion={selectedPromo}
          onClose={() => {
            setCurrentView("list");
            setSelectedPromo(null);
          }}
          onEdit={() => {
            setCurrentView("edit");
          }}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
}
