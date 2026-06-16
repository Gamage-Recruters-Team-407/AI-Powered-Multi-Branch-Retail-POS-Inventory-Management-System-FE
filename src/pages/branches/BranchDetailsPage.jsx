import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBranchById,
  getBranchInventory,
  getBranchSales,
  getBranchEmployees,
  getBranchPerformance,
} from "../../services/branchApi";
import EditBranchModal from "./EditBranchModal";
import { useAuth } from "../../context/AuthContext";

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

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (!branch)
    return <div className="text-center p-8 text-lg">Branch not found</div>;

  const getManagerName = (manager) => {
    if (!manager) return "N/A";
    if (typeof manager === "string") return manager;
    if (manager.displayName) return manager.displayName;
    return (
      `${manager.firstName || ""} ${manager.lastName || ""}`.trim() ||
      manager.email ||
      "N/A"
    );
  };

  return (
    <>
      <div
        className="rounded-[28px] p-6 min-h-[calc(100vh-100px)] shadow-lg text-slate-800"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏪</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Branch Management
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {branch.name}
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              {branch.city}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-blue-100"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3 px-5 rounded-xl transition duration-200"
            >
              Back
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8">
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6">
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
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

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
                    className="flex items-center gap-4 border-b border-slate-50 pb-3"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full">
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
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.product?.name || "Unknown Product"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                            ${item.product?.price ?? "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-slate-500 font-bold text-sm">
                    No inventory data for this branch
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  Sales
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Recent sales for this branch
                </p>
              </div>
              {sales.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full">
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
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {new Date(sale.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                            ${sale.total}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                              {sale.itemCount || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-slate-500 font-bold text-sm">
                    No sales data for this branch
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  Employees
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Staff assigned to this branch
                </p>
              </div>
              {employees.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full">
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
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {emp.name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg">
                              {emp.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {emp.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-slate-500 font-bold text-sm">
                    No employees assigned to this branch
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-base font-extrabold text-slate-800">
                  Performance Metrics
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Key stats for this branch
                </p>
              </div>
              {performance && Object.keys(performance).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>

      {isAdmin && showEditModal && (
        <EditBranchModal
          branchId={id}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchData();
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}
