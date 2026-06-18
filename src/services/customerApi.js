import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_ROOT = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;

const CUSTOMER_API_URL =
  import.meta.env.VITE_CUSTOMER_API_URL || `${API_ROOT}/customers`;

const customerApi = axios.create({
  baseURL: CUSTOMER_API_URL,
});

// Attach token
customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET all customers (with optional search by name/email/phone)
export const getAllCustomers = (search = "") =>
  customerApi.get("/", { params: search ? { search } : {} });

// GET by id
export const getCustomerById = (id) => customerApi.get(`/${id}`);

// CREATE
export const createCustomer = (data) => customerApi.post("/", data);

// UPDATE
export const updateCustomer = (id, data) =>
  customerApi.put(`/${id}`, data);

// DELETE
export const deleteCustomer = (id) => customerApi.delete(`/${id}`);

// SEARCH by name / email / phone — uses the backend ?search= param on GET /
export const searchCustomers = (query) =>
  customerApi.get("/", { params: { search: query } });

// GET customers by branch
export const getCustomersByBranch = (branchId, search = "") =>
  customerApi.get(`/branch/${branchId}`, {
    params: search ? { search } : {},
  });

// ANALYTICS
export const getCustomerAnalytics = () =>
  customerApi.get("/analytics/overview");

// ADD LOYALTY POINTS
export const addLoyaltyPoints = (customerId, amount) =>
  customerApi.post("/loyalty/add", { customerId, amount });