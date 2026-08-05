import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/warehouses`;

const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Warehouses ───────────────────
export const getAllWarehouses = async () => {
  const response = await axios.get(API_BASE_URL, { headers: headers() });
  return response.data;
};

export const getWarehouseById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`, { headers: headers() });
  return response.data;
};

// ── NEW: Main Warehouse ────────────────────────────────────────
// Kalin thiyana (main) warehouse eka return karanawa.
// isMain=true warehouse eka nathnam, first active warehouse eka use karanawa.
export const getMainWarehouse = async () => {
  const response = await axios.get(`${API_BASE_URL}/main`, { headers: headers() });
  return response.data;
};

// Main warehouse eke product list + stock (search, pagination, lowStock filter)
export const getMainWarehouseProducts = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/main/products`, {
    params,
    headers: headers(),
  });
  return response.data;
};

// Warehouse ekak main widihata set karanawa (ADMIN only)
export const setMainWarehouse = async (warehouseId) => {
  const response = await axios.put(`${API_BASE_URL}/${warehouseId}/set-main`, {}, { headers: headers() });
  return response.data;
};
// ──────────────────────────────────────────────────────────────

export const createWarehouse = async (data) => {
  const response = await axios.post(API_BASE_URL, data, { headers: headers() });
  return response.data;
};

export const updateWarehouse = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, data, { headers: headers() });
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, { headers: headers() });
  return response.data;
};

// ─── Zones ────────────────────────
export const getZonesByWarehouse = async (warehouseId) => {
  const response = await axios.get(`${API_BASE_URL}/${warehouseId}/zones`, { headers: headers() });
  return response.data;
};

export const createZone = async (warehouseId, data) => {
  const response = await axios.post(`${API_BASE_URL}/${warehouseId}/zones`, data, { headers: headers() });
  return response.data;
};

export const updateZone = async (zoneId, data) => {
  const response = await axios.put(`${API_BASE_URL}/zones/${zoneId}`, data, { headers: headers() });
  return response.data;
};

export const deleteZone = async (zoneId) => {
  const response = await axios.delete(`${API_BASE_URL}/zones/${zoneId}`, { headers: headers() });
  return response.data;
};

// ─── Stock ────────────────────────
export const getWarehouseStock = async (warehouseId) => {
  const response = await axios.get(`${API_BASE_URL}/${warehouseId}/stock`, { headers: headers() });
  return response.data;
};

export const addStock = async (warehouseId, data) => {
  const response = await axios.post(`${API_BASE_URL}/${warehouseId}/stock/add`, data, { headers: headers() });
  return response.data;
};

export const removeStock = async (warehouseId, data) => {
  const response = await axios.post(`${API_BASE_URL}/${warehouseId}/stock/remove`, data, { headers: headers() });
  return response.data;
};

export const transferStock = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/transfer`, data, { headers: headers() });
  return response.data;
};

// ─── Transactions & Reports ───────
export const getTransactions = async (warehouseId, filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}/${warehouseId}/transactions`, {
    params: filters,
    headers: headers(),
  });
  return response.data;
};

export const getWarehouseStats = async (warehouseId) => {
  const response = await axios.get(`${API_BASE_URL}/${warehouseId}/stats`, { headers: headers() });
  return response.data;
};
