import axios from 'axios';

const apiHost =
  import.meta.env.VITE_RECOMMENDATION_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

const API_BASE_URL = apiHost.endsWith('/api')
  ? apiHost
  : `${apiHost.replace(/\/$/, '')}/api`;

const recommendationApi = axios.create({
  baseURL: `${API_BASE_URL}/recommendations`,
  timeout: 8000,
});

const unwrapRecommendationData = (response) => response.data?.data || [];

export const getTopProducts = async (limit = 10) => {
  const response = await recommendationApi.get('/sales/top-products', {
    params: { limit },
  });

  return unwrapRecommendationData(response);
};

export const getTrendingProducts = async (limit = 10) => {
  const response = await recommendationApi.get('/trending/products', {
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
