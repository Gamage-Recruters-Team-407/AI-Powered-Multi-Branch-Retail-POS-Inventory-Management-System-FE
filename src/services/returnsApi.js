import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const returnsApi = axios.create({
  baseURL: `${API_URL}/api/returns`,
});

returnsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getInvoices = async () => {
  const response = await returnsApi.get("/invoices");
  return response.data;
};

export const getInvoiceById = async (invoiceId) => {
  const response = await returnsApi.get(`/invoices/${invoiceId}`);
  return response.data;
};

export const getReturns = async () => {
  const response = await returnsApi.get("/");
  return response.data;
};

export const createReturn = async (returnData) => {
  const response = await returnsApi.post("/", returnData);
  return response.data;
};

export const updateReturnStatus = async (id, status) => {
  const response = await returnsApi.patch(`/${id}/status`, { status });
  return response.data;
};
