import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  CreditCard as CardIcon,
  Package,
  Tag,
  Trash,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import { useSales } from "../../context/SalesContext";
import PaymentMethod from "../../components/pos/PaymentMethod";
import { createSale } from "../../services/salesApi";
import { validateCoupon } from "../../services/promotionApi";
import { searchCustomers } from "../../services/customerApi";

const getPrice = (item) => {
  return Number(item.price ?? item.sellingPrice ?? item.unitPrice ?? 0);
};

const CheckoutPage = ({ onBack, onComplete }) => {
  const navigate = useNavigate();

  const {
    cart,
    subtotal,
    discount,
    setDiscount,
    taxAmount,
    total,
    buildCheckoutPayload,
    validateCartStock,
    clearCart,
  } = useCart();

  const { refreshProducts } = useProducts();
  const { addSale } = useSales();
  const { user } = useAuth();

  const branchId = user?.branchId ?? user?.branch?._id ?? user?.branch;

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");

  // ---- Customer lookup by phone number ----
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCustomerError("");

    const phone = customerPhone.trim();
    if (!phone || phone.length < 9) {
      setCustomer(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const res = await searchCustomers(phone);
        const results = res?.data?.data || res?.data || [];
        const list = Array.isArray(results) ? results : [];

        const found =
          list.find(
            (c) =>
              (c.phone || c.phoneNumber || "").replace(/\D/g, "") ===
              phone.replace(/\D/g, "")
          ) ||
          list[0] ||
          null;

        if (found) {
          setCustomer(found);
        } else {
          setCustomer(null);
          setCustomerError("No customer found with this number.");
        }
      } catch (err) {
        setCustomer(null);
        setCustomerError("No customer found with this number.");
      } finally {
        setCustomerLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [customerPhone]);
  // -------------------------------------------

  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (cart.length === 0 && !isCompleting) {
      if (onBack) {
        onBack();
      } else {
        navigate("/pos");
      }
    }
  }, [cart.length, isCompleting, navigate, onBack]);

  const change =
    paymentMethod === "CASH" && cashReceived
      ? Number(cashReceived) - Number(total)
      : 0;

  const canConfirm =
    paymentMethod !== "CASH" ||
    (cashReceived && Number(cashReceived) >= Number(total));

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

        toast.success(
          `Coupon "${couponCode.trim().toUpperCase()}" applied successfully!`
        );
      } else {
        setCouponError(response.data?.message || "Invalid coupon code.");
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error("Error validating coupon:", err);
      setCouponError(
        err.response?.data?.message || "Failed to validate coupon."
      );
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

  const handleConfirm = async () => {
    setError("");

    const stockCheck = validateCartStock();

    if (!stockCheck.valid) {
      setError(stockCheck.message);
      return;
    }

    if (paymentMethod === "CASH" && Number(cashReceived || 0) < Number(total)) {
      setError("Insufficient cash received.");
      return;
    }

    setLoading(true);

    try {
      const customerIdToSend = customer?._id || customer?.id || null;

      const payload = buildCheckoutPayload(
        paymentMethod,
        Number(cashReceived || 0),
        customerIdToSend
      );

      const response = await createSale(payload);
      const sale = response.data?.data;

      if (sale) {
        addSale?.(sale);
      }

      setIsCompleting(true);

      await refreshProducts();

      clearCart();

      toast.success("Payment completed and stock updated.");

      if (onComplete) {
        onComplete(sale);
      } else {
        navigate("/receipt", { state: { sale } });
      }
    } catch (err) {
      console.error("Checkout failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to process sale"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-2 py-4 antialiased sm:px-4 sm:py-10">
      <div className="pointer-events-none absolute right-1/4 top-10 h-36 w-36 rounded-full bg-yellow-400 opacity-50 blur-2xl" />

      <div className="z-10 w-full max-w-xl">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate("/pos"))}
          className="mb-4 flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white sm:mb-6 sm:px-4 sm:text-xs"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to POS
        </button>

        <div className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 sm:h-8 sm:w-8">
              <CardIcon size={14} className="sm:hidden" />
              <CardIcon size={16} className="hidden sm:block" />
            </div>

            <h1 className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
              Checkout Terminal
            </h1>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3 shadow-inner sm:mb-6 sm:p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 sm:text-xs">
              Order Summary ({cart.length} items)
            </p>

            <div className="mb-3 max-h-32 space-y-2 overflow-y-auto pr-1 sm:max-h-40">
              {cart.map((item) => {
                const price = getPrice(item);
                const lineTotal = price * Number(item.qty || 0);

                return (
                  <div
                    key={item._id || item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 sm:h-11 sm:w-11">
                        {item.image || item.imageUrl ? (
                          <img
                            src={item.image || item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={14} className="text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-slate-800 sm:text-xs">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
                          Rs.{price.toLocaleString()} × {item.qty}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[11px] font-bold text-slate-700 sm:text-xs">
                      Rs.{lineTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-3 text-[11px] font-semibold text-slate-500 sm:text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700">
                  Rs.{subtotal.toLocaleString()}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">
                    – Rs.{discount.toLocaleString()}
                  </span>
                </div>
              )}

              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-bold text-slate-700">
                    Rs.{taxAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-sm font-extrabold text-blue-600">
                <span>TOTAL AMOUNT</span>
                <span className="text-sm tracking-tight sm:text-base">
                  Rs.{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Phone Number */}
          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
              <User size={12} className="text-slate-400" />
              Customer Phone Number
              <span className="font-normal lowercase text-slate-400">
                (optional)
              </span>
            </label>

            <input
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="e.g. 0771234567 — leave blank for walk-in customer"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 sm:px-4"
            />

            {customerLoading && (
              <p className="mt-1.5 text-[10px] font-bold text-slate-400">
                Searching customer...
              </p>
            )}

            {!customerLoading && customerError && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-rose-500">
                <AlertCircle size={12} /> {customerError}
              </p>
            )}

            {!customerLoading && customer && (
              <div className="mt-2.5 rounded-xl border border-blue-200/50 bg-blue-50 p-3 text-[11px] font-bold text-blue-700">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Check size={13} strokeWidth={3} className="text-blue-500" />
                    {`${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                      "Customer"}
                  </span>
                  {customer.customerType && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                      {customer.customerType}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold text-blue-500">
                  {customer.phone && <span>📞 {customer.phone}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
              <Tag size={12} className="text-slate-400" />
              Promo / Coupon Code
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                disabled={Boolean(appliedCoupon) || isValidating}
                placeholder="e.g. SUMMER25"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-100 disabled:text-slate-500 sm:px-4"
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="flex items-center justify-center gap-1 rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  <Trash size={14} />
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isValidating}
                  className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {isValidating ? "Applying..." : "Apply"}
                </button>
              )}
            </div>

            {couponError && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-rose-500">
                <span>⚠️</span>
                {couponError}
              </p>
            )}

            {appliedCoupon && (
              <div className="mt-2.5 flex flex-col gap-1 rounded-xl border border-emerald-200/50 bg-emerald-50 p-3 text-[10px] font-bold text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1">
                  <Check size={13} strokeWidth={3} className="text-emerald-500" />
                  <span>
                    Promo applied: "{appliedCoupon.code}" ({appliedCoupon.title})
                  </span>
                </span>

                <span className="text-xs font-black">
                  - Rs.{appliedCoupon.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mb-4 sm:mb-5">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
              Select Payment Mode
            </label>

            <PaymentMethod
              selected={paymentMethod}
              setSelected={(method) => {
                setPaymentMethod(method);
                setCashReceived("");
              }}
            />
          </div>

          {paymentMethod === "CASH" && (
            <div className="mb-4 rounded-2xl border border-slate-200/60 bg-slate-50 p-3 sm:mb-5 sm:p-4">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:text-xs">
                Cash Received (Rs.)
              </label>

              <input
                type="number"
                value={cashReceived}
                onChange={(event) => setCashReceived(event.target.value)}
                placeholder={`Minimum: Rs.${total.toLocaleString()}`}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 sm:px-4"
                autoFocus
              />

              {cashReceived && (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-bold sm:text-xs ${
                    change >= 0
                      ? "border-emerald-200/50 bg-emerald-50 text-emerald-700"
                      : "border-rose-200/50 bg-rose-50 text-rose-600"
                  }`}
                >
                  {change >= 0 ? (
                    <CheckCircle size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}

                  {change >= 0
                    ? `Balance to return: Rs.${change.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                      })}`
                    : `Amount short by: Rs.${Math.abs(change).toLocaleString()}`}
                </div>
              )}
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] font-bold text-blue-700 sm:mb-5 sm:p-3.5 sm:text-xs">
              <AlertCircle size={16} className="shrink-0" />
              Swipe or tap the customer's card on the physical terminal device.
            </div>
          )}

          {paymentMethod === "QR" && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-3 text-[11px] font-bold text-purple-700 sm:mb-5 sm:p-3.5 sm:text-xs">
              <AlertCircle size={16} className="shrink-0" />
              Present the QR code to customer and verify incoming transaction.
            </div>
          )}

          {error && (
            <div className="mb-4 flex gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] font-bold text-rose-600 sm:mb-5 sm:p-4 sm:text-xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:py-3.5 sm:text-xs"
          >
            {loading
              ? "Processing Bill..."
              : `Confirm Payment — Rs.${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;