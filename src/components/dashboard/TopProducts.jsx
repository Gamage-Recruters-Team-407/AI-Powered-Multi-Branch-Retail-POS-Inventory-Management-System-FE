import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const REPORT_FETCH_LIMIT = 50;
const LIMIT_OPTIONS = [5, 10, 20, 50];

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

const formatLKR = (value, decimals = 2) => {
  const number = Number(value) || 0;

  return `Rs. ${number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

const formatNumber = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US');
};

const formatDateTime = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeProduct = (item = {}, index = 0) => {
  const revenue = item.revenue ?? item.totalRevenue ?? item.total_revenue ?? 0;

  const unitsSold =
    item.unitsSold ??
    item.units_sold ??
    item.totalQuantity ??
    item.quantity ??
    0;

  const orders =
    item.orders ??
    item.times_sold ??
    item.transactionCount ??
    item.orderCount ??
    0;

  return {
    originalRank: Number(item.rank || index + 1),
    productId: item.productId || item._id || item.id || '',
    productName:
      item.name ||
      item.productName ||
      item.product_name ||
      item.product ||
      'Unknown Product',
    barcode: item.barcode || '',
    brand: item.brand || '',
    category:
      item.categoryName ||
      item.category ||
      item.brand ||
      item.barcode ||
      '—',
    unitsSold: Number(unitsSold) || 0,
    revenue: Number(revenue) || 0,
    orders: Number(orders) || 0,
    averagePrice: Number(item.averagePrice || 0),
    growth: Number(item.growth || 0),
    lastSoldAt: item.lastSoldAt || null,
  };
};

const escapeCsv = (value) => {
  const safeValue = value === null || value === undefined ? '' : String(value);
  return `"${safeValue.replace(/"/g, '""')}"`;
};

