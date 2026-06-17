import React from "react";
import { Eye, Edit2, Trash2, Calendar, MapPin } from "lucide-react";

export default function PromotionsList({
  promotions,
  onEdit,
  onDelete,
  onToggleActive,
  onViewDetails,
}) {
  const getPromoStatus = (promo) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = promo.startDate ? new Date(promo.startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    const end = promo.endDate ? new Date(promo.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    if (!promo.isActive) return "inactive";
    if (end && now > end) return "expired";
    if (start && now < start) return "scheduled";
    return "active";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Active
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            Scheduled
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            Expired
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
            Inactive
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Code</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min. Purchase</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Validity Period</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promotions.map((promo) => {
              const status = getPromoStatus(promo);
              const isExpired = status === "expired";
              return (
                <tr key={promo._id} className="hover:bg-slate-50/50 transition">
                  {/* Code */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg uppercase tracking-wider border border-blue-100/50">
                      {promo.couponCode || promo.code}
                    </span>
                  </td>
                  {/* Name */}
                  <td className="px-6 py-4.5">
                    <div className="text-xs font-bold text-slate-800">{promo.title || promo.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold max-w-[200px] truncate mt-0.5">
                      {promo.description || "No description"}
                    </div>
                  </td>
                  {/* Discount Details */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="text-xs font-extrabold text-slate-800">
                      {(promo.discountType === "PERCENTAGE" || promo.discountType === "percentage")
                        ? `${promo.discountValue}% Off`
                        : `Rs. ${Number(promo.discountValue).toLocaleString()} Off`}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                      {(promo.discountType === "PERCENTAGE" || promo.discountType === "percentage") && promo.maxDiscountAmount
                        ? `Up to Rs. ${Number(promo.maxDiscountAmount).toLocaleString()}`
                        : "No max discount cap"}
                    </div>
                  </td>
                  {/* Min Purchase */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-xs font-bold text-slate-700">
                    {promo.minPurchaseAmount && Number(promo.minPurchaseAmount) > 0
                      ? `Rs. ${Number(promo.minPurchaseAmount).toLocaleString()}`
                      : "Rs. 0"}
                  </td>
                  {/* Validity Period */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formatDate(promo.startDate)}</span>
                      <span className="text-slate-300">→</span>
                      <span>{formatDate(promo.endDate)}</span>
                    </div>
                  </td>
                  {/* Status Toggle & Badge */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(status)}
                      <button
                        onClick={() => onToggleActive(promo)}
                        disabled={isExpired}
                        className={`relative inline-flex h-5 w-9.5 items-center rounded-full transition-colors focus:outline-none ${
                          promo.isActive && !isExpired
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        } ${isExpired ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        title={isExpired ? "Cannot toggle expired campaign" : "Toggle Active Status"}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            promo.isActive && !isExpired ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(promo)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEdit(promo)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-blue-600"
                        title="Edit Campaign"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(promo._id)}
                        className="p-2 hover:bg-rose-50 rounded-xl transition text-slate-400 hover:text-rose-600"
                        title="Delete Campaign"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
