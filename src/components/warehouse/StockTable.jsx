import { FiAlertTriangle, FiPlusCircle, FiMinusCircle } from "react-icons/fi";

export default function StockTable({ stocks, onAddStock, onRemoveStock }) {
  return (
    <div>
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Warehouse Stock
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({stocks.length} item{stocks.length !== 1 ? "s" : ""})
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onAddStock}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiPlusCircle size={15} /> Add Stock
          </button>
          <button
            onClick={onRemoveStock}
            disabled={stocks.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiMinusCircle size={15} /> Remove Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">SKU</th>
              <th className="px-6 py-3 text-left">Zone</th>
              <th className="px-6 py-3 text-right">Quantity</th>
              <th className="px-6 py-3 text-right">Min Stock</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  No stock records found
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {stock.product?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {stock.product?.sku || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {stock.zone?.zoneName || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    {stock.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {stock.minStock}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {stock.isLowStock ? (
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <FiAlertTriangle size={14} />
                        <span className="text-xs font-semibold">Low Stock</span>
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