const downloadCsvFile = (filename, rows) => {
  const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const TopProducts = ({ data, dateRange, selectedBranch }) => {
  const { token } = useAuth();

  const latestRequestRef = useRef(0);
  const fallbackProductsRef = useRef([]);

  const [allProducts, setAllProducts] = useState([]);
  const [serverSummary, setServerSummary] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fallbackProductsRef.current = Array.isArray(data?.top_products)
      ? data.top_products
      : [];
  }, [data?.top_products]);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const filterKey = useMemo(() => {
    return JSON.stringify({
      startDate: dateRange?.startDate || '',
      endDate: dateRange?.endDate || '',
      selectedBranch: selectedBranch || 'all',
    });
  }, [dateRange?.startDate, dateRange?.endDate, selectedBranch]);

  const apiGet = useCallback(async (path, config = {}) => {
    try {
      return await axiosInstance.get(path, config);
    } catch (err) {
      if (err?.response?.status === 404 && !path.startsWith('/api/')) {
        return await axiosInstance.get(`/api${path}`, config);
      }

      throw err;
    }
  }, []);

  // ✅ FIX: Use dateRange object as dependency instead of individual properties
  const buildParams = useCallback(
    (extraParams = {}) => {
      const params = { ...extraParams };

      if (dateRange?.startDate) params.startDate = dateRange.startDate;
      if (dateRange?.endDate) params.endDate = dateRange.endDate;

      if (
        selectedBranch &&
        selectedBranch !== 'all' &&
        isMongoObjectId(selectedBranch)
      ) {
        params.branchId = selectedBranch;
      } else {
        params.allBranches = true;
      }

      return params;
    },
    [dateRange, selectedBranch] // ✅ Changed from individual properties to full object
  );

  const fetchReportPage = useCallback(
    async (targetPage = 1, targetLimit = REPORT_FETCH_LIMIT) => {
      const response = await apiGet('/dashboard/top-products/report', {
        params: buildParams({
          page: targetPage,
          limit: targetLimit,
        }),
        headers: authHeaders,
      });

      return response.data?.data || {};
    },
    [apiGet, authHeaders, buildParams]
  );

  const fetchAllProducts = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setLoading(true);
    setError('');
    setAllProducts([]);
    setCurrentPage(1);

    try {
      const firstData = await fetchReportPage(1, REPORT_FETCH_LIMIT);

      if (latestRequestRef.current !== requestId) return;

      const firstProducts = Array.isArray(firstData.products)
        ? firstData.products
        : [];

      const firstPagination = firstData.pagination || {};
      const totalPages = Math.max(Number(firstPagination.pages) || 1, 1);

      let fetchedProducts = [...firstProducts];

      if (totalPages > 1) {
        const requests = [];

        for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
          requests.push(fetchReportPage(nextPage, REPORT_FETCH_LIMIT));
        }

        const responses = await Promise.all(requests);

        if (latestRequestRef.current !== requestId) return;

        responses.forEach((pageData) => {
          const pageProducts = Array.isArray(pageData.products)
            ? pageData.products
            : [];

          fetchedProducts = [...fetchedProducts, ...pageProducts];
        });
      }

      const normalizedProducts = fetchedProducts.map(normalizeProduct);

      setAllProducts(normalizedProducts);
      setServerSummary(firstData.summary || null);
      setCurrentPage(1);
    } catch (err) {
      if (latestRequestRef.current !== requestId) return;

      console.error('Top products fetch error:', err);

      const fallbackProducts = fallbackProductsRef.current.map(normalizeProduct);

      setAllProducts(fallbackProducts);
      setServerSummary(null);
      setCurrentPage(1);
      setError('Unable to load top products from server.');
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [fetchReportPage]);

  useEffect(() => {
    fetchAllProducts();
  }, [filterKey, fetchAllProducts]);

  const totalProducts = allProducts.length;
  const totalPages = Math.max(Math.ceil(totalProducts / rowsPerPage), 1);

  const safePage = Math.min(
    Math.max(Number(currentPage) || 1, 1),
    totalPages
  );

  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const visibleProducts = useMemo(() => {
    return allProducts.slice(startIndex, endIndex);
  }, [allProducts, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const computedSummary = useMemo(() => {
    const totalUnitsSold = allProducts.reduce(
      (sum, product) => sum + Number(product.unitsSold || 0),
      0
    );

    const totalRevenue = allProducts.reduce(
      (sum, product) => sum + Number(product.revenue || 0),
      0
    );

    return {
      totalProducts,
      totalUnitsSold,
      totalRevenue,
      totalOrders: serverSummary?.totalOrders ?? 0,
    };
  }, [allProducts, serverSummary?.totalOrders, totalProducts]);

  const handleRowsPerPageChange = (newLimit) => {
    if (loading || newLimit === rowsPerPage) return;

    setRowsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (loading || safePage <= 1) return;

    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    if (loading || safePage >= totalPages) return;

    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleRefresh = () => {
    fetchAllProducts();
  };

  const downloadFullReport = async () => {
    setDownloading(true);
    setError('');

    try {
      let reportProducts = allProducts;

      if (!reportProducts.length) {
        const firstData = await fetchReportPage(1, REPORT_FETCH_LIMIT);

        reportProducts = Array.isArray(firstData.products)
          ? firstData.products.map(normalizeProduct)
          : [];
      }

      const generatedAt = new Date().toLocaleString('en-US');

      const periodText =
        dateRange?.startDate && dateRange?.endDate
          ? `${dateRange.startDate} to ${dateRange.endDate}`
          : 'Selected period';

      const csvRows = [
        ['Top Performing Products Detailed Report'],
        ['Generated At', generatedAt],
        ['Period', periodText],
        [
          'Branch',
          selectedBranch && selectedBranch !== 'all'
            ? selectedBranch
            : 'All Branches',
        ],
        [],
        ['Summary'],
        ['Total Products', reportProducts.length],
        [
          'Total Units Sold',
          reportProducts.reduce(
            (sum, product) => sum + Number(product.unitsSold || 0),
            0
          ),
        ],
        [
          'Total Revenue',
          reportProducts.reduce(
            (sum, product) => sum + Number(product.revenue || 0),
            0
          ),
        ],
        ['Total Orders', serverSummary?.totalOrders ?? 0],
        [],
        [
          'Rank',
          'Product Name',
          'Product ID',
          'Barcode',
          'Brand',
          'Category',
          'Units Sold',
          'Orders',
          'Average Price',
          'Revenue',
          'Growth %',
          'Last Sold At',
        ],
        ...reportProducts.map((product, index) => [
          index + 1,
          product.productName,
          product.productId,
          product.barcode,
          product.brand,
          product.category,
          product.unitsSold,
          product.orders,
          product.averagePrice.toFixed(2),
          product.revenue.toFixed(2),
          product.growth.toFixed(2),
          formatDateTime(product.lastSoldAt),
        ]),
      ];

      const today = new Date().toISOString().split('T')[0];
      downloadCsvFile(`top-performing-products-report-${today}.csv`, csvRows);
    } catch (err) {
      console.error('Full report download error:', err);
      setError('Unable to download full report.');
    } finally {
      setDownloading(false);
    }
  };

  const startItem = visibleProducts.length === 0 ? 0 : startIndex + 1;

  const endItem =
    visibleProducts.length === 0
      ? 0
      : Math.min(startIndex + visibleProducts.length, totalProducts);

  return (
    <div className="tp-card">
      <div className="tp-topbar">
        <div>
          <h2 className="section-title">Top Selling Products</h2>
          <p className="section-sub">
            Ranked by sales performance for the selected period
          </p>
        </div>

        <button
          className="download-report-btn"
          type="button"
          onClick={downloadFullReport}
          disabled={downloading || loading}
        >
          {downloading ? 'Preparing Report...' : 'Download Full Report'}
        </button>
      </div>

      <div className="tp-toolbar">
        <div className="tp-limit-group">
          <span>Rows per page</span>

          {LIMIT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`tp-limit-btn ${
                rowsPerPage === option ? 'active' : ''
              }`}
              onClick={() => handleRowsPerPageChange(option)}
              aria-pressed={rowsPerPage === option}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="tp-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="tp-summary">
        <div>
          <span>Total Products</span>
          <strong>{formatNumber(computedSummary.totalProducts)}</strong>
        </div>

        <div>
          <span>Total Units Sold</span>
          <strong>{formatNumber(computedSummary.totalUnitsSold)}</strong>
        </div>

        <div>
          <span>Total Revenue</span>
          <strong>{formatLKR(computedSummary.totalRevenue)}</strong>
        </div>

        <div>
          <span>Total Orders</span>
          <strong>{formatNumber(computedSummary.totalOrders)}</strong>
        </div>
      </div>

      {error && <div className="tp-alert">{error}</div>}

      {loading ? (
        <div className="tp-state">
          <span className="tp-loader"></span>
          Loading products...
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="tp-empty">
          <div className="tp-empty-icon">📦</div>
          <strong>No top products found</strong>
          <span>There are no completed sales for the selected period.</span>
        </div>
      ) : (
        <>
          <div className="tp-table-wrap">
            <div
              className="tp-table"
              key={`table-${safePage}-${rowsPerPage}-${totalProducts}`}
            >
              <div className="tp-head">
                <div>#</div>
                <div>Product</div>
                <div>Units Sold</div>
                <div>Orders</div>
                <div>Average Price</div>
                <div>Revenue</div>
                <div>Growth</div>
              </div>

              {visibleProducts.map((product, index) => {
                const displayRank = startIndex + index + 1;

                return (
                  <div
                    key={`row-${safePage}-${rowsPerPage}-${displayRank}-${
                      product.productId || product.barcode || product.productName
                    }`}
                    className="tp-row"
                  >
                    <div className={`tp-rank rank-${Math.min(displayRank, 4)}`}>
                      {displayRank}
                    </div>

                    <div className="tp-product">
                      <div className="tp-name">{product.productName}</div>
                      <div className="tp-meta">
                        {product.brand ||
                          product.barcode ||
                          product.category ||
                          '—'}
                      </div>
                    </div>

                    <div>
                      <div className="tp-value">
                        {formatNumber(product.unitsSold)}
                      </div>
                      <div className="tp-small">units</div>
                    </div>

                    <div>
                      <div className="tp-value">
                        {formatNumber(product.orders)}
                      </div>
                      <div className="tp-small">orders</div>
                    </div>

                    <div className="tp-small-strong">
                      {formatLKR(product.averagePrice)}
                    </div>

                    <div className="tp-revenue">
                      {formatLKR(product.revenue)}
                    </div>

                    <div
                      className={`tp-growth ${
                        product.growth >= 0 ? 'up' : 'down'
                      }`}
                    >
                      {product.growth >= 0 ? '↑' : '↓'}{' '}
                      {Math.abs(product.growth).toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tp-footer">
            <div className="tp-count">
              Showing <strong>{startItem}</strong> - <strong>{endItem}</strong>{' '}
              of <strong>{formatNumber(totalProducts)}</strong> products
            </div>

            <div className="tp-pagination">
              <button
                type="button"
                disabled={safePage <= 1 || loading}
                onClick={handlePrevious}
              >
                ← Previous
              </button>

              <span className="tp-page-info">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages || loading}
                onClick={handleNext}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .tp-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.95);
          padding: 22px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          animation: fadeIn .5s ease both;
        }

        .tp-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 18px;
        }

        .section-title {
          font-size: 1.18rem;
          font-weight: 800;
          color: var(--gray-900);
          font-family: 'Syne', sans-serif;
          margin: 0;
        }

        .section-sub {
          font-size: .8rem;
          color: var(--gray-400);
          margin-top: 4px;
        }

        .download-report-btn {
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-radius: 12px;
          padding: 10px 16px;
          font-size: .82rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
          transition: all .2s ease;
          white-space: nowrap;
        }

        .download-report-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.3);
        }

        .download-report-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .tp-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 10px;
          margin-bottom: 16px;
        }

        .tp-limit-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: .8rem;
          font-weight: 700;
          color: #64748b;
        }

        .tp-limit-btn,
        .tp-refresh-btn {
          border: 1px solid #bfdbfe;
          background: #ffffff;
          color: #2563eb;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: .78rem;
          font-weight: 800;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, color .2s ease;
        }

        .tp-limit-btn:hover:not(.active),
        .tp-refresh-btn:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #60a5fa;
          color: #1d4ed8;
        }

        .tp-limit-btn.active,
        .tp-limit-btn.active:hover,
        .tp-limit-btn.active:focus {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
        }

        .tp-refresh-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .tp-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .tp-summary div {
          background: linear-gradient(180deg, #ffffff, #f8fafc);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px;
        }

        .tp-summary span {
          display: block;
          font-size: .7rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .04em;
          margin-bottom: 4px;
        }

        .tp-summary strong {
          display: block;
          font-size: .98rem;
          color: #0f172a;
          font-weight: 900;
        }

        .tp-alert {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 14px;
          font-size: .82rem;
          font-weight: 700;
        }

        .tp-table-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
        }

        .tp-table {
          min-width: 850px;
        }

        .tp-head,
        .tp-row {
          display: grid;
          grid-template-columns: 50px 2fr 1fr 1fr 1fr 1.2fr .9fr;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
        }

        .tp-head {
          background: #f8fafc;
          color: #94a3b8;
          font-size: .72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .tp-row {
          border-top: 1px solid #f1f5f9;
          transition: background .2s ease;
        }

        .tp-row:hover {
          background: #f8fafc;
        }

        .tp-rank {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .8rem;
          font-weight: 900;
        }

        .rank-1 {
          background: #fef3c7;
          color: #d97706;
        }

        .rank-2 {
          background: #f1f5f9;
          color: #64748b;
        }

        .rank-3 {
          background: #ffedd5;
          color: #c2410c;
        }

        .rank-4 {
          background: #dbeafe;
          color: #2563eb;
        }

        .tp-name {
          font-size: .9rem;
          font-weight: 850;
          color: #0f172a;
        }

        .tp-meta {
          font-size: .72rem;
          color: #94a3b8;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tp-value {
          font-size: .92rem;
          font-weight: 900;
          color: #0f172a;
        }

        .tp-small {
          font-size: .72rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .tp-small-strong {
          font-size: .84rem;
          color: #475569;
          font-weight: 800;
        }

        .tp-revenue {
          font-size: .92rem;
          font-weight: 900;
          color: #1d4ed8;
        }

        .tp-growth {
          width: fit-content;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: .78rem;
          font-weight: 900;
        }

        .tp-growth.up {
          color: #047857;
          background: #ecfdf5;
        }

        .tp-growth.down {
          color: #dc2626;
          background: #fef2f2;
        }

        .tp-state,
        .tp-empty {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          text-align: center;
          color: #64748b;
          font-size: .9rem;
          font-weight: 700;
        }

        .tp-empty-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          font-size: 1.7rem;
        }

        .tp-empty strong {
          color: #0f172a;
          font-size: 1rem;
        }

        .tp-empty span {
          color: #94a3b8;
          font-size: .82rem;
        }

        .tp-loader {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 3px solid #dbeafe;
          border-top-color: #2563eb;
          animation: tpSpin .8s linear infinite;
        }

        @keyframes tpSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .tp-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-top: 16px;
        }

        .tp-count {
          color: #64748b;
          font-size: .8rem;
          font-weight: 700;
        }

        .tp-count strong {
          color: #0f172a;
        }

        .tp-pagination {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tp-pagination button {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: .78rem;
          font-weight: 850;
          cursor: pointer;
        }

        .tp-pagination button:hover:not(:disabled) {
          background: #dbeafe;
        }

        .tp-pagination button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .tp-page-info {
          font-size: .82rem;
          color: #64748b;
          font-weight: 800;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          white-space: nowrap;
        }

        @media (max-width: 850px) {
          .tp-topbar,
          .tp-toolbar,
          .tp-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .tp-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .download-report-btn,
          .tp-refresh-btn {
            width: 100%;
          }

          .tp-pagination {
            justify-content: space-between;
          }
        }

        @media (max-width: 520px) {
          .tp-card {
            padding: 16px;
          }

          .tp-summary {
            grid-template-columns: 1fr;
          }

          .tp-limit-group {
            align-items: stretch;
          }

          .tp-limit-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TopProducts;