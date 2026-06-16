/**
 * reportService.js
 * Reporting Module — Frontend API Service
 *
 * Calls the backend Reporting API.
 * Falls back to static demo data if the backend is unreachable.
 *
 * Base URL: import.meta.env.VITE_API_URL (set in .env or .env.example)
 * Default:  http://localhost:5000
 *
 * Backend endpoints (feature/tharsiga-reporting-backend):
 *   GET    /api/reports/summary
 *   GET    /api/reports/sales
 *   GET    /api/reports/inventory
 *   GET    /api/reports/branch-performance
 *   GET    /api/reports/history            ← database-driven (Report collection)
 *   GET    /api/reports/scheduled          ← database-driven (ScheduledReport collection)
 *   POST   /api/reports/scheduled          ← create new schedule + register cron
 *   PATCH  /api/reports/scheduled/:id      ← toggle active / update
 *   DELETE /api/reports/scheduled/:id      ← delete + stop cron
 *   POST   /api/reports/export/pdf
 *   POST   /api/reports/export/excel
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────
// STATIC FALLBACK DATA
// Used when backend is unreachable (e.g. backend not running locally).
// ─────────────────────────────────────────────────────────────
const FALLBACK_SUMMARY = {
    totalSales: 2400000,
    totalOrders: 1248,
    lowStockItems: 36,
    activeBranches: 8,
    netRevenue: 1800000,
    _note: 'Fallback static data — backend unavailable',
};

const FALLBACK_SALES = [
    { id: 'RPT-001', branch: 'Colombo', type: 'Sales', period: 'May 2026', amount: 850000, status: 'Completed' },
    { id: 'RPT-002', branch: 'Kandy', type: 'Inventory', period: 'May 2026', amount: 420000, status: 'Review' },
    { id: 'RPT-003', branch: 'Galle', type: 'Sales', period: 'May 2026', amount: 610000, status: 'Completed' },
    { id: 'RPT-004', branch: 'All Branches', type: 'Business Summary', period: 'Q2 2026', amount: 2400000, status: 'Scheduled' },
    { id: 'RPT-005', branch: 'Jaffna', type: 'Branch Performance', period: 'May 2026', amount: 310000, status: 'Pending' },
    { id: 'RPT-006', branch: 'Negombo', type: 'Customer', period: 'May 2026', amount: 195000, status: 'Completed' },
];

const FALLBACK_BRANCH_PERFORMANCE = [
    { branch: 'Colombo', revenue: 850000, growth: 12.4, orders: 380 },
    { branch: 'Kandy', revenue: 610000, growth: 8.1, orders: 275 },
    { branch: 'Galle', revenue: 420000, growth: 5.3, orders: 190 },
    { branch: 'Jaffna', revenue: 310000, growth: -2.1, orders: 140 },
    { branch: 'Negombo', revenue: 195000, growth: 3.8, orders: 88 },
    { branch: 'Matara', revenue: 175000, growth: 6.7, orders: 75 },
];

const FALLBACK_HISTORY = [
    { action: 'Sales Report exported as PDF', user: 'Amal Perera', date: '2026-06-02', time: '4:35 PM', format: 'PDF' },
    { action: 'Inventory Summary exported as Excel', user: 'Nimal Silva', date: '2026-06-01', time: '11:20 AM', format: 'Excel' },
    { action: 'Branch Performance Report generated', user: 'Amal Perera', date: '2026-05-31', time: '9:05 AM', format: 'View' },
    { action: 'Business Summary Q2 2026 scheduled', user: 'System', date: '2026-05-30', time: '8:00 PM', format: 'Scheduled' },
    { action: 'Customer Report exported as PDF', user: 'Ravi Kumar', date: '2026-05-29', time: '2:15 PM', format: 'PDF' },
];

const FALLBACK_SCHEDULED = [
    { id: 'sch-1', title: 'Daily Sales Summary', frequency: 'Every day at 8:00 PM', nextRun: 'Today, 8:00 PM', type: 'Sales', active: true },
    { id: 'sch-2', title: 'Weekly Inventory Report', frequency: 'Every Monday at 9:00 AM', nextRun: 'Mon, 9 Jun 2026', type: 'Inventory', active: true },
    { id: 'sch-3', title: 'Monthly Branch Performance', frequency: 'First day of every month', nextRun: '1 Jul 2026', type: 'Branch Performance', active: true },
    { id: 'sch-4', title: 'Quarterly Business Summary', frequency: 'Every 3 months', nextRun: '1 Jul 2026', type: 'Business Summary', active: false },
];

// ─────────────────────────────────────────────────────────────
// HTTP HELPER
// Wraps fetch with JSON parsing and error handling.
// Returns { data, source, error } — never throws.
// ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });

        if (!res.ok) {
            const text = await res.text();
            return { data: null, error: `HTTP ${res.status}: ${text}` };
        }

        const json = await res.json();
        return { data: json, error: null };
    } catch (err) {
        // Network error / backend not reachable
        return { data: null, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// Each function tries the real API first, falls back to static.
// Returns { data, source, error }
//   source: 'api' | 'api-sample' | 'fallback'
//   error:  null if OK, string message if failed
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/reports/summary
 * Returns KPI totals for the dashboard cards.
 */
