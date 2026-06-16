// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, RefreshCw } from "lucide-react";
// import { getSales, voidSale, getSalesSummary } from "../../services/salesApi";
// import { useSales } from "../../context/SalesContext";
// import SalesTable from "../../components/pos/SalesTable";

// const SalesHistoryPage = () => {
//   const navigate = useNavigate();
//   const { sales: localSales } = useSales();

//   const [sales, setSales]         = useState([]);
//   const [summary, setSummary]     = useState(null);
//   const [loading, setLoading]     = useState(false);
//   const [period, setPeriod]       = useState("today");
//   const [paymentFilter, setPaymentFilter] = useState("");
//   const [page, setPage]           = useState(1);
//   const [pagination, setPagination] = useState({});

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [sRes, sumRes] = await Promise.all([
//         getSales({ paymentMethod: paymentFilter || undefined, page }),
//         getSalesSummary(period),
//       ]);
//       setSales(sRes.data.data);
//       setPagination(sRes.data.pagination || {});
//       setSummary(sumRes.data.data);
//     } catch {
//       // Fallback to local context
//       setSales(localSales);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadData(); }, [period, paymentFilter, page]);

//   const handleVoid = async (sale) => {
//     if (!window.confirm(`Void sale ${sale.invoiceNumber}? This will restore inventory.`)) return;
//     try {
//       await voidSale(sale._id);
//       loadData();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to void sale");
//     }
//   };

//   const handleView = (sale) => navigate("/receipt", { state: { sale } });

//   return (
//     <div className="min-h-screen bg-slate-50 p-5">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate("/pos")} className="text-gray-500 hover:text-gray-800">
//             <ArrowLeft size={20} />
//           </button>
//           <h1 className="text-2xl font-bold text-blue-600">Sales History</h1>
//         </div>
//         <button onClick={loadData} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
//           <RefreshCw size={14} /> Refresh
//         </button>
//       </div>

//       {/* Summary Cards */}
//       {summary && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
//           {[
//             { label: "Revenue",       value: `Rs.${summary.totalRevenue?.toLocaleString() ?? 0}`,               color: "text-blue-600" },
//             { label: "Transactions",  value: summary.totalTransactions ?? 0,                                    color: "text-gray-700" },
//             { label: "Avg. Value",    value: `Rs.${Math.round(summary.avgTransactionValue ?? 0).toLocaleString()}`, color: "text-gray-700" },
//             { label: "Cash / Card / QR",
//               value: `${Math.round(summary.cashSales ?? 0).toLocaleString()} / ${Math.round(summary.cardSales ?? 0).toLocaleString()} / ${Math.round(summary.qrSales ?? 0).toLocaleString()}`,
//               color: "text-gray-700" },
//           ].map(({ label, value, color }) => (
//             <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
//               <p className="text-xs text-gray-400">{label}</p>
//               <p className={`font-bold mt-0.5 ${color} text-sm`}>{value}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3">
//         <div className="flex gap-1">
//           {["today", "week", "month"].map((p) => (
//             <button
//               key={p}
//               onClick={() => { setPeriod(p); setPage(1); }}
//               className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
//                 period === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//         <select
//           value={paymentFilter}
//           onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
//           className="border rounded-lg px-3 py-1.5 text-xs outline-none"
//         >
//           <option value="">All Payments</option>
//           <option value="CASH">Cash</option>
//           <option value="CARD">Card</option>
//           <option value="QR">QR</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
//         ) : (
//           <SalesTable sales={sales} onView={handleView} onVoid={handleVoid} />
//         )}

//         {/* Pagination */}
//         {pagination.pages > 1 && (
//           <div className="flex justify-center gap-2 p-4 border-t">
//             {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
//               <button
//                 key={p}
//                 onClick={() => setPage(p)}
//                 className={`w-8 h-8 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SalesHistoryPage;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, DollarSign, CreditCard, QrCode, BarChart3 } from "lucide-react";
import { getSales, voidSale, getSalesSummary } from "../../services/salesApi";
import { useSales } from "../../context/SalesContext";
import SalesTable from "../../components/pos/SalesTable";

const SalesHistoryPage = ({ onBack }) => {
  const navigate = useNavigate();
  const { sales: localSales } = useSales();

  const [sales, setSales]         = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [period, setPeriod]       = useState("today");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, sumRes] = await Promise.all([
        getSales({ paymentMethod: paymentFilter || undefined, page }),
        getSalesSummary(period),
      ]);
      setSales(sRes.data.data);
      setPagination(sRes.data.pagination || {});
      setSummary(sumRes.data.data);
    } catch {
      setSales(localSales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period, paymentFilter, page]);

  const handleVoid = async (sale) => {
    if (!window.confirm(`Void sale ${sale.invoiceNumber}? This will restore inventory.`)) return;
    try {
      await voidSale(sale._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to void sale");
    }
  };

  const handleView = (sale) => onBack 
  ? navigate("/receipt", { state: { sale } }) 
  : navigate("/receipt", { state: { sale } });

  
  const getIcon = (label) => {
    switch (label) {
      case "Revenue": return <DollarSign size={18} className="text-blue-500" />;
      case "Transactions": return <BarChart3 size={18} className="text-amber-500" />;
      case "Cash / Card / QR": return <CreditCard size={18} className="text-purple-500" />;
      default: return <DollarSign size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 antialiased font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onBack ? onBack() : navigate("/pos")}
           className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sales History</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-semibold bg-white border rounded-xl px-3 py-2 text-slate-600 hover:text-slate-900 transition shadow-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Revenue",       value: `Rs.${summary.totalRevenue?.toLocaleString() ?? 0}`,              color: "text-blue-600 bg-blue-50/50" },
            { label: "Transactions",  value: summary.totalTransactions ?? 0,                                   color: "text-slate-800 bg-slate-50" },
            { label: "Avg. Value",     value: `Rs.${Math.round(summary.avgTransactionValue ?? 0).toLocaleString()}`, color: "text-slate-800 bg-slate-50" },
            { label: "Cash / Card / QR",
              value: `${Math.round(summary.cashSales ?? 0).toLocaleString()} / ${Math.round(summary.cardSales ?? 0).toLocaleString()} / ${Math.round(summary.qrSales ?? 0).toLocaleString()}`,
              color: "text-slate-800 bg-slate-50" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{label}</p>
                <p className={`font-bold mt-1.5 text-base md:text-lg tracking-tight text-slate-800`}>{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${color.split(' ')[1] || 'bg-slate-50'}`}>
                {getIcon(label)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {["today", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                period === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white"
        >
          <option value="">All Payment Methods</option>
          <option value="CASH">💰 Cash</option>
          <option value="CARD">💳 Card</option>
          <option value="QR">📱 QR Code</option>
        </select>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <SalesTable sales={sales} onView={handleView} onVoid={handleVoid} />
          </div>
        )}

        
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-1.5 p-4 border-t border-slate-100 bg-slate-50/50">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  p === page 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistoryPage;