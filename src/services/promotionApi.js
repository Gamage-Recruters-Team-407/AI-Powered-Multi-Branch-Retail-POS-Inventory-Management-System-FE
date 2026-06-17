import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PROMOTION_API_URL = `${API_ROOT}/promotions`;

const promotionApi = axios.create({
  baseURL: PROMOTION_API_URL,
});

promotionApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET all promotions
export const getPromotions = () => {
  return promotionApi.get("/");
};

// GET promotion by ID
export const getPromotionById = (id) => {
  return promotionApi.get(`/${id}`);
};

// CREATE a new promotion
export const createPromotion = (data) => {
  return promotionApi.post("/", data);
};

// UPDATE an existing promotion
export const updatePromotion = (id, data) => {
  return promotionApi.put(`/${id}`, data);
};

// DELETE a promotion
export const deletePromotion = (id) => {
  return promotionApi.delete(`/${id}`);
};

// VALIDATE a coupon code
export const validateCoupon = (data) => {
  return promotionApi.post("/validate", data);
};

export default {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validateCoupon,
};
