import axios from "axios";

const API_ROOT =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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

// GET all customers
export const getAllCustomers = () => customerApi.get("/");

// GET by id
export const getCustomerById = (id) => customerApi.get(`/${id}`);

// CREATE
export const createCustomer = (data) => customerApi.post("/", data);

// UPDATE
export const updateCustomer = (id, data) =>
  customerApi.put(`/${id}`, data);

// DELETE
export const deleteCustomer = (id) => customerApi.delete(`/${id}`);

// SEARCH
export const searchCustomers = (query) =>
  customerApi.get(`/search?q=${query}`);