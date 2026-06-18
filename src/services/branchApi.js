import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BRANCH_API_URL =
  import.meta.env.VITE_RETAIL_POS_BRANCH_API_URL || `${API_ROOT}/branches`;

const branchApi = axios.create({
  baseURL: BRANCH_API_URL,
  timeout: 60000,
});

branchApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all branches
export const getAllBranches = () => {
  return branchApi.get("/");
};

// Get branch by id
export const getBranchById = (id) => {
  return branchApi.get(`/${id}`);
};

// Create branch
export const createBranch = (data) => {
  return branchApi.post("/", data);
};

// Update branch
export const updateBranch = (id, data) => {
  return branchApi.put(`/${id}`, data);
};

// Delete branch
export const deleteBranch = (id) => {
  return branchApi.delete(`/${id}`);
};

// Search branches
export const searchBranches = (query) => {
  return branchApi.get(`/search?q=${query}`);
};

// Branch inventory
export const getBranchInventory = (id) => {
  return branchApi.get(`/${id}/inventory`);
};

// Branch sales
export const getBranchSales = (id) => {
  return branchApi.get(`/${id}/sales`);
};

// Branch employees
export const getBranchEmployees = (id) => {
  return branchApi.get(`/${id}/employees`);
};

// Branch performance
export const getBranchPerformance = (id) => {
  return branchApi.get(`/${id}/performance`);
};

// Branch settings
export const updateBranchSettings = (id, data) => {
  return branchApi.put(`/${id}/settings`, data);
};