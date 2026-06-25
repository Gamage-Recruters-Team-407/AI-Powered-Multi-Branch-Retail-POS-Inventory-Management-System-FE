import { useState, useEffect } from "react";
import { FiX, FiLayers, FiBox, FiHash, FiFileText, FiMapPin, FiTruck, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import * as warehouseService from "../../services/warehouseService";
import toast from "react-hot-toast";

export default function WarehouseDistributeModal({ branches, onClose, onSuccess }) {
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    warehouseId: "",
    zoneId: "",
    productId: "",
    branchId: "",
    quantity: 1,
    note: "",
  });

  const [errors, setErrors] = useState({});

  // 1. Fetch Warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseService.getAllWarehouses();
        setWarehouses(res.data || []);
      } catch (err) {
        console.error("Failed to load warehouses", err);
        toast.error("Failed to load warehouses list.");
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, []);

  // 2. Fetch Zones when warehouse changes
  useEffect(() => {
    if (!formData.warehouseId) {
      setZones([]);
      setFormData((prev) => ({ ...prev, zoneId: "", productId: "", quantity: 1 }));
      return;
    }
    const fetchZones = async () => {
      setLoadingZones(true);
      try {
        const res = await warehouseService.getZonesByWarehouse(formData.warehouseId);
        setZones(res.data || []);
      } catch (err) {
        console.error("Failed to load zones", err);
        toast.error("Failed to load warehouse zones.");
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
    setFormData((prev) => ({ ...prev, zoneId: "", productId: "", quantity: 1 }));
  }, [formData.warehouseId]);

  // 3. Fetch Stocks when Zone changes
  useEffect(() => {
    if (!formData.zoneId || !formData.warehouseId) {
      setStocks([]);
      setFormData((prev) => ({ ...prev, productId: "", quantity: 1 }));
      return;
    }
    const fetchStocks = async () => {
      setLoadingStocks(true);
      try {
        const res = await warehouseService.getWarehouseStock(formData.warehouseId);
        // Filter stocks that are allocated to this zone specifically
        const zoneStocks = (res.data || []).filter(
          (s) => s.zone?._id === formData.zoneId || s.zone === formData.zoneId
        );
        setStocks(zoneStocks);
      } catch (err) {
        console.error("Failed to load stocks", err);
        toast.error("Failed to load stocks in the zone.");
      } finally {
        setLoadingStocks(false);
      }
    };
    fetchStocks();
    setFormData((prev) => ({ ...prev, productId: "", quantity: 1 }));
  }, [formData.warehouseId, formData.zoneId]);

  const selectedStock = stocks.find(
    (s) => (s.product?._id || s.product) === formData.productId
  );
  const maxQty = selectedStock?.quantity ?? null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.warehouseId) errs.warehouseId = "Source warehouse is required";
    if (!formData.zoneId) errs.zoneId = "Source zone is required";
    if (!formData.productId) errs.productId = "Product is required";
    if (!formData.branchId) errs.branchId = "Destination branch is required";
    
    const requiredQty = formData.branchId === "all" ? Number(formData.quantity) * branches.length : Number(formData.quantity);
    if (!formData.quantity || Number(formData.quantity) < 1) {
      errs.quantity = "Quantity must be at least 1";
    } else if (maxQty !== null && requiredQty > maxQty) {
      errs.quantity = formData.branchId === "all"
        ? `Insufficient stock. Requires ${requiredQty} units total (${Number(formData.quantity)} per branch for ${branches.length} branches), but only ${maxQty} units are available.`
        : `Only ${maxQty} units available in selected zone`;
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await warehouseService.transferStock({
        fromWarehouse: formData.warehouseId,
        fromZone: formData.zoneId,
        product: formData.productId,
        toBranch: formData.branchId,
        quantity: Number(formData.quantity),
        note: formData.note || undefined,
      });

      toast.success("Stock distributed to branch successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to distribute stock", err);
      toast.error(err.response?.data?.message || err.message || "Failed to distribute stock.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
              <FiTruck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                Distribute Stock
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                Allocate inventory from warehouse to branch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warehouse */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Source Warehouse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                {loadingWarehouses ? (
                  <FiLoader className="animate-spin text-sm" />
                ) : (
                  <FiLayers size={16} />
                )}
              </div>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border rounded-xl font-semibold text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] appearance-none ${
                  errors.warehouseId ? "border-red-400" : "border-[var(--border-color)]"
                }`}
              >
                <option value="">Select source warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
            {errors.warehouseId && (
              <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.warehouseId}</p>
            )}
          </div>

          {/* Zone & Product side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zone */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Storage Zone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  {loadingZones ? (
                    <FiLoader className="animate-spin text-sm" />
                  ) : (
                    <FiLayers size={16} />
                  )}
                </div>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  disabled={!formData.warehouseId}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border rounded-xl font-semibold text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] disabled:opacity-65 appearance-none ${
                    errors.zoneId ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                >
                  <option value="">
                    {formData.warehouseId ? "Select zone..." : "Select warehouse first"}
                  </option>
                  {zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {z.zoneName} ({z.zoneCode})
                    </option>
                  ))}
                </select>
              </div>
              {errors.zoneId && (
                <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.zoneId}</p>
              )}
            </div>

            {/* Product */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Select Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  {loadingStocks ? (
                    <FiLoader className="animate-spin text-sm" />
                  ) : (
                    <FiBox size={16} />
                  )}
                </div>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={!formData.zoneId}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border rounded-xl font-semibold text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] disabled:opacity-65 appearance-none ${
                    errors.productId ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                >
                  <option value="">
                    {formData.zoneId ? "Select product..." : "Select zone first"}
                  </option>
                  {stocks.map((s) => (
                    <option key={s._id} value={s.product?._id || s.product}>
                      {s.product?.name || "Unknown"} ({s.quantity} available)
                    </option>
                  ))}
                </select>
              </div>
              {errors.productId && (
                <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.productId}</p>
              )}
            </div>
          </div>

          {/* Branch & Quantity side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Branch */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Destination Branch <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <FiMapPin size={16} />
                </div>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border rounded-xl font-semibold text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] appearance-none ${
                    errors.branchId ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                >
                  <option value="">Select target branch...</option>
                  <option value="all">All Branches (Bulk Distribution)</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.city || "Branch"})
                    </option>
                  ))}
                </select>
              </div>
              {errors.branchId && (
                <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.branchId}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Transfer Quantity <span className="text-red-500">*</span>
                {maxQty !== null && (
                  <span className="text-indigo-600 font-bold ml-1.5">
                    (Max: {maxQty})
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <FiHash size={16} />
                </div>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  max={maxQty ?? undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border rounded-xl font-bold text-xs text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-[var(--accent-color)] ${
                    errors.quantity ? "border-red-400" : "border-[var(--border-color)]"
                  }`}
                />
              </div>
              {errors.quantity && (
                <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Note / Reference <span className="text-slate-400 font-medium normal-case">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <FiFileText size={16} />
              </div>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={2}
                placeholder="Reason or invoice number for stock transfer audit..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl font-semibold text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  Distributing...
                </>
              ) : (
                "Distribute Stock"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
