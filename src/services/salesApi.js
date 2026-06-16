import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const salesApi = axios.create({ baseURL: `${BASE_URL}/api/sales` });

// Attach JWT token on every request
salesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Create a completed sale  
export const createSale = (payload) => salesApi.post("/", payload);

// Fetch sales list with optional filters 
export const getSales = (params) => salesApi.get("/", { params });

//  Get a single sale (for receipt view) 
export const getSaleById = (id) => salesApi.get(`/${id}`);

// Void a sale
export const voidSale = (id) => salesApi.patch(`/${id}/void`);

// Sales summary (today / week / month)
export const getSalesSummary = (period = "today") =>
  salesApi.get("/summary", { params: { period } });

// Barcode product lookup
export const getProductByBarcode = (barcode) =>
  salesApi.get(`/barcode/${barcode}`);
