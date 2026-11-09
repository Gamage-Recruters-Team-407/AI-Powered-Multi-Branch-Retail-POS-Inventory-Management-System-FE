import { useState, useEffect } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";
import * as warehouseService from "../../services/warehouseService";

export default function TransferForm({ currentWarehouseId, currentZones, currentStocks, onSubmit, onClose, loading = false }) {
  const [warehouses, setWarehouses] = useState([]);
  const [destZones, setDestZones] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [loadingDestZones, setLoadingDestZones] = useState(false);

  const [formData, setFormData] = useState({
    fromZone: "",
    product: "",
    toWarehouse: "",
    toZone: "",
    quantity: 1,
    note: "",
  });
  const [errors, setErrors] = useState({});

  // Load all warehouses for destination picker
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseService.getAllWarehouses();
        // Exclude current warehouse
        const others = (res.data || []).filter((w) => w._id !== currentWarehouseId);
        setWarehouses(others);
      } catch (err) {
        console.error("Failed to load warehouses", err);
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, [currentWarehouseId]);

  // Load destination zones when destination warehouse changes
  useEffect(() => {
    if (!formData.toWarehouse) { setDestZones([]); return; }
    const fetchDestZones = async () => {
      setLoadingDestZones(true);
      try {
        const res = await warehouseService.getZonesByWarehouse(formData.toWarehouse);
        setDestZones(res.data || []);
      } catch (err) {
        console.error("Failed to load destination zones", err);
      } finally {
        setLoadingDestZones(false);
      }
    };
    fetchDestZones();
    setFormData((prev) => ({ ...prev, toZone: "" }));
  }, [formData.toWarehouse]);

  // Products available in selected source zone
  const availableProducts = formData.fromZone
    ? currentStocks.filter((s) => s.zone?._id === formData.fromZone || s.zone === formData.fromZone)
    : [];

  const selectedStock = availableProducts.find(
    (s) => (s.product?._id || s.product) === formData.product
  );
  const maxQty = selectedStock?.quantity ?? null;

  // Reset product when source zone changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, product: "", quantity: 1 }));
  }, [formData.fromZone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fromZone) errs.fromZone = "Select source zone";
    if (!formData.product) errs.product = "Select a product";
    if (!formData.toWarehouse) errs.toWarehouse = "Select destination warehouse";
    if (!formData.toZone) errs.toZone = "Select destination zone";
    if (!formData.quantity || Number(formData.quantity) < 1) errs.quantity = "Quantity must be at least 1";
    if (maxQty !== null && Number(formData.quantity) > maxQty)
      errs.quantity = `Only ${maxQty} units available`;
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      fromWarehouse: currentWarehouseId,
      fromZone: formData.fromZone,
      toWarehouse: formData.toWarehouse,
      toZone: formData.toZone,
      product: formData.product,
      quantity: Number(formData.quantity),
      note: formData.note || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FiArrowRight size={22} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Transfer Stock</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* FROM section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">From (This Warehouse)</p>

            {/* Source Zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Source Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="fromZone"
                value={formData.fromZone}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fromZone ? "border-red-400" : "border-gray-300"}`}
              >
                <option value="">Select zone...</option>
                {currentZones.map((z) => (
                  <option key={z._id} value={z._id}>{z.zoneName} ({z.zoneCode})</option>
                ))}
              </select>
              {errors.fromZone && <p className="text-red-500 text-xs mt-1">{errors.fromZone}</p>}
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                disabled={!formData.fromZone}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${errors.product ? "border-red-400" : "border-gray-300"}`}
              >
                <option value="">{formData.fromZone ? "Select product..." : "Select zone first"}</option>
                {availableProducts.map((s) => (
                  <option key={s._id} value={s.product?._id || s.product}>
                    {s.product?.name || "Unknown"} — {s.quantity} units
                  </option>
                ))}
              </select>
              {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product}</p>}
            </div>
          </div>

          {/* Arrow divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="bg-blue-100 text-blue-600 rounded-full p-2">
              <FiArrowRight size={18} />
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* TO section */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">To (Destination)</p>

            {/* Destination Warehouse */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Destination Warehouse <span className="text-red-500">*</span>
              </label>
              {loadingWarehouses ? (
                <p className="text-sm text-gray-400">Loading warehouses...</p>
              ) : (
                <select
                  name="toWarehouse"
                  value={formData.toWarehouse}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.toWarehouse ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>{w.name} — {w.location}</option>
                  ))}
                </select>
              )}
              {errors.toWarehouse && <p className="text-red-500 text-xs mt-1">{errors.toWarehouse}</p>}
            </div>

            {/* Destination Zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Destination Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="toZone"
                value={formData.toZone}
                onChange={handleChange}
                disabled={!formData.toWarehouse || loadingDestZones}
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${errors.toZone ? "border-red-400" : "border-gray-300"}`}
              >
                <option value="">
                  {loadingDestZones ? "Loading..." : formData.toWarehouse ? "Select zone..." : "Select warehouse first"}
                </option>
                {destZones.map((z) => (
                  <option key={z._id} value={z._id}>{z.zoneName} ({z.zoneCode})</option>
                ))}
              </select>
              {errors.toZone && <p className="text-red-500 text-xs mt-1">{errors.toZone}</p>}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
              {maxQty !== null && (
                <span className="text-xs text-gray-500 font-normal ml-2">(max: {maxQty})</span>
              )}
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max={maxQty ?? undefined}
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={2}
              placeholder="Reason for transfer..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm transition"
            >
              {loading ? "Transferring..." : "Transfer Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
