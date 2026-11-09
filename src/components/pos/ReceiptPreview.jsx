// const ReceiptPreview = ({
//   items,
//   total,
// }) => {
//   return (
//     <div className="bg-white rounded-xl p-6 shadow">
//       <h2 className="text-center text-2xl font-bold text-blue-600">
//         DIGITAL RECEIPT
//       </h2>

//       <hr className="my-4" />

//       {items.map((item) => (
//         <div
//           key={item._id}
//           className="flex justify-between mb-2"
//         >
//           <span>
//             {item.name} x {item.qty}
//           </span>

//           <span>
//             Rs. {item.price * item.qty}
//           </span>
//         </div>
//       ))}

//       <hr className="my-4" />

//       <div className="flex justify-between text-xl font-bold text-blue-600">
//         <span>Total</span>
//         <span>Rs. {total}</span>
//       </div>
//     </div>
//   );
// };

// export default ReceiptPreview;

// import { Printer } from "lucide-react";

// const ReceiptPreview = ({ sale }) => {
//   if (!sale) return null;

//   const handlePrint = () => window.print();

//   return (
//     <div>
//       {/* Receipt */}
//       <div id="receipt-print" className="bg-white font-mono text-sm p-6 rounded-xl border max-w-sm mx-auto">
//         {/* Store header */}
//         <div className="text-center mb-3">
//           <h2 className="text-lg font-bold">{sale.branch?.name || "RETAIL STORE"}</h2>
//           {sale.branch?.address && <p className="text-xs text-gray-500">{sale.branch.address}</p>}
//           <div className="border-b-2 border-dashed mt-2" />
//         </div>

//         {/* Invoice info */}
//         <div className="space-y-0.5 text-xs mb-3">
//           <div className="flex justify-between">
//             <span className="text-gray-500">Invoice #</span>
//             <span className="font-semibold">{sale.invoiceNumber || sale.invoice}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Date</span>
//             <span>{new Date(sale.createdAt || sale.date).toLocaleString("en-LK")}</span>
//           </div>
//           {(sale.cashier?.name) && (
//             <div className="flex justify-between">
//               <span className="text-gray-500">Cashier</span>
//               <span>{sale.cashier.name}</span>
//             </div>
//           )}
//           {sale.customer?.name && (
//             <div className="flex justify-between">
//               <span className="text-gray-500">Customer</span>
//               <span>{sale.customer.name}</span>
//             </div>
//           )}
//         </div>

//         <div className="border-b border-dashed mb-2" />

//         {/* Items */}
//         <div className="space-y-1.5 mb-3">
//           {(sale.items || []).map((item, i) => (
//             <div key={i}>
//               <div className="flex justify-between">
//                 <span className="flex-1 mr-2 truncate">{item.name}</span>
//                 <span>Rs.{(item.lineTotal ?? item.price * item.qty)?.toLocaleString()}</span>
//               </div>
//               <div className="text-[10px] text-gray-400 pl-2">
//                 {item.qty} × Rs.{(item.unitPrice ?? item.price)?.toLocaleString()}
//                 {item.discount > 0 && ` (${item.discount}% off)`}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="border-b border-dashed mb-2" />

//         {/* Totals */}
//         <div className="space-y-0.5 text-xs">
//           <div className="flex justify-between text-gray-600">
//             <span>Subtotal</span>
//             <span>Rs.{sale.subtotal?.toLocaleString()}</span>
//           </div>
//           {(sale.discountAmount > 0) && (
//             <div className="flex justify-between text-green-600">
//               <span>Discount</span>
//               <span>– Rs.{sale.discountAmount?.toLocaleString()}</span>
//             </div>
//           )}
//           {(sale.taxAmount > 0) && (
//             <div className="flex justify-between text-gray-600">
//               <span>Tax ({sale.taxRate}%)</span>
//               <span>Rs.{sale.taxAmount?.toLocaleString()}</span>
//             </div>
//           )}
//         </div>

//         <div className="border-b border-dashed my-2" />

//         <div className="flex justify-between font-bold text-base">
//           <span>TOTAL</span>
//           <span className="text-blue-600">Rs.{(sale.totalAmount ?? sale.amount)?.toLocaleString()}</span>
//         </div>

//         <div className="flex justify-between text-xs text-gray-500 mt-1">
//           <span>Payment</span>
//           <span className="font-semibold">{sale.paymentMethod ?? sale.payment}</span>
//         </div>

