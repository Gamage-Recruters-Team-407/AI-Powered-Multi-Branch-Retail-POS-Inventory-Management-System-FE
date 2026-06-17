// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
// import { useCart } from "../../context/CartContext";
// import { useSales } from "../../context/SalesContext";
// import { createSale } from "../../services/salesApi";
// import PaymentMethod from "../../components/pos/PaymentMethod";

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const { cart, subtotal, discount, taxAmount, total, buildCheckoutPayload, clearCart } = useCart();
//   const { addSale } = useSales();

//   const [paymentMethod, setPaymentMethod] = useState("CASH");
//   const [cashReceived, setCashReceived]   = useState("");
//   const [customerId, setCustomerId]       = useState("");
//   const [loading, setLoading]             = useState(false);
//   const [error, setError]                 = useState("");

//   if (cart.length === 0) { navigate("/pos"); return null; }

//   const change     = paymentMethod === "CASH" && cashReceived ? parseFloat(cashReceived) - total : 0;
//   const canConfirm = paymentMethod !== "CASH" || (cashReceived && parseFloat(cashReceived) >= total);

//   const handleConfirm = async () => {
//     setError(""); setLoading(true);
//     try {
//       const payload = buildCheckoutPayload(paymentMethod, parseFloat(cashReceived), customerId);
//       const res     = await createSale(payload);
//       const sale    = res.data.data;
//       addSale(sale);
//       clearCart();
//       navigate("/receipt", { state: { sale } });
//     } catch (err) {
//       setError(err.response?.data?.message || "Payment failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-start justify-center py-10 px-4">
//       <div className="w-full max-w-lg">
//         <button
//           onClick={() => navigate("/pos")}
//           className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-5 text-sm"
//         >
//           <ArrowLeft size={16} /> Back to POS
//         </button>

//         <div className="bg-white rounded-2xl shadow-sm p-7">
//           <h1 className="text-2xl font-bold text-blue-600 mb-6">Checkout</h1>

//           {/* Order Summary */}
//           <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-1">
//             <p className="font-medium text-gray-700 mb-2">Order Summary ({cart.length} items)</p>
//             {cart.map((i) => (
//               <div key={i._id} className="flex justify-between text-gray-600">
//                 <span>{i.name} × {i.qty}</span>
//                 <span>Rs.{(i.price * i.qty).toLocaleString()}</span>
//               </div>
//             ))}
//             <div className="border-t pt-2 mt-2 space-y-1">
//               <div className="flex justify-between text-gray-500">
//                 <span>Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span>
//               </div>
//               {discount > 0 && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Discount</span><span>– Rs.{discount.toLocaleString()}</span>
//                 </div>
//               )}
//               {taxAmount > 0 && (
//                 <div className="flex justify-between text-gray-500">
//                   <span>Tax</span><span>Rs.{taxAmount.toLocaleString()}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-blue-600 text-base">
//                 <span>Total</span><span>Rs.{total.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           {/* Customer (optional) */}
//           <div className="mb-5">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Customer ID <span className="text-gray-400 font-normal">(optional)</span>
//             </label>
//             <input
//               type="text"
//               value={customerId}
//               onChange={(e) => setCustomerId(e.target.value)}
//               placeholder="Leave blank for walk-in"
//               className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
//             />
//           </div>

//           {/* Payment Method — using component */}
//           <div className="mb-5">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
//             <PaymentMethod selected={paymentMethod} setSelected={(m) => { setPaymentMethod(m); setCashReceived(""); }} />
//           </div>

//           {/* Cash Received */}
//           {paymentMethod === "CASH" && (
//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Cash Received (Rs.)</label>
//               <input
//                 type="number"
//                 value={cashReceived}
//                 onChange={(e) => setCashReceived(e.target.value)}
//                 placeholder={`Min: Rs.${total.toLocaleString()}`}
//                 className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300"
//                 autoFocus
//               />
//               {cashReceived && (
//                 <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
//                   {change >= 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
//                   {change >= 0
//                     ? `Change to return: Rs.${change.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
//                     : `Short by Rs.${Math.abs(change).toLocaleString()}`}
//                 </div>
//               )}
//             </div>
//           )}

//           {paymentMethod === "CARD" && (
//             <div className="mb-5 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
//               Swipe / tap card on the terminal. Confirm when approved.
//             </div>
//           )}
//           {paymentMethod === "QR" && (
//             <div className="mb-5 p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
//               Show QR to customer. Confirm once payment received.
//             </div>
//           )}

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2">
//               <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
//             </div>
//           )}

//           <button
//             onClick={handleConfirm}
//             disabled={!canConfirm || loading}
//             className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-base"
//           >
//             {loading ? "Processing..." : `Confirm Payment — Rs.${total.toLocaleString()}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Package, User, CreditCard as CardIcon } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useSales } from "../../context/SalesContext";
import { createSale } from "../../services/salesApi";
import PaymentMethod from "../../components/pos/PaymentMethod";
import { useAuth } from "../../context/AuthContext";
import { validateCoupon } from "../../services/promotionApi";
import { toast } from "react-hot-toast";
import { Tag, Check, Trash } from "lucide-react";

