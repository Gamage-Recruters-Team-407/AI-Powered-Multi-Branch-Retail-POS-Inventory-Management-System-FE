import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const USER_API_URL = import.meta.env.VITE_USER_API_URL || `${API_ROOT}/users`;

const userApi = axios.create({
  baseURL: USER_API_URL,
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllUsers = () => userApi.get("/");
export const getUserById = (id) => userApi.get(`/${id}`);
export const createUser = (data) => userApi.post("/", data);
export const updateUser = (id, data) => userApi.put(`/${id}`, data);
export const deleteUser = (id) => userApi.delete(`/${id}`);
export const searchUsers = (query) => userApi.get(`/search?q=${query}`);