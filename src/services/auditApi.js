import api from '../api/axiosInstance';

/**
 * Fetch Audit Logs with filters
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.action) query.append('action', params.action);
    if (params.userId) query.append('user', params.userId);
    if (params.module && params.module !== 'All Modules') query.append('module', params.module);
    if (params.severity && params.severity !== 'All Severities') query.append('severity', params.severity);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);
    if (params.branchId) query.append('branch', params.branchId);

    const res = await api.get(`/audit/logs?${query.toString()}`);
    // Backend returns { success, data, pagination }
    return {
      data: res.data?.data || [],
      pagination: res.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Fetch Audit Dashboard Statistics
 */
export const getAuditStats = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.branchId) query.append('branch', params.branchId);

    const res = await api.get(`/audit/stats?${query.toString()}`);
    // Backend returns { success, data }
    return { data: res.data?.data || {} };
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

/**
 * Fetch Login History
 */
export const getLoginHistory = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    const page = params.page || 1;
    const limit = params.limit || 10;
    query.append('page', page);
    query.append('limit', limit);
    
    if (params.userId) query.append('userId', params.userId);
    if (params.status) query.append('success', params.status === 'success' ? 'true' : 'false');
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);

    const res = await api.get(`/audit/login-attempts?${query.toString()}`);
    // Backend returns { success, data, pagination }
    return {
      data: res.data?.data || [],
      pagination: res.data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 }
    };
  } catch (error) {
    console.error('Error fetching login history:', error);
    throw error;
  }
};

/**
 * Fetch Security Events / Monitor
 */
export const getSecurityEvents = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.type) query.append('type', params.type);
    if (params.severity) query.append('severity', params.severity);
    if (params.resolved !== undefined) query.append('resolved', params.resolved);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const res = await api.get(`/audit/suspicious-activity?${query.toString()}`);
    // Backend returns { success, data, count }
    return {
      data: res.data?.data || [],
      count: res.data?.count || 0
    };
  } catch (error) {
    console.error('Error fetching security events:', error);
    throw error;
  }
};

/**
 * Resolve a Security Event with Notes
 */
export const resolveSecurityEvent = async (id, notes) => {
  try {
    const res = await api.patch(`/audit/logs/${id}/review`, { notes });
    return res.data;
  } catch (error) {
    console.error('Error resolving security event:', error);
    throw error;
  }
};

/**
 * Generate a New Security/Audit Report
 */
export const generateAuditReport = async (payload) => {
  try {
    const res = await api.get('/audit/compliance-report', {
      params: {
        startDate: payload.startDate,
        endDate: payload.endDate,
        branch: payload.branchId
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw error;
  }
};

/**
 * Get Historically Generated Reports List
 */
export const getAuditReportHistory = async () => {
  // This endpoint may need to be implemented separately
  // For now, return mock data structure
  return { data: [] };
};

/**
 * Export Logs
 */
export const exportAuditLogs = (params = {}) => {
  const query = new URLSearchParams();
  if (params.format) query.append('format', params.format);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.module) query.append('module', params.module);
  return api.get(`/audit/export?${query.toString()}`);
};

/**
 * User Sessions Management
 */
export const getActiveSessions = () => api.get('/audit/sessions/active');

export const revokeSession = async (sessionId) => {
  try {
    // Call backend endpoint to revoke a specific session if available
    if (!sessionId) {
      throw new Error('sessionId is required');
    }
    const res = await api.post(`/audit/sessions/${sessionId}/revoke`);
    return res.data;
  } catch (error) {
    console.error('Error revoking session:', error);
    throw error;
  }
};

export const revokeAllSessions = (userId) =>
  api.delete(`/audit/sessions/user/${userId}`);