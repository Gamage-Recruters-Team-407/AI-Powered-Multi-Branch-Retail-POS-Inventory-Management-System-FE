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
      data: await fallbackFn(), 
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
    quantity: 49,
    lowStockAlert: true
  }
];

const MOCK_INVENTORY = [
  {
    _id: "inv_1",
    product: { _id: "prod_1", name: "Organic Coconut Oil", reorderLevel: 50, costPrice: 4.5 },
    branch: { _id: "6a1fece6983e24ace0ffcd88", name: "Main HQ" },
    quantity: 23,
    lowStockAlert: true
  },
  {
    _id: "inv_2",
    product: { _id: "prod_2", name: "Premium Basmati Rice", reorderLevel: 80, costPrice: 2.2 },
    branch: { _id: "6a21c977a35d66a48d86876c", name: "Branch Alpha" },
    quantity: 50,
    lowStockAlert: false
  },
  {
    _id: "inv_3",
    product: { _id: "prod_3", name: "Ceylon Tea Gift Pack", reorderLevel: 20, costPrice: 12.0 },
    branch: { _id: "6a21c977a35d66a48d86876c", name: "Branch Alpha" },
    quantity: 120,
    lowStockAlert: false
  },
  {
    _id: "inv_4",
    product: { _id: "prod_4", name: "Fresh Milk (1L)", reorderLevel: 40, costPrice: 1.8 },
    branch: { _id: "6a21c977a35d66a48d86876d", name: "Branch Beta" },
    quantity: 15,
    lowStockAlert: true
  },
  {
    _id: "inv_5",
    product: { _id: "prod_5", name: "Spice Assortment Pack", reorderLevel: 30, costPrice: 6.0 },
    branch: { _id: "6a2262089540b4850c3230e8", name: "homagama" },
    quantity: 85,
    lowStockAlert: false
  },
  {
    _id: "inv_6",
    product: { _id: "prod_1", name: "Organic Coconut Oil", reorderLevel: 50, costPrice: 4.5 },
    branch: { _id: "6a22d102f805ca0e7b28759b", name: "kottawa" },
    quantity: 60,
    lowStockAlert: false
  },
  {
    _id: "inv_7",
    product: { _id: "prod_3", name: "Ceylon Tea Gift Pack", reorderLevel: 20, costPrice: 12.0 },
    branch: { _id: "6a23e7941058daad8dae4816", name: "kaluthara" },
    quantity: 18,
    lowStockAlert: true
  },
  {
    _id: "inv_8",
    product: { _id: "prod_2", name: "Premium Basmati Rice", reorderLevel: 80, costPrice: 2.2 },
    branch: { _id: "6a23f188fc96c21cc1a583ee", name: "Anuradhapura" },
    quantity: 90,
    lowStockAlert: false
  },
  {
    _id: "inv_9",
    product: { _id: "prod_4", name: "Fresh Milk (1L)", reorderLevel: 40, costPrice: 1.8 },
    branch: { _id: "6a32402c243e791734f47647", name: "Ampara" },
    quantity: 12,
    lowStockAlert: true
  },
  {
    _id: "inv_10",
    product: { _id: "prod_5", name: "Spice Assortment Pack", reorderLevel: 30, costPrice: 6.0 },
    branch: { _id: "6a33dfa5d34cf228f042aa0e", name: "gampaha" },
    quantity: 75,
    lowStockAlert: false
  },
  {
    _id: "inv_11",
    product: { _id: "prod_1", name: "Organic Coconut Oil", reorderLevel: 50, costPrice: 4.5 },
    branch: { _id: "6a351e5062bd3a427e9d60ab", name: "Panadura" },
    quantity: 8,
    lowStockAlert: true
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
  { _id: "6a1fece6983e24ace0ffcd88", name: "Main HQ", code: "BR-HQ", city: "Colombo" },
  { _id: "6a21c977a35d66a48d86876c", name: "Branch Alpha", code: "BR-A", city: "Colombo" },
  { _id: "6a21c977a35d66a48d86876d", name: "Branch Beta", code: "BR-B", city: "Kandy" },
  { _id: "6a2262089540b4850c3230e8", name: "homagama", code: "HH-001", city: "homagama" },
  { _id: "6a22d102f805ca0e7b28759b", name: "kottawa", code: "KT-001", city: "kottawa" },
  { _id: "6a23e7941058daad8dae4816", name: "kaluthara", code: "K-001", city: "kaluthara" },
  { _id: "6a23f188fc96c21cc1a583ee", name: "Anuradhapura", code: "AP-001", city: "Anuradhapura" },
  { _id: "6a32402c243e791734f47647", name: "Ampara", code: "DT-0002", city: "kalmunai" },
  { _id: "6a33dfa5d34cf228f042aa0e", name: "gampaha", code: "gp-991", city: "gampaha" },
  { _id: "6a351e5062bd3a427e9d60ab", name: "Panadura", code: "PD-001", city: "Panadura" }
];

// Dynamic product-based inventory generator helper
const generateProductInventory = async () => {
  let branches = MOCK_BRANCHES;
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const branchRes = await axios.get(`${API_BASE_URL}/branches`, { headers });
    if (branchRes.data && branchRes.data.success) {
      branches = branchRes.data.data;
    }
  } catch (err) {
    console.warn("Failed to fetch branches, using fallback branches:", err.message);
  }

  const productRes = await axios.get(`${API_BASE_URL}/products/status/active`, { headers });
  const products = productRes.data?.products || [];

  const inventoryList = [];
  products.forEach(product => {
    const stockCount = Number(
      product.stock ??
      product.quantity ??
      product.availableStock ??
      product.reorderLevel ??
      0
    );

    branches.forEach(branch => {
      inventoryList.push({
        _id: `inv_${product._id}_${branch._id}`,
        product: {
          _id: product._id,
          name: product.name,
          reorderLevel: product.reorderLevel || 0,
          costPrice: product.costPrice || 0
        },
        branch: {
          _id: branch._id,
          name: branch.name
        },
        quantity: stockCount,
        lowStockAlert: stockCount < 50
      });
    });
  });

  return inventoryList;
};

