import { useState, useEffect } from "react";
import { FiX, FiLayers, FiHash, FiBox, FiAlignLeft } from "react-icons/fi";

export default function ZoneForm({ zone, onSubmit, onClose, loading = false }) {
  const [formData, setFormData] = useState({
    zoneName: "",
    zoneCode: "",
    capacity: 500,
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (zone) {
      setFormData({
        zoneName: zone.zoneName || "",
        zoneCode: zone.zoneCode || "",
        capacity: zone.capacity || 500,
        description: zone.description || "",
      });
    }
  }, [zone]);

  const validate = () => {
    const newErrors = {};
    if (!formData.zoneName.trim()) newErrors.zoneName = "Zone name is required";
    if (!formData.zoneCode.trim()) newErrors.zoneCode = "Zone code is required";
    if (!formData.capacity || formData.capacity < 1)
      newErrors.capacity = "Capacity must be at least 1";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    // Outer wrapper handles the backdrop, we just need a clean container here
    <div className="w-full h-full p-4 md:p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {zone ? "Edit Zone" : "Add Storage Zone"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {zone ? "Update zone configurations" : "Create a new partition in this warehouse"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
          title="Close"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Zone Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Zone Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FiLayers size={18} />
            </div>
            <input
              type="text"
              name="zoneName"
              value={formData.zoneName}
              onChange={handleChange}
              className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder-slate-400 ${
                errors.zoneName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="e.g., Cold Storage, Rack A"
            />
          </div>
          {errors.zoneName && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.zoneName}</p>
          )}
        </div>

        {/* Zone Code & Capacity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Zone Code */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Zone Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiHash size={18} />
              </div>
              <input
                type="text"
                name="zoneCode"
                value={formData.zoneCode}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700 uppercase placeholder-slate-400 ${
                  errors.zoneCode ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="e.g., Z-A, COLD"
              />
            </div>
            {errors.zoneCode ? (
              <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.zoneCode}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5 font-medium ml-1">
                Short unique ID for this zone.
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Capacity (units) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiBox size={18} />
              </div>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-blue-700 placeholder-slate-400 ${
                  errors.capacity ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="500"
              />
            </div>
            {errors.capacity && (
              <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-4 flex items-center pointer-events-none text-slate-400">
              <FiAlignLeft size={18} />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400 resize-none"
              placeholder="Optional details about this zone..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl font-bold transition-all hover:shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : zone ? (
              "Save Changes"
            ) : (
              "Create Zone"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}