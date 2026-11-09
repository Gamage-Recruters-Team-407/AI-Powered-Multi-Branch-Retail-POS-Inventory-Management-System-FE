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
import {
  Store,
  Pencil,
  ArrowLeft,
  Hash,
  Phone,
  UserCircle2,
  MapPin,
  Package,
  Wallet,
  Users,
  BarChart3,
  Building2,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

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
  const [salesPage, setSalesPage] = useState(1);
  const SALES_PER_PAGE = 10;
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
      setSalesPage(1);
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

  const salesTotalPages = Math.max(1, Math.ceil(sales.length / SALES_PER_PAGE));
  const paginatedSales = sales.slice(
    (salesPage - 1) * SALES_PER_PAGE,
    salesPage * SALES_PER_PAGE
  );

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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
              <Store className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Branch Management
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {branch.name}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {branch.city || "Location not set"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-blue-100"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-3 px-5 rounded-xl transition duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>

       {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Code
              </p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                {branch.code || "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Contact
              </p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                {branch.contactNumber || "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <UserCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Manager
              </p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                {getManagerName(branch.manager)}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${branch.isActive ? "bg-green-50" : "bg-red-50"}`}
            >
              <Building2
                className={`w-5 h-5 ${branch.isActive ? "text-green-600" : "text-red-600"}`}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </p>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {branch.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6 overflow-x-auto">
          {[
            { id: "info", label: "Info", Icon: Store },
            { id: "inventory", label: "Inventory", Icon: Package },
            { id: "sales", label: "Sales", Icon: Wallet },
            { id: "employees", label: "Employees", Icon: Users },
            { id: "performance", label: "Performance", Icon: BarChart3 },
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
              <tab.Icon className="w-4 h-4" />
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
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: branch.name, Icon: Store, bg: "bg-blue-50", color: "text-blue-600" },
                    { label: "Code", value: branch.code || "N/A", Icon: Hash, bg: "bg-indigo-50", color: "text-indigo-600" },
                    { label: "City", value: branch.city || "N/A", Icon: MapPin, bg: "bg-emerald-50", color: "text-emerald-600" },
                    { label: "Contact", value: branch.contactNumber || "N/A", Icon: Phone, bg: "bg-amber-50", color: "text-amber-600" },
                    { label: "Manager", value: getManagerName(branch.manager), Icon: UserCircle2, bg: "bg-purple-50", color: "text-purple-600" },
                    { label: "Address", value: branch.address || "N/A", Icon: MapPin, bg: "bg-rose-50", color: "text-rose-600" },
                  ].map(({ label, value, Icon, bg, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition"
                    >
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${branch.isActive ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <Building2
                        className={`w-5 h-5 ${branch.isActive ? "text-green-600" : "text-red-600"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </p>
                      <span
                        className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${branch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
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
                      <tr className="border-b border-slate-100 bg-slate-50/50">
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
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            {item.product?.name || "Unknown Product"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Rs {item.product?.price ?? "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
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
                      <tr className="border-b border-slate-100 bg-slate-50/50">
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
                      {paginatedSales.map((sale) => (
                        <tr
                          key={sale._id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Rs {sale.totalAmount?.toFixed(2) ?? "0.00"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                              {sale.items?.length ?? "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-sm">
                    No sales data for this branch
                  </p>
                </div>
              )}

              {sales.length > SALES_PER_PAGE && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-xs font-medium text-slate-500">
                    Showing {(salesPage - 1) * SALES_PER_PAGE + 1}–
                    {Math.min(salesPage * SALES_PER_PAGE, sales.length)} of{" "}
                    {sales.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                      disabled={salesPage === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Prev
                    </button>
                    {Array.from({ length: salesTotalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setSalesPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            salesPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setSalesPage((p) => Math.min(salesTotalPages, p + 1))
                      }
                      disabled={salesPage === salesTotalPages}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}

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
              </div>{employees.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
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
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {emp.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              {emp.name}
                            </div>
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
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(performance).map(([key, value], idx) => {
                    const icons = [ShoppingBag, Wallet, Package, Users];
                    const colors = ["bg-blue-50 text-blue-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600", "bg-purple-50 text-purple-600"];
                    const Icon = icons[idx % icons.length];
                    return (
                      <div
                        key={key}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                      >
                        <div className={`w-10 h-10 rounded-xl ${colors[idx % colors.length]} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {key}
                        </p>
                        <p className="text-2xl font-extrabold text-slate-800">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
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
