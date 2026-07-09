import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_ROOT = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;

const CATEGORY_API_URL =
  import.meta.env.VITE_RETAIL_POS_CATEGORY_API_URL || `${API_ROOT}/categories`;

const categoryManagementApi = axios.create({
  baseURL: CATEGORY_API_URL,
});

export const getAllCategories = () => {
  return categoryManagementApi.get("/");
};

export const getCategoryById = (id) => {
  return categoryManagementApi.get(`/${id}`);
};

export const addCategory = (categoryData) => {
  return categoryManagementApi.post("/", categoryData);
};

export const updateCategory = (id, categoryData) => {
  return categoryManagementApi.put(`/${id}`, categoryData);
};

export const deleteCategory = (id) => {
  return categoryManagementApi.delete(`/${id}`);
};