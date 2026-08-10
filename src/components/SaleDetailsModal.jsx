//Meka mama haduwe branch management part ekt meka sales part ekt adala naha

import { X, Receipt, User, CreditCard, Calendar, Package } from "lucide-react";

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  VOIDED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const PAYMENT_STYLES = {
  CASH: "bg-blue-100 text-blue-700",
  CARD: "bg-purple-100 text-purple-700",
  QR: "bg-pink-100 text-pink-700",
};

export default function SaleDetailsModal({ sale, onClose }) {
  if (!sale) return null;

  const cashierName = sale.cashier
    ? `${sale.cashier.firstName || ""} ${sale.cashier.lastName || ""}`.trim() ||
      sale.cashier.email ||
      "N/A"
    : "N/A";

  const dateStr = sale.createdAt
    ? new Date(sale.createdAt).toLocaleString()
    : "N/A";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sale Details
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                {sale.invoiceNumber || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date & Time
                </p>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {dateStr}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cashier
                </p>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {cashierName}
                </p>
              </div>
            </div>
          </div>

          {/* Payment + Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                PAYMENT_STYLES[sale.paymentMethod] || "bg-slate-100 text-slate-600"
              }`}
            >
              <CreditCard className="w-3 h-3" />
              {sale.paymentMethod || "N/A"}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                STATUS_STYLES[sale.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {sale.status || "N/A"}
            </span>
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              Items ({sale.items?.length ?? 0})
            </p>
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-50">
              {(sale.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-slate-400">
                      {item.quantity} × Rs {Number(item.unitPrice ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-slate-700 shrink-0">
                    Rs {Number(item.lineTotal ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
              {(!sale.items || sale.items.length === 0) && (
                <p className="px-3 py-3 text-xs text-slate-400 text-center">
                  No items recorded
                </p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>Rs {Number(sale.subtotal ?? 0).toFixed(2)}</span>
            </div>
            {Number(sale.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Discount</span>
                <span>- Rs {Number(sale.discountAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(sale.taxAmount ?? 0) > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax</span>
                <span>Rs {Number(sale.taxAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1">
              <span>Total</span>
              <span>Rs {Number(sale.totalAmount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}