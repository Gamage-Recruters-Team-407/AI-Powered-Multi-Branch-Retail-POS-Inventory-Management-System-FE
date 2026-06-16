import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = apiHost.endsWith("/api")
  ? apiHost
  : `${apiHost.replace(/\/$/, "")}/api`;

const inventoryApi = axios.create({
  baseURL: `${API_BASE_URL}/inventory`,
  timeout: 5000,
});

// Attach JWT token automatically
inventoryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fallback handlers
const handleRequest = async (apiCall, fallbackFn) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn("Inventory API call failed, falling back to Mock Data:", error.message);
    const is401 = error.response && error.response.status === 401;
    const warningMsg = is401 
      ? "Session expired or invalid token (using mock data)" 
      : error.message || "Connection failed";
    return { 
      data: fallbackFn(), 
      isMock: true, 
      success: true, 
      warning: warningMsg 
    };
  }
};

// Initial Mock Datasets
const MOCK_SUMMARY = {
  totalStockValue: 154800.50,
  totalUniqueItems: 5,
  totalQuantity: 2450,
  lowStockCount: 2
};

const MOCK_ALERTS = [
  {
    _id: "inv_alert_1",
    product: { _id: "prod_1", name: "Organic Coconut Oil", reorderLevel: 50 },
    branch: { _id: "1", name: "Colombo Head Office" },
    quantity: 23,
    lowStockAlert: true
  },
  {
    _id: "inv_alert_2",
    product: { _id: "prod_2", name: "Premium Basmati Rice", reorderLevel: 80 },
    branch: { _id: "1", name: "Colombo Head Office" },
    quantity: 50,
    lowStockAlert: true
  }
];

const MOCK_INVENTORY = [
  {
    _id: "inv_1",
    product: { _id: "prod_1", name: "Organic Coconut Oil", reorderLevel: 50, costPrice: 4.5 },
    branch: { _id: "1", name: "Colombo Head Office" },
    quantity: 23,
    lowStockAlert: true
  },
  {
    _id: "inv_2",
    product: { _id: "prod_2", name: "Premium Basmati Rice", reorderLevel: 80, costPrice: 2.2 },
    branch: { _id: "1", name: "Colombo Head Office" },
    quantity: 50,
    lowStockAlert: true
  },
  {
    _id: "inv_3",
    product: { _id: "prod_3", name: "Ceylon Tea Gift Pack", reorderLevel: 20, costPrice: 12.0 },
    branch: { _id: "1", name: "Colombo Head Office" },
    quantity: 120,
    lowStockAlert: false
  },
  {
    _id: "inv_4",
    product: { _id: "prod_4", name: "Fresh Milk (1L)", reorderLevel: 40, costPrice: 1.8 },
    branch: { _id: "2", name: "Kandy City Branch" },
    quantity: 15,
    lowStockAlert: true
  },
  {
    _id: "inv_5",
    product: { _id: "prod_5", name: "Spice Assortment Pack", reorderLevel: 30, costPrice: 6.0 },
    branch: { _id: "3", name: "Galle Fort Branch" },
    quantity: 85,
    lowStockAlert: false
  }
];

const MOCK_HISTORY = [
  {
    _id: "hist_1",
    createdAt: "2026-06-02T14:50:00.000Z",
    type: "sale",
    quantityChange: -10,
    reason: "Retail POS transaction checkout",
    user: { firstName: "Kasun", lastName: "Jayawardena", email: "kasun.j@pos.com" }
  },
  {
    _id: "hist_2",
    createdAt: "2026-06-01T09:15:00.000Z",
    type: "purchase",
    quantityChange: 100,
    reason: "Supplier shipment restock PO-2026-1046",
    user: { firstName: "Nimal", lastName: "Perera", email: "nimal.p@pos.com" }
  },
  {
    _id: "hist_3",
    createdAt: "2026-05-28T16:30:00.000Z",
    type: "return",
    quantityChange: 1,
    reason: "Customer return - defective write-off",
    user: { firstName: "Kasun", lastName: "Jayawardena", email: "kasun.j@pos.com" }
  },
  {
    _id: "hist_4",
    createdAt: "2026-05-25T11:00:00.000Z",
    type: "adjustment",
    quantityChange: -5,
    reason: "Stock audit discrepancy correction",
    user: { firstName: "Amara", lastName: "Dias", email: "amara.d@pos.com" }
  }
];

const MOCK_BRANCHES = [
  { _id: "1", name: "Colombo Head Office" },
  { _id: "2", name: "Kandy City Branch" },
  { _id: "3", name: "Galle Fort Branch" },
  { _id: "4", name: "Negombo Branch" }
];

export const getInventory = (branchId = "", lowStock = false) => {
  return handleRequest(
    () => inventoryApi.get("/", { params: { branch: branchId || undefined, lowStock: lowStock ? "true" : undefined } }),
    () => {
      let filtered = [...MOCK_INVENTORY];
      if (branchId) {
        filtered = filtered.filter(item => item.branch._id === branchId);
      }
      if (lowStock) {
        filtered = filtered.filter(item => item.lowStockAlert);
      }
      return filtered;
    }
  );
};

export const getInventorySummary = () => {
  return handleRequest(
    () => inventoryApi.get("/summary"),
    () => MOCK_SUMMARY
  );
};

export const getLowStockAlerts = () => {
  return handleRequest(
    () => inventoryApi.get("/alerts"),
    () => MOCK_ALERTS
  );
};

export const getMovementHistory = (inventoryId = "", branchId = "", startDate = "", endDate = "") => {
  return handleRequest(
    () => inventoryApi.get("/history", {
      params: {
        inventoryId: inventoryId || undefined,
        branchId: branchId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }
    }),
    () => {
      let filtered = [...MOCK_HISTORY];
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(item => new Date(item.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(item => new Date(item.createdAt) <= end);
      }
      return filtered;
    }
  );
};

export const getBranches = () => {
  return axios.get(`${API_BASE_URL}/branches`)
    .then(res => res.data)
    .catch(() => ({ data: MOCK_BRANCHES, success: true }));
};
