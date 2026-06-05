import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBranchById, getBranchInventory, getBranchSales, getBranchEmployees, getBranchPerformance } from "../../services/branchApi";

export default function BranchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, invRes, salesRes, empRes, perfRes] = await Promise.all([
          getBranchById(id),
          getBranchInventory(id).catch(() => ({ data: [] })),
          getBranchSales(id).catch(() => ({ data: [] })),
          getBranchEmployees(id).catch(() => ({ data: [] })),
          getBranchPerformance(id).catch(() => ({ data: {} })),
        ]);

        setBranch(branchRes.data);
        setInventory(invRes.data || []);
        setSales(salesRes.data || []);
        setEmployees(empRes.data || []);
        setPerformance(perfRes.data || {});
      } catch (err) {
        console.error("Error fetching branch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (!branch) return <div className="text-center p-8 text-lg">Branch not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{branch.name}</h1>
              <p className="text-gray-600 text-lg">{branch.city}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/branches/edit/${id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => navigate("/branches")}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Back
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Code</p>
              <p className="text-lg font-semibold">{branch.code || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Contact</p>
              <p className="text-lg font-semibold">{branch.contactNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Manager</p>
              <p className="text-lg font-semibold">{branch.manager || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className={`text-lg font-semibold ${branch.isActive ? "text-green-600" : "text-red-600"}`}>
                {branch.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            {["info", "inventory", "sales", "employees", "performance"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-semibold transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Branch Information</h2>
                <div className="space-y-3">
                  <p><strong>Name:</strong> {branch.name}</p>
                  <p><strong>Code:</strong> {branch.code || "N/A"}</p>
                  <p><strong>City:</strong> {branch.city || "N/A"}</p>
                  <p><strong>Contact:</strong> {branch.contactNumber || "N/A"}</p>
                  <p><strong>Manager:</strong> {branch.manager || "N/A"}</p>
                  <p><strong>Address:</strong> {branch.address || "N/A"}</p>
                  <p><strong>Status:</strong> {branch.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Inventory</h2>
                {inventory.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Product</th>
                        <th className="border p-2 text-left">Quantity</th>
                        <th className="border p-2 text-left">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">{item.productName || item.name}</td>
                          <td className="border p-2">{item.quantity}</td>
                          <td className="border p-2">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No inventory data</p>
                )}
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === "sales" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Sales</h2>
                {sales.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Total</th>
                        <th className="border p-2 text-left">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="border p-2">${sale.total}</td>
                          <td className="border p-2">{sale.itemCount || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No sales data</p>
                )}
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === "employees" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Employees</h2>
                {employees.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Role</th>
                        <th className="border p-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border p-2">{emp.name}</td>
                          <td className="border p-2">{emp.role}</td>
                          <td className="border p-2">{emp.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600">No employees assigned</p>
                )}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
                {performance && Object.keys(performance).length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(performance).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded">
                        <p className="text-gray-600">{key}</p>
                        <p className="text-2xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No performance data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}