export const getInventory = async (branchId = "", lowStock = false) => {
  return handleRequest(
    () => inventoryApi.get("/", {
      params: {
        branch: branchId || undefined,
        lowStock: lowStock ? "true" : undefined
      }
    }),
    async () => {
      try {
        const inventoryList = await generateProductInventory();
        let filtered = inventoryList;
        if (branchId) {
          filtered = filtered.filter(item => item.branch._id === branchId);
        }
        if (lowStock) {
          filtered = filtered.filter(item => item.lowStockAlert);
        }
        return filtered;
      } catch (error) {
        console.error("Failed to generate product-based inventory list:", error.message);
        let filtered = [...MOCK_INVENTORY];
        if (branchId) {
          filtered = filtered.filter(item => item.branch._id === branchId);
        }
        if (lowStock) {
          filtered = filtered.filter(item => item.lowStockAlert);
        }
        return filtered;
      }
    }
  );
};

export const getInventorySummary = async () => {
  return handleRequest(
    () => inventoryApi.get("/summary"),
    async () => {
      try {
        const inventoryList = await generateProductInventory();
        const uniqueProducts = new Set();
        let totalStockValue = 0;
        let totalQuantity = 0;
        let lowStockCount = 0;

        inventoryList.forEach(item => {
          uniqueProducts.add(item.product._id);
          totalStockValue += item.quantity * (item.product.costPrice || 0);
          totalQuantity += item.quantity;
          if (item.lowStockAlert) {
            lowStockCount++;
          }
        });

        return {
          totalStockValue,
          totalUniqueItems: uniqueProducts.size,
          totalQuantity,
          lowStockCount
        };
      } catch (error) {
        console.error("Failed to compute inventory summary:", error.message);
        return MOCK_SUMMARY;
      }
    }
  );
};

export const getLowStockAlerts = async () => {
  return handleRequest(
    () => inventoryApi.get("/alerts"),
    async () => {
      try {
        const inventoryList = await generateProductInventory();
        return inventoryList.filter(item => item.lowStockAlert);
      } catch (error) {
        console.error("Failed to fetch low stock alerts:", error.message);
        return MOCK_ALERTS;
      }
    }
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
