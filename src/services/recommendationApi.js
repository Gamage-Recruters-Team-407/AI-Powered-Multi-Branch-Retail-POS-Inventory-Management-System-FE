import axios from 'axios';

// Flask ML API URL is hardcoded here to ensure it bypasses the Node.js backend
const API_BASE_URL = 'http://localhost:5001/predict';

const recommendationApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

// The Flask API returns data directly in response.data, without an extra 'data' property
const unwrapRecommendationData = (response) => response.data || [];

export const getTopProducts = async (limit = 10) => {
  const response = await recommendationApi.get('/sales/top-products', {
    params: { limit },
  });

  return unwrapRecommendationData(response);
};

export const getTrendingProducts = async (limit = 10) => {
  const response = await recommendationApi.get('/trending', {
    params: { limit },
  });

  return unwrapRecommendationData(response);
};

export const getPersonalizedRecommendations = async (customerId, limit = 8) => {
  if (!customerId) {
    return [];
  }

  const response = await recommendationApi.get(`/personalized/${customerId}`, {
    params: { limit },
  });

  const data = unwrapRecommendationData(response);
  return Array.isArray(data) ? data : [];
};

export const getCustomerList = async () => {
  const response = await recommendationApi.get('/customers/behavior');
  const data = unwrapRecommendationData(response);

  if (!Array.isArray(data)) return [];

  return data.map((c) => {
    const rawName = c.customerName || c.customerId || '';
    const firstName = rawName.toString().split(' ')[0];
    
    return {
      id: c.customerId,
      name: firstName,
    };
  });
};
