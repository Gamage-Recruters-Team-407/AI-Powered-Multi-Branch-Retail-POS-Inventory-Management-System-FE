import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Tag, Percent, DollarSign, Edit, HelpCircle } from "lucide-react";
import { getAllBranches } from "../../services/branchApi";

export default function PromotionDetailsModal({
  promotion,
  onClose,
  onEdit,
  onToggleActive,
}) {
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      const branchIds = promotion.branches || promotion.branchRestrictions;
      if (!branchIds || branchIds.length === 0) return;
      setBranchesLoading(true);
      try {
        const response = await getAllBranches();
        setBranches(response.data || []);
      } catch (err) {
        console.error("Error fetching branches for details modal:", err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, [promotion.branches, promotion.branchRestrictions]);

  // Determine remaining days
  const getRemainingDays = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(promotion.endDate);
    end.setHours(23, 59, 59, 999);

    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires Today";
    if (diffDays === 1) return "Expires Tomorrow";
    return `${diffDays} days remaining`;
  };

  const getRestrictedBranchNames = () => {
    const branchIds = promotion.branches || promotion.branchRestrictions;
    if (!branchIds || branchIds.length === 0) {
      return "All Branches";
    }
    const names = branches
      .filter((b) => branchIds.includes(b._id))
      .map((b) => b.name);
    
    if (names.length === 0) return "Loading branch restrictions...";
    return names.join(", ");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-800">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Tag size={18} />
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campaign Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
          {/* Header Card */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                {promotion.title || promotion.name}
              </h2>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-lg uppercase tracking-widest border border-blue-100/50">
                {promotion.couponCode || promotion.code}
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase">Discount Value</div>
              <div className="text-xl font-black text-blue-600 mt-1 flex items-center gap-1">
                {(promotion.discountType === "PERCENTAGE" || promotion.discountType === "percentage") ? (
                  <>
                    <Percent size={18} />
                    <span>{promotion.discountValue}% Off</span>
                  </>
                ) : (
                  <>
                    <DollarSign size={18} className="translate-y-[1px]" />
                    <span>{Number(promotion.discountValue).toLocaleString()} Off</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
            <p className="mt-1 text-slate-600 text-xs font-semibold leading-relaxed">
              {promotion.description || "No description provided for this promotion campaign."}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min. Purchase Required</span>
              <div className="mt-1 text-xs font-bold text-slate-700">
                {promotion.minPurchaseAmount && Number(promotion.minPurchaseAmount) > 0
                  ? `Rs. ${Number(promotion.minPurchaseAmount).toLocaleString()}`
                  : "None"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Discount Cap</span>
              <div className="mt-1 text-xs font-bold text-slate-700">
                {promotion.discountType === "percentage" && promotion.maxDiscountAmount
                  ? `Rs. ${Number(promotion.maxDiscountAmount).toLocaleString()}`
                  : "No limit / Flat"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usage Limit</span>
              <div className="mt-1 text-xs font-bold text-slate-700">
                {promotion.usageLimit && Number(promotion.usageLimit) > 0
                  ? `${promotion.usageLimit} times total`
                  : "Unlimited"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Status</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    promotion.isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                <span className="text-xs font-bold text-slate-700">
                  {promotion.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Timeline & Location */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-slate-400 mt-0.5 shrink-0" size={16} />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Validity</span>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  <div><strong className="text-slate-500 font-bold text-[10px]">FROM:</strong> {formatDate(promotion.startDate)}</div>
                  <div className="mt-1"><strong className="text-slate-500 font-bold text-[10px]">TO:</strong> {formatDate(promotion.endDate)}</div>
                </div>
                <div className="mt-2.5 inline-block px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-100/50">
                  {getRemainingDays()}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-slate-400 mt-0.5 shrink-0" size={16} />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicable Branches</span>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  {(promotion.branches || promotion.branchRestrictions) && (promotion.branches || promotion.branchRestrictions).length > 0 ? (
                    branchesLoading ? (
                      <span className="text-slate-400 italic">Fetching branch details...</span>
                    ) : (
                      getRestrictedBranchNames()
                    )
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50/70 border border-emerald-100/50 px-2 py-0.5 rounded-md">
                      Valid for All Branches
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4.5 flex gap-3">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs py-3 px-4 rounded-xl border border-slate-200 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit size={14} />
            <span>Edit Promotion</span>
          </button>
          <button
            onClick={() => {
              onToggleActive(promotion);
              onClose();
            }}
            className={`flex-1 font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer ${
              promotion.isActive
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <span>{promotion.isActive ? "Deactivate" : "Activate"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