export async function fetchReportSummary() {
    const { data, error } = await apiFetch('/api/reports/summary');

    if (error || !data?.success) {
        return { data: FALLBACK_SUMMARY, source: 'fallback', error };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * GET /api/reports/sales
 * Returns sales records with optional query filters.
 * @param {object} filters { branch, fromDate, toDate, status, search }
 */
export async function fetchSalesReport(filters = {}) {
    const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v && v !== 'All Branches' && v !== 'All Statuses' && v !== 'All Types')
    ).toString();

    const path = `/api/reports/sales${params ? `?${params}` : ''}`;
    const { data, error } = await apiFetch(path);

    if (error || !data?.success) {
        return { data: FALLBACK_SALES, source: 'fallback', error };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * GET /api/reports/inventory
 * Returns inventory summary and low-stock items.
 */
export async function fetchInventoryReport() {
    const { data, error } = await apiFetch('/api/reports/inventory');

    if (error || !data?.success) {
        return {
            data: { summary: { totalProducts: 486, totalQuantity: 32610, inventoryValue: 124600, lowStockCount: 36 }, lowStockItems: [] },
            source: 'fallback',
            error,
        };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * GET /api/reports/branch-performance
 * Returns per-branch revenue data for charts.
 * @param {object} filters { fromDate, toDate }
 */
export async function fetchBranchPerformance(filters = {}) {
    const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v)
    ).toString();

    const path = `/api/reports/branch-performance${params ? `?${params}` : ''}`;
    const { data, error } = await apiFetch(path);

    if (error || !data?.success) {
        return { data: FALLBACK_BRANCH_PERFORMANCE, source: 'fallback', error };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * GET /api/reports/history
 * Returns report generation/export activity history.
 */
export async function fetchReportHistory() {
    const { data, error } = await apiFetch('/api/reports/history');

    if (error || !data?.success) {
        return { data: FALLBACK_HISTORY, source: 'fallback', error };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * GET /api/reports/scheduled
 * Returns scheduled report configurations.
 */
export async function fetchScheduledReports() {
    const { data, error } = await apiFetch('/api/reports/scheduled');

    if (error || !data?.success) {
        return { data: FALLBACK_SCHEDULED, source: 'fallback', error };
    }

    return {
        data: data.data,
        source: data.source === 'sample' ? 'api-sample' : 'api',
        error: null,
    };
}

/**
 * POST /api/reports/export/pdf
 * Triggers PDF export. Downloads generated PDF.
 * @param {object} payload { reportType, branch, fromDate, toDate }
 */
export async function exportPDF(payload = {}) {
  try {
    const res = await fetch(`${BASE_URL}/api/reports/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to export PDF`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const typeClean = (payload.reportType || 'Sales').replace(/\s+/g, '_');
    a.download = `report_${typeClean}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, error: null };
  } catch (err) {
    console.error('PDF export error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * POST /api/reports/export/excel
 * Triggers CSV/Excel export. Downloads generated CSV file.
 * @param {object} payload { reportType, branch, fromDate, toDate }
 */
export async function exportExcel(payload = {}) {
  try {
    const res = await fetch(`${BASE_URL}/api/reports/export/excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to export Excel`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const typeClean = (payload.reportType || 'Sales').replace(/\s+/g, '_');
    a.download = `report_${typeClean}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, error: null };
  } catch (err) {
    console.error('Excel export error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * POST /api/reports/scheduled
 * Create a new persistent scheduled report and register its cron task.
 * @param {{ title: string, type: string, frequency: string, active: boolean }} payload
 */
export async function createSchedule(payload = {}) {
    const { data, error } = await apiFetch('/api/reports/scheduled', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (error || !data?.success) {
        return { data: null, error: error || 'Failed to create schedule.' };
    }

    return { data: data.data, error: null };
}

/**
 * PATCH /api/reports/scheduled/:id
 * Toggle active/inactive or update schedule fields. Re-registers cron task on backend.
 * @param {string} id - MongoDB ObjectId of the schedule
 * @param {object} updates - Fields to update (e.g. { active: false })
 */
export async function updateSchedule(id, updates = {}) {
    const { data, error } = await apiFetch(`/api/reports/scheduled/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

    if (error || !data?.success) {
        return { data: null, error: error || 'Failed to update schedule.' };
    }

    return { data: data.data, error: null };
}

/**
 * DELETE /api/reports/scheduled/:id
 * Delete a scheduled report and stop its cron task.
 * @param {string} id - MongoDB ObjectId of the schedule
 */
export async function deleteSchedule(id) {
    const { data, error } = await apiFetch(`/api/reports/scheduled/${id}`, {
        method: 'DELETE',
    });

    if (error || !data?.success) {
        return { success: false, error: error || 'Failed to delete schedule.' };
    }

    return { success: true, error: null };
}
