import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useBranches } from "../../context/BranchContext";

export default function AddBranchPage() {
  const navigate = useNavigate();
  const { addBranch, loading } = useBranches();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    contactNumber: "",
    address: "",
    manager: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [managers, setManagers] = useState([]);

  useEffect(() => {
  const fetchManagers = async () => {
    try {
      const response = await axiosInstance.get("/users/managers");
      setManagers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch managers:", error);
    }
  };

  fetchManagers();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.code) {
      setError("Branch name and code are required");
      return;
    }

    try {
      await addBranch(formData);
      navigate("/branches");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create branch");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Branch</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Downtown Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DT-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="555-1234"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>

              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <option value="">Select Manager</option>

              {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
               {manager.name ||
               `${manager.firstName || ""} ${manager.lastName || ""}`.trim()}
             </option>
               ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                Active Branch
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Branch"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/branches")}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}