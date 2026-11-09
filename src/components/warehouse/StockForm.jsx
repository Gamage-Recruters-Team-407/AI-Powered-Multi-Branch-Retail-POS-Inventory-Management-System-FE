import { useState, useEffect } from "react";
import { FiX, FiPlusCircle, FiMinusCircle, FiBox, FiLayers, FiHash, FiCalendar, FiFileText } from "react-icons/fi";

export default function StockForm({ mode, zones, stocks, onSubmit, onClose, loading = false }) {
  // mode: "add" | "remove"
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    zone: "",
    product: "",
    quantity: 1,
    note: "",
    batchNo: "",
    expiryDate: "",
  });
  
  const [errors, setErrors] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch all products from backend for "Add" mode
  useEffect(() => {
    if (isAdd) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const token = localStorage.getItem('token') || '';
          const response = await fetch("http://localhost:5000/api/products", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await response.json();
          // Adjust based on your backend response structure (result.data, result.products, or just result)
          const productsList = result.data || result.products || (Array.isArray(result) ? result : []);
          setAllProducts(productsList);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [isAdd]);

  // For remove mode: filter products that actually have stock in the selected zone
  const availableProducts = (() => {
    if (!formData.zone) return [];
    return stocks.filter((s) => s.zone?._id === formData.zone || s.zone === formData.zone);
  })();

  const selectedStock = availableProducts.find(
    (s) => (s.product?._id || s.product) === formData.product
  );
  const maxQty = selectedStock?.quantity ?? null;

  // Reset product when zone changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, product: "", quantity: 1 }));
  }, [formData.zone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.zone) errs.zone = "Select a zone";
    if (!formData.product) errs.product = "Select a product";
    if (!formData.quantity || Number(formData.quantity) < 1)
      errs.quantity = "Quantity must be at least 1";
    if (!isAdd && maxQty !== null && Number(formData.quantity) > maxQty)
      errs.quantity = `Only ${maxQty} units available in this zone`;
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      zone: formData.zone,
      product: formData.product,
      quantity: Number(formData.quantity),
      note: formData.note || undefined,
      ...(isAdd && formData.batchNo ? { batchNo: formData.batchNo } : {}),
      ...(isAdd && formData.expiryDate ? { expiryDate: formData.expiryDate } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-sm border ${isAdd ? 'bg-green-100/50 border-green-200 text-green-600' : 'bg-red-100/50 border-red-200 text-red-600'}`}>
              {isAdd ? <FiPlusCircle size={24} /> : <FiMinusCircle size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isAdd ? "Add Stock" : "Remove Stock"}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {isAdd ? "Store new items in a zone" : "Deduct existing stock"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Zone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiLayers size={18} />
              </div>
              <select
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium text-slate-700 appearance-none ${
                  errors.zone ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-blue-500"
                }`}
              >
                <option value="">Select storage zone...</option>
                {zones.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.zoneName} ({z.zoneCode})
                  </option>
                ))}
              </select>
            </div>
            {errors.zone && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.zone}</p>}
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiBox size={18} />
              </div>
              
              {isAdd ? (
                // ADD MODE: Fetch all products from DB and show in dropdown
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium text-slate-700 appearance-none ${
                    errors.product ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-blue-500"
                  }`}
                >
                  <option value="">{loadingProducts ? "Loading products..." : "Select product to add..."}</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                // REMOVE MODE: Show only products available in the selected zone
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  disabled={!formData.zone}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium appearance-none ${
                    !formData.zone ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                    : "bg-slate-50/50 text-slate-700 bg-white border-slate-200 focus:ring-blue-500"
                  } ${errors.product ? "border-red-400 focus:ring-red-500" : ""}`}
                >
                  <option value="">
                    {formData.zone ? "Select product to remove..." : "Select a zone first"}
                  </option>
                  {availableProducts.map((s) => (
                    <option key={s._id} value={s.product?._id || s.product}>
                      {s.product?.name || "Unknown"} — {s.quantity} units available
                    </option>
                  ))}
                </select>
              )}
            </div>
            {errors.product && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.product}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quantity <span className="text-red-500">*</span>
              {!isAdd && maxQty !== null && (
                <span className="text-amber-600 font-bold ml-2">
                  (Max available: {maxQty})
                </span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiHash size={18} />
              </div>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={!isAdd && maxQty !== null ? maxQty : undefined}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all font-bold text-blue-700 ${
                  errors.quantity ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.quantity && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.quantity}</p>}
          </div>

          {/* Batch No & Expiry — Add only */}
          {isAdd && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Batch No <span className="text-slate-400 font-medium normal-case">(opt)</span>
                </label>
                <input
                  type="text"
                  name="batchNo"
                  value={formData.batchNo}
                  onChange={handleChange}
                  placeholder="BATCH-001"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Expiry Date <span className="text-slate-400 font-medium normal-case">(opt)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Note <span className="text-slate-400 font-medium normal-case">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-4 flex items-center pointer-events-none text-slate-400">
                <FiFileText size={18} />
              </div>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={2}
                placeholder="Reason or additional info..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl font-bold transition-all hover:shadow-sm active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isAdd
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200 disabled:from-green-300 disabled:to-emerald-400"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200 disabled:from-red-300 disabled:to-rose-400"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : isAdd ? "Add to Stock" : "Remove from Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}