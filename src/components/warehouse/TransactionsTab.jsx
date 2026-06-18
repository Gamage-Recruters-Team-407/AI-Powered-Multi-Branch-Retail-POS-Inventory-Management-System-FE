import { useState, useEffect, useCallback } from "react";
import { FiFilter, FiLoader, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import * as warehouseService from "../../services/warehouseService";

const TYPE_STYLES = {
  IN:            { label: "IN",            bg: "bg-green-100",  text: "text-green-700"  },
  OUT:           { label: "OUT",           bg: "bg-red-100",    text: "text-red-700"    },
  TRANSFER_IN:   { label: "TRANSFER IN",   bg: "bg-blue-100",   text: "text-blue-700"   },
  TRANSFER_OUT:  { label: "TRANSFER OUT",  bg: "bg-orange-100", text: "text-orange-700" },
  ADJUSTMENT:    { label: "ADJUSTMENT",    bg: "bg-purple-100", text: "text-purple-700" },
};

const TYPES = ["", "IN", "OUT", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT"];

export default function TransactionsTab({ warehouseId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const fetchTransactions = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters = { page: currentPage, limit: LIMIT };
      if (type) filters.type = type;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await warehouseService.getTransactions(warehouseId, filters);
      setTransactions(res.data);
      setTotal(res.total);
      setTotalPages(res.pages);
      setPage(res.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [warehouseId, type, startDate, endDate]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleApplyFilters = () => fetchTransactions(1);

  const handleClearFilters = () => {
    setType("");
    setStartDate("");
    setEndDate("");
    // fetchTransactions will be triggered by useEffect after state settles
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchTransactions(newPage);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Type filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t || "All Types"}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Buttons */}
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiFilter size={14} /> Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiRefreshCw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {transactions.length} of {total} transaction{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <FiLoader className="text-3xl text-blue-600 animate-spin" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No transactions found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {transactions.map((tx) => {
                  const style = TYPE_STYLES[tx.type] || { label: tx.type, bg: "bg-gray-100", text: "text-gray-700" };
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {tx.product?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {tx.product?.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {tx.zone?.zoneName || "—"}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        tx.type === "IN" || tx.type === "TRANSFER_IN"
                          ? "text-green-600"
                          : tx.type === "OUT" || tx.type === "TRANSFER_OUT"
                          ? "text-red-600"
                          : "text-purple-600"
                      }`}>
                        {tx.type === "OUT" || tx.type === "TRANSFER_OUT" ? "−" : "+"}
                        {tx.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                        {tx.reference || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {tx.performedBy?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                        {tx.note || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft size={16} />
                </button>
                {/* Page number pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                          item === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
