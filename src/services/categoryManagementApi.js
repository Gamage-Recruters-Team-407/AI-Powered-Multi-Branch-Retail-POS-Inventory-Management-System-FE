import axios from "axios";

const CATEGORY_API_URL = import.meta.env.VITE_RETAIL_POS_CATEGORY_API_URL;

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