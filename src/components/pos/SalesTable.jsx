// const SalesTable = ({ sales }) => {
//   return (
//     <table className="w-full">
//       <thead>
//         <tr className="bg-blue-50">
//           <th className="p-3 text-left">
//             Invoice
//           </th>

//           <th className="p-3 text-left">
//             Date
//           </th>

//           <th className="p-3 text-left">
//             Amount
//           </th>

//           <th className="p-3 text-left">
//             Payment
//           </th>
//         </tr>
//       </thead>

//       <tbody>
//         {sales.map((sale) => (
//           <tr
//             key={sale.id}
//             className="border-b"
//           >
//             <td className="p-3">
//               {sale.invoice}
//             </td>

//             <td className="p-3">
//               {sale.date}
//             </td>

//             <td className="p-3">
//               Rs. {sale.amount}
//             </td>

//             <td className="p-3">
//               {sale.payment}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default SalesTable;

// import { Eye, XCircle } from "lucide-react";

// const PAYMENT_COLORS = {
//   CASH: "bg-green-100 text-green-700",
//   CARD: "bg-blue-100 text-blue-700",
//   QR:   "bg-purple-100 text-purple-700",
// };
// const STATUS_COLORS = {
//   COMPLETED: "bg-green-100 text-green-700",
//   VOIDED:    "bg-red-100 text-red-600",
//   REFUNDED:  "bg-yellow-100 text-yellow-700",
// };

// ps: sales (array), onView(sale), onVoid(sale)
//  */
// const SalesTable = ({ sales = [], onView, onVoid }) => {
//   if (sales.length === 0) {
//     return (
//       <div className="text-center py-12 text-gray-400 text-sm">
//         No sales records found
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead className="bg-blue-50 text-gray-600">
//           <tr>
//             <th className="text-left px-4 py-3 font-medium">Invoice</th>
//             <th className="text-left px-4 py-3 font-medium">Date & Time</th>
//             <th className="text-left px-4 py-3 font-medium">Cashier</th>
//             <th className="text-right px-4 py-3 font-medium">Amount</th>
//             <th className="text-center px-4 py-3 font-medium">Payment</th>
//             <th className="text-center px-4 py-3 font-medium">Status</th>
//             <th className="text-center px-4 py-3 font-medium">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sales.map((sale) => (
//             <tr key={sale._id || sale.id} className="border-t hover:bg-slate-50 transition">
//               <td className="px-4 py-3 font-mono text-xs font-semibold">
//                 {sale.invoiceNumber || sale.invoice}
//               </td>
//               <td className="px-4 py-3 text-gray-500 text-xs">
//                 {new Date(sale.createdAt || sale.date).toLocaleString("en-LK")}
//               </td>
//               <td className="px-4 py-3 text-xs">
//                 {sale.cashier?.name || sale.cashierName || "–"}
//               </td>
//               <td className="px-4 py-3 text-right font-semibold text-blue-600">
//                 Rs.{(sale.totalAmount ?? sale.amount)?.toLocaleString()}
//               </td>
//               <td className="px-4 py-3 text-center">
//                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                   PAYMENT_COLORS[sale.paymentMethod ?? sale.payment?.toUpperCase()] ||
//                   "bg-gray-100 text-gray-600"
//                 }`}>
//                   {sale.paymentMethod ?? sale.payment}
//                 </span>
//               </td>
//               <td className="px-4 py-3 text-center">
//                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                   STATUS_COLORS[sale.status] || "bg-gray-100 text-gray-600"
//                 }`}>
//                   {sale.status || "COMPLETED"}
//                 </span>
//               </td>
//               <td className="px-4 py-3 text-center">
//                 <div className="flex items-center justify-center gap-2">
//                   <button
//                     onClick={() => onView?.(sale)}
//                     title="View Receipt"
//                     className="text-blue-500 hover:text-blue-700"
//                   >
//                     <Eye size={15} />
//                   </button>
//                   {(sale.status === "COMPLETED" || !sale.status) && onVoid && (
//                     <button
//                       onClick={() => onVoid?.(sale)}
//                       title="Void Sale"
//                       className="text-red-400 hover:text-red-600"
//                     >
//                       <XCircle size={15} />
//                     </button>
//                   )}
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SalesTable;

import { Eye, XCircle } from "lucide-react";

const PAYMENT_COLORS = {
  CASH: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  CARD: "bg-blue-50 text-blue-700 border-blue-200/50",
  QR:   "bg-purple-50 text-purple-700 border-purple-200/50",
};

const STATUS_COLORS = {
  COMPLETED: "bg-emerald-100 text-emerald-800",
  VOIDED:    "bg-rose-100 text-rose-700",
  REFUNDED:  "bg-amber-100 text-amber-800",
};

const SalesTable = ({ sales = [], onView, onVoid }) => {
  if (sales.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 font-medium text-sm bg-white rounded-xl">
        No sales records found in selected range.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <th className="px-5 py-3.5 font-bold">Invoice ID</th>
            <th className="px-5 py-3.5 font-bold">Date & Time</th>
            <th className="px-5 py-3.5 font-bold">Cashier Desk</th>
            <th className="px-5 py-3.5 font-bold text-right">Net Amount</th>
            <th className="px-5 py-3.5 font-bold text-center">Payment</th>
            <th className="px-5 py-3.5 font-bold text-center">Status</th>
            <th className="px-5 py-3.5 font-bold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sales.map((sale) => (
            <tr key={sale._id || sale.id} className="hover:bg-slate-50/80 transition duration-150 group">
              <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                {sale.invoiceNumber || sale.invoice}
              </td>
              <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">
                {new Date(sale.createdAt || sale.date).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                {sale.cashier?.name || sale.cashierName || "System Walk-In"}
              </td>
              <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                Rs.{(sale.totalAmount ?? sale.amount)?.toLocaleString()}
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                  PAYMENT_COLORS[sale.paymentMethod ?? sale.payment?.toUpperCase()] ||
                  "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {sale.paymentMethod ?? sale.payment}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold tracking-wide uppercase ${
                  STATUS_COLORS[sale.status?.toUpperCase()] || "bg-emerald-100 text-emerald-800"
                }`}>
                  {sale.status || "COMPLETED"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onView?.(sale)}
                    title="View Full Receipt"
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Eye size={15} />
                  </button>
                  {(sale.status === "COMPLETED" || !sale.status) && onVoid && (
                    <button
                      onClick={() => onVoid?.(sale)}
                      title="Void / Cancel Transaction"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;