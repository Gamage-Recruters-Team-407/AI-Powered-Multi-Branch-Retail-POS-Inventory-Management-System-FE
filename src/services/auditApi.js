import api from '../api/axiosInstance';

// Audit Logs
export const getAuditLogs = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.action) query.append('action', params.action);
  if (params.userId) query.append('userId', params.userId);
  if (params.module) query.append('module', params.module);
  if (params.severity) query.append('severity', params.severity);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.search) query.append('search', params.search);
  if (params.branchId) query.append('branchId', params.branchId);
  return api.get(`/audit/logs?${query.toString()}`);
};

export const getAuditLogById = (id) => api.get(`/audit/logs/${id}`);

export const getAuditStats = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.branchId) query.append('branchId', params.branchId);
  return api.get(`/audit/stats?${query.toString()}`);
};

// Login History
export const getLoginHistory = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.userId) query.append('userId', params.userId);
  if (params.status) query.append('status', params.status);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.search) query.append('search', params.search);
  return api.get(`/audit/login-history?${query.toString()}`);
};

// Security Events
export const getSecurityEvents = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.type) query.append('type', params.type);
  if (params.severity) query.append('severity', params.severity);
  if (params.resolved) query.append('resolved', params.resolved);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  return api.get(`/audit/security-events?${query.toString()}`);
};

export const resolveSecurityEvent = (id, notes) =>
  api.patch(`/audit/security-events/${id}/resolve`, { notes });

// Reports
export const generateAuditReport = (payload) =>
  api.post('/audit/reports/generate', payload);

export const getAuditReportHistory = () => api.get('/audit/reports');

export const exportAuditLogs = (params = {}) => {
  const query = new URLSearchParams();
  if (params.format) query.append('format', params.format);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.module) query.append('module', params.module);
  return api.get(`/audit/export?${query.toString()}`);
};

// User Sessions
export const getActiveSessions = () => api.get('/audit/sessions/active');
export const revokeSession = (sessionId) =>
  api.delete(`/audit/sessions/${sessionId}`);
export const revokeAllSessions = (userId) =>
  api.delete(`/audit/sessions/user/${userId}`);
