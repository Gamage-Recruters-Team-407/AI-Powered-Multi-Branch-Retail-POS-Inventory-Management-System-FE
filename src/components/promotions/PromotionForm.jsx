import React, { useState, useEffect } from "react";
import { getAllBranches } from "../../services/branchApi";
import { Calendar, Tag, Percent, DollarSign, MapPin, Settings, RefreshCw } from "lucide-react";

export default function PromotionForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    branchRestrictions: [],
    usageLimit: 0,
  });

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true);
      try {
        const response = await getAllBranches();
        setBranches(response.data || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.title || initialData.name || "",
        code: initialData.couponCode || initialData.code || "",
        description: initialData.description || "",
        discountType: (initialData.discountType === "PERCENTAGE" || initialData.discountType === "percentage") ? "percentage" : "flat",
        discountValue: initialData.discountValue || 0,
        minPurchaseAmount: initialData.minPurchaseAmount || 0,
        maxDiscountAmount: initialData.maxDiscountAmount || 0,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        branchRestrictions: initialData.branches || initialData.branchRestrictions || [],
        usageLimit: initialData.usageLimit || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBranchChange = (branchId) => {
    setFormData((prev) => {
      const isSelected = prev.branchRestrictions.includes(branchId);
      const newBranches = isSelected
        ? prev.branchRestrictions.filter((id) => id !== branchId)
        : [...prev.branchRestrictions, branchId];
      return { ...prev, branchRestrictions: newBranches };
    });
  };

  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: code.toUpperCase() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Promotion name is required.");
      return;
    }
    if (!formData.code.trim()) {
      setError("Promo code is required.");
      return;
    }
    if (formData.discountValue <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    // Convert values to numbers and format for backend schema
    const payload = {
      title: formData.name,
      couponCode: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType === "percentage" ? "PERCENTAGE" : "FIXED",
      discountValue: Number(formData.discountValue),
      minPurchaseAmount: Number(formData.minPurchaseAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      branches: formData.branchRestrictions,
      usageLimit: Number(formData.usageLimit) > 0 ? Number(formData.usageLimit) : null,
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Core Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Promotion Name *</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer Super Sale"
                className="w-full rounded-xl border border-slate-200 pl-3.5 pr-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Promo / Coupon Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="SUMMER25"
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500 transition text-slate-700"
              />
              <button
                type="button"
                onClick={generatePromoCode}
                className="px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-slate-500 flex items-center justify-center"
                title="Generate Random Code"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Details about discount application terms, items included etc..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 transition text-slate-700"
          />
        </div>

        <hr className="border-slate-100" />

        {/* Rule Config Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Discount Type</label>
            <div className="flex rounded-xl bg-slate-50 border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, discountType: "percentage" }))}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                  formData.discountType === "percentage"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Percent size={11} /> Percentage
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, discountType: "flat" }))}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                  formData.discountType === "flat"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <DollarSign size={11} /> Flat Cash
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Discount Value ({formData.discountType === "percentage" ? "%" : "Rs."}) *
            </label>
            <input
              type="number"
              name="discountValue"
              min="0.01"
              step="any"
              required
              value={formData.discountValue || ""}
              onChange={handleChange}
              placeholder={formData.discountType === "percentage" ? "15" : "500"}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Min. Purchase Amount (Rs.)</label>
            <input
              type="number"
              name="minPurchaseAmount"
              min="0"
              value={formData.minPurchaseAmount || ""}
              onChange={handleChange}
              placeholder="e.g. 2000"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Max Discount Amount (Rs.) <span className="text-[9px] text-slate-400 font-medium">(Percentage Only)</span>
            </label>
            <input
              type="number"
              name="maxDiscountAmount"
              min="0"
              disabled={formData.discountType !== "percentage"}
              value={formData.maxDiscountAmount || ""}
              onChange={handleChange}
              placeholder="e.g. 1000"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Usage Limit (Times)</label>
            <input
              type="number"
              name="usageLimit"
              min="0"
              value={formData.usageLimit || ""}
              onChange={handleChange}
              placeholder="0 for unlimited"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center pt-5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="ml-2.5 text-xs font-bold text-slate-700 cursor-pointer">
              Set Campaign to Active
            </label>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Date Ranges & Branch Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-slate-400" />
              <label className="text-[10px] font-bold text-slate-400 uppercase">Validity Dates</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-slate-400" />
              <label className="text-[10px] font-bold text-slate-400 uppercase">Branch Restrictions</label>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-h-[120px] overflow-y-auto space-y-2">
              {branchesLoading ? (
                <div className="text-[10px] font-bold text-slate-400 text-center py-4">Loading branches...</div>
              ) : branches.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-400 text-center py-4">No branches registered.</div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-400 mb-1.5">
                    Select which branches this promotion is valid for (Leave empty for all branches)
                  </div>
                  {branches.map((branch) => (
                    <div key={branch._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`branch-${branch._id}`}
                        checked={formData.branchRestrictions.includes(branch._id)}
                        onChange={() => handleBranchChange(branch._id)}
                        className="h-3.5 w-3.5 text-blue-600 border-slate-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`branch-${branch._id}`} className="ml-2 text-xs text-slate-700 font-semibold cursor-pointer">
                        {branch.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition flex items-center justify-center gap-1"
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {initialData ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </form>
    </div>
  );
}