const CheckoutPage = ({ onBack, onComplete }) => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, setDiscount, taxAmount, total, buildCheckoutPayload, clearCart } = useCart();
  const { addSale } = useSales();
  const { user } = useAuth();
  const branchId = user?.branchId ?? user?.branch?._id ?? user?.branch;

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived]   = useState("");
  const [customerId, setCustomerId]       = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidating(true);
    setCouponError("");
    try {
      const response = await validateCoupon({
        couponCode: couponCode.trim(),
        cartTotal: subtotal,
        branchId,
      });

      if (response.data && response.data.valid) {
        const { discountAmount, promotionTitle } = response.data;
        setDiscount(discountAmount);
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          title: promotionTitle,
          amount: discountAmount,
        });
        toast.success(`Coupon "${couponCode.trim().toUpperCase()}" applied successfully!`);
      } else {
        setCouponError(response.data?.message || "Invalid coupon code.");
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error("Error validating coupon:", err);
      setCouponError(err.response?.data?.message || "Failed to validate coupon.");
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed.");
  };

  if (cart.length === 0) { onBack ? onBack() : navigate("/pos"); return null; }

  const change     = paymentMethod === "CASH" && cashReceived ? parseFloat(cashReceived) - total : 0;
  const canConfirm = paymentMethod !== "CASH" || (cashReceived && parseFloat(cashReceived) >= total);

  const handleConfirm = async () => {
    setError(""); setLoading(true);
    try {
      const payload = buildCheckoutPayload(paymentMethod, parseFloat(cashReceived), customerId);
      const res     = await createSale(payload);
      const sale    = res.data.data;
      addSale(sale);
      clearCart();
      if (onComplete) { onComplete(sale); } else { navigate("/receipt", { state: { sale } }); }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex flex-col justify-start items-center py-10 px-4 antialiased relative overflow-hidden">
      
      <div className="absolute top-10 right-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-2xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        <button
          onClick={() => onBack ? onBack() : navigate("/pos")}
          className="flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-200"
        >
          <ArrowLeft size={14} strokeWidth={2.5} /> Back to POS
        </button>

        <div className="backdrop-blur-xl bg-white/90 border border-white/40 rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CardIcon size={16} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Checkout Terminal</h1>
          </div>

          {/* Order Summary Box */}
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 mb-6 shadow-inner">
            <p className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider">Order Summary ({cart.length} items)</p>
            
            {/* Scrollable Items list inside summary */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mb-3 scrollbar-thin">
              {cart.map((i) => (
                <div key={i._id} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Product Circular/Rounded Image Frame */}
                    <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {i.image || i.imageUrl ? (
                        <img src={i.image || i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{i.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Rs.{i.price.toLocaleString()} × {i.qty}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-slate-700 shrink-0">Rs.{(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdowns */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-700 font-bold">Rs.{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">– Rs.{discount.toLocaleString()}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="text-slate-700 font-bold">Rs.{taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-blue-600 text-sm border-t border-dashed border-slate-200 pt-2.5 mt-2">
                <span>TOTAL AMOUNT</span>
                <span className="text-base tracking-tight">Rs.{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Input Section */}
          <div className="mb-5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              <User size={13} className="text-slate-400" /> Customer ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Leave blank for walk-in customer"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400"
            />
          </div>

          {/* Coupon Code Section */}
          <div className="mb-5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              <Tag size={13} className="text-slate-400" /> Promo / Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={appliedCoupon || isValidating}
                placeholder="e.g. SUMMER25"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash size={14} /> Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isValidating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  {isValidating ? "Applying..." : "Apply"}
                </button>
              )}
            </div>
            {couponError && (
              <p className="mt-1.5 text-[10px] font-bold text-rose-500 flex items-center gap-1">
                <span>⚠️</span> {couponError}
              </p>
            )}
            {appliedCoupon && (
              <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-[10px] font-bold text-emerald-700 flex items-center justify-between animate-fade-in">
                <span className="flex items-center gap-1">
                  <Check size={13} strokeWidth={3} className="text-emerald-500" />
                  <span>Promo applied: "{appliedCoupon.code}" ({appliedCoupon.title})</span>
                </span>
                <span className="text-xs font-black">- Rs.{appliedCoupon.amount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector Grid */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Select Payment Mode</label>
            <PaymentMethod selected={paymentMethod} setSelected={(m) => { setPaymentMethod(m); setCashReceived(""); }} />
          </div>

          {/* Conditional Input for Cash Method */}
          {paymentMethod === "CASH" && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-fade-in">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Cash Received (Rs.)</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={`Minimum: Rs.${total.toLocaleString()}`}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-slate-700"
                autoFocus
              />
              {cashReceived && (
                <div className={`mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl ${change >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-rose-50 text-rose-600 border border-rose-200/50"}`}>
                  {change >= 0 ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {change >= 0
                    ? `Balance to return: Rs.${change.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
                    : `Amount short by: Rs.${Math.abs(change).toLocaleString()}`}
                </div>
              )}
            </div>
          )}

          {/* Prompt boxes for Terminal Methods */}
          {paymentMethod === "CARD" && (
            <div className="mb-5 p-3.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> Swipe or tap the customer's card on the physical terminal device.
            </div>
          )}
          {paymentMethod === "QR" && (
            <div className="mb-5 p-3.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> Present the static/dynamic QR code to customer & verify incoming transaction.
            </div>
          )}

          {/* Error Message banner */}
          {error && (
            <div className="mb-5 p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold flex gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Submission Button */}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-extrabold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-wider"
          >
            {loading ? "Processing Bill..." : `Confirm Payment — Rs.${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;