import { useState, useEffect } from "react";
import { FiTruck, FiX, FiAlertTriangle, FiCheck } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export default function DispatchToBranchForm({ warehouseId, zones, stocks, onSuccess, onClose }) {
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    branchId: "",
    zoneId: "",
    productId: "",
    quantity: "",
    note: "",
  });

  // Fetch branches
  useEffect(() => {
    axios.get(`${API_URL}/branches`, { headers: headers() })
      .then((res) => {
        const list = res.data.data || res.data.branches || res.data || [];
        setBranches(Array.isArray(list) ? list : []);
      })
      .catch(() => setBranches([]))
      .finally(() => setBranchesLoading(false));
  }, []);

  // Available products based on selected zone (or all stocked products)
  const availableProducts = form.zoneId
    ? stocks.filter((s) => !s.isUnstocked && (s.zone?._id === form.zoneId || s.zone === form.zoneId))
    : stocks.filter((s) => !s.isUnstocked && s.quantity > 0);

  const selectedStock = availableProducts.find(
    (s) => (s.product?._id || s.product) === form.productId
  );
  const maxQty = selectedStock?.quantity ?? 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset product when zone changes
      if (name === "zoneId") updated.productId = "";
      return updated;
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.branchId) return setError("Branch select කරන්න.");
    if (!form.productId) return setError("Product select කරන්න.");
    const qty = Number(form.quantity);
    if (!qty || qty < 1) return setError("Valid quantity ෙකෙකෙ enter කරන්න.");
    if (qty > maxQty) return setError(`Warehouse ෙකෙ ඇත්ෙතෙ ${maxQty} units පමණයි.`);

    setSubmitting(true);
    try {
      const payload = {
        product: form.productId,
        quantity: qty,
        branchId: form.branchId,
        zone: form.zoneId || undefined,
        note: form.note || undefined,
      };
      await axios.post(`${API_URL}/warehouses/${warehouseId}/dispatch`, payload, { headers: headers() });
      setSuccess(`${qty} units branch ෙකෙට dispatch ෙකළා! ✓`);
      setForm((prev) => ({ ...prev, productId: "", quantity: "", note: "" }));
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Dispatch fail ෙවුනා. නැවත try කරන්න.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <FiTruck className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Dispatch to Branch</h2>
            <p className="text-blue-100 text-xs">Warehouse → Branch inventory</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            <FiAlertTriangle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <FiCheck size={16} /> {success}
          </div>
        )}

        {/* Branch */}
        <div>
          <label className={labelClass}>Destination Branch *</label>
          {branchesLoading ? (
            <div className="text-sm text-gray-400 py-2">Branches load වෙමින්...</div>
          ) : (
            <select name="branchId" value={form.branchId} onChange={handleChange} className={inputClass} required>
              <option value="">-- Branch select කරන්න --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name} {b.location ? `— ${b.location}` : ""}</option>
              ))}
            </select>
          )}
        </div>

        {/* Zone (optional) */}
        {zones.length > 0 && (
          <div>
            <label className={labelClass}>Source Zone <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
            <select name="zoneId" value={form.zoneId} onChange={handleChange} className={inputClass}>
              <option value="">-- All zones --</option>
              {zones.map((z) => (
                <option key={z._id} value={z._id}>{z.zoneName} ({z.zoneCode})</option>
              ))}
            </select>
          </div>
        )}

        {/* Product */}
        <div>
          <label className={labelClass}>Product *</label>
          <select name="productId" value={form.productId} onChange={handleChange} className={inputClass} required disabled={availableProducts.length === 0}>
            <option value="">{availableProducts.length === 0 ? "Stock ෙනෑ" : "-- Product select කරන්න --"}</option>
            {availableProducts.map((s) => (
              <option key={s._id || s.product?._id} value={s.product?._id || s.product}>
                {s.product?.name || "Unknown"} — {s.quantity} units available
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className={labelClass}>
            Quantity *
            {maxQty > 0 && <span className="text-blue-500 font-normal normal-case ml-2">(max: {maxQty})</span>}
          </label>
          <input
            type="number" name="quantity" value={form.quantity}
            onChange={handleChange} min="1" max={maxQty || undefined}
            className={inputClass} placeholder="Dispatch quantity"
            required disabled={!form.productId}
          />
        </div>

        {/* Note */}
        <div>
          <label className={labelClass}>Note <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
          <textarea
            name="note" value={form.note} onChange={handleChange}
            rows={2} className={inputClass + " resize-none"}
            placeholder="Dispatch reason, reference number..."
          />
        </div>

        {/* Summary */}
        {form.productId && form.branchId && form.quantity && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
            <strong>{form.quantity} units</strong> of <strong>{selectedStock?.product?.name}</strong> →{" "}
            <strong>{branches.find((b) => b._id === form.branchId)?.name}</strong>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            type="submit" disabled={submitting || !form.branchId || !form.productId || !form.quantity}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Dispatching...</>
            ) : (
              <><FiTruck size={16} /> Dispatch to Branch</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
