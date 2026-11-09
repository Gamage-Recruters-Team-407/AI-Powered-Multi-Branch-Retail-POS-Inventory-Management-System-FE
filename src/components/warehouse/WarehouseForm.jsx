import { useState, useEffect } from "react";
import { FiX, FiMapPin, FiPhone, FiBox, FiAlignLeft, FiUser } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function WarehouseForm({ warehouse, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    phone: "",
    capacity: 1000,
    manager: "",
  });
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(true);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        ...warehouse,
        manager: warehouse.manager?._id || warehouse.manager || "",
      });
    }
  }, [warehouse]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = res.data; let userList = []; if (Array.isArray(raw)) userList = raw; else if (Array.isArray(raw?.users)) userList = raw.users; else if (Array.isArray(raw?.data)) userList = raw.data;
        setManagers(userList);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setManagersLoading(false);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // No outer wrapper here since WarehouseList handles the backdrop, 
    // but just in case this is used elsewhere, we apply a smooth container
    <div className="w-full h-full p-4 md:p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {warehouse ? "Edit Location" : "New Location"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {warehouse ? "Update warehouse details" : "Add a new storage facility"}
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
        
        {/* Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Warehouse Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FiAlignLeft size={18} />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
              placeholder="e.g., Colombo Main Hub"
            />
          </div>
        </div>

        {/* Location & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              City / Area <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiMapPin size={18} />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                placeholder="e.g., Colombo 02"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiPhone size={18} />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                placeholder="011 234 5678"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Full Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400 resize-none"
            placeholder="Complete street address..."
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Total Capacity (Units) <span className="text-red-500">*</span>
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
              required
              min="100"
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-bold text-blue-700 placeholder-slate-400"
              placeholder="1000"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Maximum number of items this facility can hold.
          </p>
        </div>

        {/* Manager */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Warehouse Manager
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FiUser size={18} />
            </div>
            {managersLoading ? (
              <div className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-400 font-medium text-sm">
                Loading managers...
              </div>
            ) : (
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700 appearance-none"
              >
                <option value="">-- Select a Manager --</option>
                {managers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Optional — assign a manager to this facility.
          </p>
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition-all hover:shadow-lg active:scale-95"
          >
            {warehouse ? "Save Changes" : "Create Facility"}
          </button>
        </div>
      </form>
    </div>
  );
}