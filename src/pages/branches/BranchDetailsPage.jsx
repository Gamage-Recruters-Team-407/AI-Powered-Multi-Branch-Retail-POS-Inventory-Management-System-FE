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
<<<<<<< Updated upstream
=======
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchData = async () => {
    try {
      const [branchRes, invRes, salesRes, empRes, perfRes] = await Promise.all([
        getBranchById(id),
        getBranchInventory(id).catch(() => ({ data: [] })),
        getBranchSales(id).catch(() => ({ data: [] })),
        getBranchEmployees(id).catch(() => ({ data: [] })),
        getBranchPerformance(id).catch(() => ({ data: {} })),
      ]);
      const rawBranch = branchRes.data;
      setBranch(rawBranch?.data || rawBranch?.branch || rawBranch || null);

      const rawInv = invRes.data;
      const invList = Array.isArray(rawInv) ? rawInv : (Array.isArray(rawInv?.data) ? rawInv.data : []);
      setInventory(invList);

      const rawSales = salesRes.data;
      const salesList = Array.isArray(rawSales) ? rawSales : (Array.isArray(rawSales?.data) ? rawSales.data : []);
      setSales(salesList);

      const rawEmp = empRes.data;
      const empList = Array.isArray(rawEmp) ? rawEmp : (Array.isArray(rawEmp?.data) ? rawEmp.data : []);
      setEmployees(empList);

      const rawPerf = perfRes.data;
      setPerformance(rawPerf?.data || rawPerf || {});
    } catch (err) {
      console.error("Error fetching branch data:", err);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
=======
    <>
      <div
        className="rounded-2xl md:rounded-[28px] p-4 md:p-6 min-h-[calc(100vh-100px)] shadow-lg text-slate-800"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Code
            </p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">
              {branch.code || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contact
            </p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">
              {branch.contactNumber || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Manager
            </p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">
              {getManagerName(branch.manager)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status
            </p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {branch.isActive ? "Active" : "Inactive"}
            </span>
>>>>>>> Stashed changes
          </div>
        </div>

        {/* Tabs */}
<<<<<<< Updated upstream
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
=======
        <div className="flex flex-wrap md:flex-nowrap gap-1 bg-white border border-slate-200 rounded-xl p-1 w-full md:w-fit mb-6 overflow-x-auto">
          {[
            { id: "info", label: "Info", icon: "🏪" },
            { id: "inventory", label: "Inventory", icon: "📦" },
            { id: "sales", label: "Sales", icon: "💰" },
            { id: "employees", label: "Employees", icon: "👥" },
            { id: "performance", label: "Performance", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
>>>>>>> Stashed changes
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

<<<<<<< Updated upstream
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
=======
        {/* Tab Content */}
        <div>
          {/* Info Tab */}
          {activeTab === "info" && (
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  Branch Information
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Full details for this branch
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                {[
                  { label: "Name", value: branch.name },
                  { label: "Code", value: branch.code || "N/A" },
                  { label: "City", value: branch.city || "N/A" },
                  { label: "Contact", value: branch.contactNumber || "N/A" },
                  { label: "Manager", value: getManagerName(branch.manager) },
                  { label: "Address", value: branch.address || "N/A" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-slate-50 pb-3"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
>>>>>>> Stashed changes
                </div>
              </div>
            )}

<<<<<<< Updated upstream
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
=======
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  Inventory
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Stock levels for this branch
                </p>
              </div>
              {inventory.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Price
                        </th>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
              {sales.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Items
                        </th>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
              {employees.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Email
                        </th>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
              {performance && Object.keys(performance).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(performance).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {key}
                      </p>
                      <p className="text-2xl font-extrabold text-slate-800">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-slate-500 font-bold text-sm">
                    No performance data available
                  </p>
                </div>
              )}
            </div>
          )}
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}