//         {sale.paymentMethod === "CASH" && sale.cashReceived && (
//           <>
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>Cash Received</span>
//               <span>Rs.{sale.cashReceived?.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>Change</span>
//               <span>Rs.{sale.changeGiven?.toLocaleString()}</span>
//             </div>
//           </>
//         )}

//         <div className="border-t border-dashed mt-3 pt-2 text-center text-[10px] text-gray-400">
//           <p>Thank you for shopping!</p>
//           <p>Please keep this receipt for returns.</p>
//         </div>
//       </div>

//       {/* Print button */}
//       <div className="text-center mt-4 print:hidden">
//         <button
//           onClick={handlePrint}
//           className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 mx-auto text-sm font-medium"
//         >
//           <Printer size={15} /> Print Receipt
//         </button>
//       </div>

//       <style>{`
//         @media print {
//           body * { visibility: hidden; }
//           #receipt-print, #receipt-print * { visibility: visible; }
//           #receipt-print { position: fixed; left: 0; top: 0; width: 80mm; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ReceiptPreview;

import { Printer } from "lucide-react";

const ReceiptPreview = ({ sale }) => {
  if (!sale) return null;

  const handlePrint = () => window.print();

  return (
    <div className="w-full">
      <div id="receipt-print" className="bg-white font-mono text-xs p-5 rounded-xl border border-slate-200 max-w-sm mx-auto shadow-sm text-slate-800">
        <div className="text-center mb-4">
          <h2 className="text-base font-bold tracking-tight uppercase">{sale.branch?.name || "SMART RETAIL POS"}</h2>
          {sale.branch?.address && <p className="text-[10px] text-slate-500 mt-0.5">{sale.branch.address}</p>}
          <div className="border-b border-dashed border-slate-300 mt-3" />
        </div>

        {/* Metadata Details */}
        <div className="space-y-1 text-[11px] mb-3 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-400">Invoice:</span>
            <span className="font-bold">{sale.invoiceNumber || sale.invoice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date:</span>
            <span>{new Date(sale.createdAt || sale.date).toLocaleString("en-LK")}</span>
          </div>
          {sale.cashier?.name && (
            <div className="flex justify-between">
              <span className="text-slate-400">Cashier:</span>
              <span>{sale.cashier.name}</span>
            </div>
          )}
          {sale.customer?.name && (
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span>{sale.customer.name}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-slate-300 mb-3" />

        {/* Product Items Table List */}
        <div className="space-y-2.5 mb-3">
          {(sale.items || []).map((item, i) => (
            <div key={i} className="text-[11px]">
              <div className="flex justify-between font-semibold">
                <span className="truncate mr-3">{item.name}</span>
                <span className="shrink-0">Rs.{(item.lineTotal ?? item.price * item.qty)?.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 pl-1">
                {item.qty} Qty × Rs.{(item.unitPrice ?? item.price)?.toLocaleString()}
                {item.discount > 0 && ` [-${item.discount}% off]`}
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-slate-300 mb-3" />

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>Rs.{sale.subtotal?.toLocaleString()}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount Given</span>
              <span>– Rs.{sale.discountAmount?.toLocaleString()}</span>
            </div>
          )}
          {sale.taxAmount > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Tax ({sale.taxRate}%)</span>
              <span>Rs.{sale.taxAmount?.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-slate-300 my-2.5" />

        <div className="flex justify-between font-extrabold text-sm tracking-tight border-y border-slate-800 py-1.5 uppercase">
          <span>NET TOTAL</span>
          <span>Rs.{(sale.totalAmount ?? sale.amount)?.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-[11px] font-medium text-slate-600 mt-2.5">
          <span>Payment Mode:</span>
          <span className="font-bold">{sale.paymentMethod ?? sale.payment}</span>
        </div>

        {sale.paymentMethod === "CASH" && sale.cashReceived && (
          <div className="space-y-0.5 mt-1 text-[11px] font-medium text-slate-500">
            <div className="flex justify-between">
              <span>Cash Tendered:</span>
              <span>Rs.{sale.cashReceived?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700">
              <span>Change Returned:</span>
              <span>Rs.{sale.changeGiven?.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="border-t border-dashed border-slate-300 mt-4 pt-3 text-center text-[10px] text-slate-400 space-y-0.5">
          <p className="font-bold uppercase text-slate-500">Thank you for shopping!</p>
          <p>Please retain receipt for exchange within 7 days.</p>
        </div>
      </div>

      <div className="text-center mt-5 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 mx-auto text-xs font-bold shadow-md transition"
        >
          <Printer size={14} /> Print Receipt (PDF)
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; shadow: none !important; p: 0; }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPreview;