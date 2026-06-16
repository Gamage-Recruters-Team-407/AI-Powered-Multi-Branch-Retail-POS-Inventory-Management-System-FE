const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `HTTP ${res.status}: ${text}` };
    }
    const json = await res.json();
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function fetchKPISummary(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/kpi-summary${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchSalesTrends(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/sales-trends${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchProfitTrends(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/profit-trends${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchBranchPerformance(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/branch-performance${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchBranchRankings(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/branch-rankings${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchRevenueBreakdown(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/revenue-breakdown${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchDrillDown(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/drill-down${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchDrillDownTransactions(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/drill-down/transactions${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchProductPerformance(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/product-performance${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchCategoryAnalysis(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/category-analysis${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchCustomerInsights(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/customer-insights${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchInsights(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/insights${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

/**
 * Fetch all branches from the Branch collection (regardless of sales activity).
 * Used to populate the branch filter dropdown in AnalyticsPage.
 */
export async function fetchAllBranches() {
  const { data, error } = await apiFetch(`/api/branches`);
  if (error) return { data: [], error };
  // /api/branches returns a plain array, not { success, data }
  return { data: Array.isArray(data) ? data : [], error: null };
}

export async function fetchChartData(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/chart-data${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export async function fetchKPITrends(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  const { data, error } = await apiFetch(
    `/api/analytics/kpi-trends${qs ? `?${qs}` : ""}`,
  );
  if (error || !data?.success) return { data: null, error };
  return { data: data.data, error: null };
}

export const formatLKR = (val) => {
  if (val === undefined || val === null) return "LKR 0.00";
  return `LKR ${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (val) => {
  if (val === undefined || val === null) return "0";
  return Number(val).toLocaleString();
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return "0.00%";
  return `${Number(val).toFixed(2)}%`;
};
