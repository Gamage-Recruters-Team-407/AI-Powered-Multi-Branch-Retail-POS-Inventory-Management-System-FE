import axios from "axios";

const SUPPLIER_API_URL = import.meta.env.VITE_RETAIL_POS_SUPPLIER_API_URL || "http://localhost:5000/api/suppliers";

const supplierApi = axios.create({
  baseURL: SUPPLIER_API_URL,
  timeout: 5000,
});

// Attach token
supplierApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to determine if we should fallback to localStorage/mock data
const handleRequest = async (apiCall, fallbackFn) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn("Supplier API call failed, falling back to LocalStorage/Mock Data:", error.message);
    return fallbackFn();
  }
};

// Initial Mock Suppliers Data (with Contract embedded schema)
const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-001',
    _id: 'SUP-001',
    companyName: 'Lanka Grains & Co.',
    contactPerson: 'Sunil Perera',
    email: 'sunil@lankagrains.com',
    phone: '+94 77 123 4567',
    address: '142, Kandy Road, Colombo 10',
    category: 'Grains & Rice',
    status: 'Active',
    rating: 4.8,
    totalSpend: 42500,
    performance: {
      onTimeDelivery: 98,
      qualityScore: 97,
      leadTimeDays: 3,
      returnRate: 0.5
    },
    aiRecommendation: 'Excellent performance. Highly recommended to renew contract.',
    contract: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      terms: 'Supply of premium grains & rice with fixed quarterly pricing.',
      paymentTerms: 'Net 30',
      sla: 'Deliver within 3 days of PO approval.'
    },
    transactions: [
      { id: 'PO-2026-104', date: '2026-05-18', amount: 12500, itemsCount: 250, status: 'Delivered' },
      { id: 'PO-2026-092', date: '2026-04-12', amount: 18000, itemsCount: 360, status: 'Delivered' },
      { id: 'PO-2026-081', date: '2026-03-05', amount: 12000, itemsCount: 240, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-002',
    _id: 'SUP-002',
    companyName: 'Ceylon Tea Estates Ltd.',
    contactPerson: 'Menaka Silva',
    email: 'menaka@ceylontea.lk',
    phone: '+94 81 765 4321',
    address: '77, Nuwara Eliya Road, Nuwara Eliya',
    category: 'Beverages',
    status: 'Active',
    rating: 4.5,
    totalSpend: 28400,
    performance: {
      onTimeDelivery: 92,
      qualityScore: 96,
      leadTimeDays: 5,
      returnRate: 1.2
    },
    aiRecommendation: 'Excellent performance. Highly recommended to renew contract.',
    contract: {
      startDate: '2026-02-15',
      endDate: '2027-02-15',
      status: 'Active',
      terms: 'Supply of loose leaf tea grades and BOPF bags.',
      paymentTerms: 'Net 30',
      sla: 'Standard lead time is 5 business days.'
    },
    transactions: [
      { id: 'PO-2026-110', date: '2026-05-28', amount: 9500, itemsCount: 150, status: 'Pending' },
      { id: 'PO-2026-099', date: '2026-04-20', amount: 9500, itemsCount: 150, status: 'Delivered' },
      { id: 'PO-2026-085', date: '2026-03-15', amount: 9400, itemsCount: 145, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-003',
    _id: 'SUP-003',
    companyName: 'RichDairy Lanka Pvt Ltd.',
    contactPerson: 'Anura De Alwis',
    email: 'anura@richdairy.lk',
    phone: '+94 11 888 9900',
    address: '56/B, Industrial Zone, Negombo',
    category: 'Dairy Products',
    status: 'Active',
    rating: 4.9,
    totalSpend: 54100,
    performance: {
      onTimeDelivery: 99,
      qualityScore: 99,
      leadTimeDays: 1,
      returnRate: 0.2
    },
    aiRecommendation: 'Excellent performance. Highly recommended to renew contract.',
    contract: {
      startDate: '2026-03-01',
      endDate: '2027-03-01',
      status: 'Active',
      terms: 'Daily supply of fresh pasteurized milk and processed dairy.',
      paymentTerms: 'COD',
      sla: 'Must deliver within 24 hours of ordering.'
    },
    transactions: [
      { id: 'PO-2026-115', date: '2026-06-01', amount: 4800, itemsCount: 80, status: 'Pending' },
      { id: 'PO-2026-105', date: '2026-05-20', amount: 16500, itemsCount: 300, status: 'Delivered' },
      { id: 'PO-2026-098', date: '2026-04-29', amount: 16400, itemsCount: 295, status: 'Delivered' },
      { id: 'PO-2026-089', date: '2026-03-25', amount: 16400, itemsCount: 295, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-004',
    _id: 'SUP-004',
    companyName: 'Spices of Serendib',
    contactPerson: 'Fathima Nazreen',
    email: 'fathima@spiceserendib.com',
    phone: '+94 77 999 8888',
    address: '22, Galle Road, Matara',
    category: 'Spices & Condiments',
    status: 'Under Review',
    rating: 3.9,
    totalSpend: 15200,
    performance: {
      onTimeDelivery: 81,
      qualityScore: 91,
      leadTimeDays: 7,
      returnRate: 3.5
    },
    aiRecommendation: 'Stable performance. Standard operations recommended.',
    contract: {
      startDate: '2026-04-01',
      endDate: '2027-04-01',
      status: 'Under Negotiation',
      terms: 'Supply of packaged cinnamon, pepper, and cardamom packs.',
      paymentTerms: 'Net 60',
      sla: 'Sufficient packaging protection to prevent moisture.'
    },
    transactions: [
      { id: 'PO-2026-102', date: '2026-05-14', amount: 5200, itemsCount: 100, status: 'Delivered' },
      { id: 'PO-2026-090', date: '2026-04-10', amount: 10000, itemsCount: 200, status: 'Delivered' }
    ]
  },
  {
    id: 'SUP-005',
    _id: 'SUP-005',
    companyName: 'Apex Packaging Industries',
    contactPerson: 'Rohan Wickremasinghe',
    email: 'rohan@apexpack.lk',
    phone: '+94 11 555 4444',
    address: '89, Avissawella Road, Wellampitiya',
    category: 'Packaging Materials',
    status: 'Inactive',
    rating: 3.2,
    totalSpend: 12000,
    performance: {
      onTimeDelivery: 75,
      qualityScore: 84,
      leadTimeDays: 10,
      returnRate: 4.8
    },
    aiRecommendation: 'Warning: Slow delivery times. Recommend discussing lead times with supplier.',
    contract: {
      startDate: '2025-05-01',
      endDate: '2026-05-01',
      status: 'Expired',
      terms: 'Supply of printed paper bags and cardboard cartons.',
      paymentTerms: 'Net 30',
      sla: 'Standard lead time is 7 days.'
    },
    transactions: [
      { id: 'PO-2026-060', date: '2026-01-15', amount: 12000, itemsCount: 400, status: 'Delivered' }
    ]
  }
];

// Initialize localStorage databases if not present
const getLocalStorageDb = (key, initialData) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialData;
  }
};

const setLocalStorageDb = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getMockSuppliers = () => getLocalStorageDb("pos_suppliers", INITIAL_SUPPLIERS);

// CRUD Mock Fallbacks
const fallbackGetAllSuppliers = (search = "", category = "", status = "") => {
  const sups = getMockSuppliers();
  let result = [...sups];

  if (search) {
    const query = search.toLowerCase();
    result = result.filter(
      s =>
        s.companyName.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.toLowerCase().includes(query)
    );
  }

  if (category) {
    result = result.filter(s => s.category === category);
  }

  if (status) {
    result = result.filter(s => s.status === status);
  }

  return { success: true, count: result.length, data: result };
};

const fallbackGetSupplier = (id) => {
  const sups = getMockSuppliers();
  const supplier = sups.find(s => s.id === id || s._id === id);
  if (!supplier) {
    return { success: false, message: "Supplier not found" };
  }
  return { success: true, data: supplier };
};

const fallbackCreateSupplier = (data) => {
  const sups = getMockSuppliers();
  const newId = `SUP-0${sups.length + 1}`;
  const newSupplier = {
    id: newId,
    _id: newId,
    totalSpend: 0,
    transactions: [],
    aiRecommendation: "Stable performance. Standard operations recommended.",
    performance: {
      onTimeDelivery: 95,
      qualityScore: 95,
      leadTimeDays: 3,
      returnRate: 0.0
    },
    contract: {
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: "Under Negotiation",
      terms: "",
      paymentTerms: "Net 30",
      sla: ""
    },
    ...data
  };
  sups.push(newSupplier);
  setLocalStorageDb("pos_suppliers", sups);
  return { success: true, message: "Supplier created", data: newSupplier };
};

const fallbackUpdateSupplier = (id, data) => {
  const sups = getMockSuppliers();
  const idx = sups.findIndex(s => s.id === id || s._id === id);
  if (idx !== -1) {
    sups[idx] = { ...sups[idx], ...data };
    setLocalStorageDb("pos_suppliers", sups);
    return { success: true, message: "Supplier updated", data: sups[idx] };
  }
  return { success: false, message: "Supplier not found" };
};

const fallbackDeleteSupplier = (id) => {
  const sups = getMockSuppliers();
  const filtered = sups.filter(s => s.id !== id && s._id !== id);
  setLocalStorageDb("pos_suppliers", filtered);
  return { success: true, message: "Supplier deleted" };
};

// Contract Fallbacks
const fallbackGetContract = (id) => {
  const res = fallbackGetSupplier(id);
  if (res.success) {
    return { success: true, data: res.data.contract || {} };
  }
  return res;
};

const fallbackUpdateContract = (id, contractData) => {
  const sups = getMockSuppliers();
  const idx = sups.findIndex(s => s.id === id || s._id === id);
  if (idx !== -1) {
    sups[idx].contract = {
      ...(sups[idx].contract || {}),
      ...contractData
    };
    setLocalStorageDb("pos_suppliers", sups);
    return { success: true, message: "Contract updated successfully", data: sups[idx].contract };
  }
  return { success: false, message: "Supplier not found" };
};

// Transactions Fallback
const fallbackAddTransaction = (id, transactionData) => {
  const sups = getMockSuppliers();
  const idx = sups.findIndex(s => s.id === id || s._id === id);
  if (idx !== -1) {
    const supplier = sups[idx];
    if (!supplier.transactions) {
      supplier.transactions = [];
    }
    supplier.transactions.push(transactionData);

    if (transactionData.status === "Delivered") {
      supplier.totalSpend = (supplier.totalSpend || 0) + Number(transactionData.amount || 0);
    }

    const total = supplier.transactions.length;
    const delivered = supplier.transactions.filter(t => t.status === "Delivered").length;
    const cancelled = supplier.transactions.filter(t => t.status === "Cancelled").length;

    supplier.performance.returnRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0.0;
    supplier.performance.onTimeDelivery = total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 95;

    // AI recommendation updates
    let recommendation = "Stable performance. Standard operations recommended.";
    const rating = supplier.rating || 5.0;
    const onTime = supplier.performance.onTimeDelivery;
    const retRate = supplier.performance.returnRate;
    const quality = supplier.performance.qualityScore || 95;
    const leadTime = supplier.performance.leadTimeDays || 3;

    if (rating >= 4.5 && onTime >= 90) {
      recommendation = "Excellent performance. Highly recommended to renew contract.";
    } else if (retRate > 10 || quality < 80) {
      recommendation = "Caution: High return rate or low quality. Consider auditing quality processes.";
    } else if (onTime < 80 || leadTime > 5) {
      recommendation = "Warning: Slow delivery times. Recommend discussing lead times with supplier.";
    }
    supplier.aiRecommendation = recommendation;

    setLocalStorageDb("pos_suppliers", sups);
    return { success: true, message: "Transaction added successfully", data: supplier };
  }
  return { success: false, message: "Supplier not found" };
};

const fallbackUpdateTransactionStatus = (supplierId, transactionId, status) => {
  const sups = getMockSuppliers();
  const idx = sups.findIndex(s => s.id === supplierId || s._id === supplierId);
  if (idx !== -1) {
    const supplier = sups[idx];
    if (supplier.transactions) {
      const tIdx = supplier.transactions.findIndex(t => t.id === transactionId);
      if (tIdx !== -1) {
        const oldStatus = supplier.transactions[tIdx].status;
        supplier.transactions[tIdx].status = status;

        const amount = Number(supplier.transactions[tIdx].amount || 0);
        if (oldStatus !== "Delivered" && status === "Delivered") {
          supplier.totalSpend = (supplier.totalSpend || 0) + amount;
        } else if (oldStatus === "Delivered" && status !== "Delivered") {
          supplier.totalSpend = Math.max(0, (supplier.totalSpend || 0) - amount);
        }

        const total = supplier.transactions.length;
        const delivered = supplier.transactions.filter(t => t.status === "Delivered").length;
        const cancelled = supplier.transactions.filter(t => t.status === "Cancelled").length;

        supplier.performance.returnRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0.0;
        supplier.performance.onTimeDelivery = total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 95;

        let recommendation = "Stable performance. Standard operations recommended.";
        const rating = supplier.rating || 5.0;
        const onTime = supplier.performance.onTimeDelivery;
        const retRate = supplier.performance.returnRate;
        const quality = supplier.performance.qualityScore || 95;
        const leadTime = supplier.performance.leadTimeDays || 3;

        if (rating >= 4.5 && onTime >= 90) {
          recommendation = "Excellent performance. Highly recommended to renew contract.";
        } else if (retRate > 10 || quality < 80) {
          recommendation = "Caution: High return rate or low quality. Consider auditing quality processes.";
        } else if (onTime < 80 || leadTime > 5) {
          recommendation = "Warning: Slow delivery times. Recommend discussing lead times with supplier.";
        }
        supplier.aiRecommendation = recommendation;

        setLocalStorageDb("pos_suppliers", sups);
        return { success: true, message: "Transaction status updated", data: supplier };
      }
    }
  }
  return { success: false, message: "Supplier or transaction not found" };
};

const fallbackGetProcurementHistory = (id) => {
  const sups = getMockSuppliers();
  const supplier = sups.find(s => s.id === id || s._id === id);
  if (!supplier) {
    return { success: false, message: "Supplier not found" };
  }

  const mappedTxns = (supplier.transactions || []).map(t => {
    const isPO = t.id.startsWith("PO-");
    return {
      id: t.id,
      date: t.date,
      itemsCount: t.itemsCount || 50,
      amount: t.amount,
      status: t.status,
      type: isPO ? "Purchase Order" : "Manual"
    };
  });

  const combined = mappedTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalAmount = combined.reduce((sum, t) => sum + (t.status === "Delivered" ? t.amount : 0), 0);
  
  const counts = combined.reduce((acc, t) => {
    if (t.status === "Delivered") acc.delivered++;
    else if (t.status === "Cancelled") acc.cancelled++;
    else acc.pending++;
    return acc;
  }, { delivered: 0, pending: 0, cancelled: 0 });

  return {
    success: true,
    data: {
      supplierId: id,
      companyName: supplier.companyName,
      totalSpend: totalAmount,
      metrics: {
        totalCount: combined.length,
        manualCount: combined.filter(c => c.type === "Manual").length,
        purchaseOrderCount: combined.filter(c => c.type === "Purchase Order").length,
        statusDistribution: counts
      },
      history: combined
    }
  };
};

// Reports Fallback
const fallbackGetAllPerformanceReports = () => {
  const sups = getMockSuppliers();
  const reports = sups.map(supplier => {
    let recommendation = supplier.aiRecommendation;
    if (!recommendation) {
      recommendation = "Stable performance. Standard operations recommended.";
      const rating = supplier.rating || 5.0;
      const onTime = supplier.performance?.onTimeDelivery || 95;
      const retRate = supplier.performance?.returnRate || 0;
      const quality = supplier.performance?.qualityScore || 95;
      const leadTime = supplier.performance?.leadTimeDays || 3;

      if (rating >= 4.5 && onTime >= 90) {
        recommendation = "Excellent performance. Highly recommended to renew contract.";
      } else if (retRate > 10 || quality < 80) {
        recommendation = "Caution: High return rate or low quality. Consider auditing quality processes.";
      } else if (onTime < 80 || leadTime > 5) {
        recommendation = "Warning: Slow delivery times. Recommend discussing lead times with supplier.";
      }
    }
    return {
      id: supplier.id || supplier._id,
      companyName: supplier.companyName,
      category: supplier.category,
      rating: supplier.rating,
      status: supplier.status,
      totalSpend: supplier.totalSpend,
      performance: supplier.performance || {},
      contractStatus: supplier.contract?.status || "Under Negotiation",
      contractEndDate: supplier.contract?.endDate || null,
      aiRecommendation: recommendation
    };
  });
  return { success: true, count: reports.length, data: reports };
};

const fallbackGetDetailedPerformance = (id) => {
  const sups = getMockSuppliers();
  const supplier = sups.find(s => s.id === id || s._id === id);
  if (!supplier) {
    return { success: false, message: "Supplier not found" };
  }

  const historyData = fallbackGetProcurementHistory(id).data;

  let recommendation = supplier.aiRecommendation;
  if (!recommendation) {
    recommendation = "Stable performance. Standard operations recommended.";
    const rating = supplier.rating || 5.0;
    const onTime = supplier.performance?.onTimeDelivery || 95;
    const retRate = supplier.performance?.returnRate || 0;
    const quality = supplier.performance?.qualityScore || 95;
    const leadTime = supplier.performance?.leadTimeDays || 3;

    if (rating >= 4.5 && onTime >= 90) {
      recommendation = "Excellent performance. Highly recommended to renew contract.";
    } else if (retRate > 10 || quality < 80) {
      recommendation = "Caution: High return rate or low quality. Consider auditing quality processes.";
    } else if (onTime < 80 || leadTime > 5) {
      recommendation = "Warning: Slow delivery times. Recommend discussing lead times with supplier.";
    }
  }

  return {
    success: true,
    data: {
      supplier: {
        id: supplier.id || supplier._id,
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        status: supplier.status,
        rating: supplier.rating,
        category: supplier.category
      },
      contract: supplier.contract || {},
      performance: supplier.performance || {},
      metrics: {
        totalSpend: historyData ? historyData.totalSpend : supplier.totalSpend,
        transactionCount: historyData ? historyData.metrics.totalCount : 0,
        purchaseOrderCount: historyData ? historyData.metrics.purchaseOrderCount : 0,
        manualTransactionCount: historyData ? historyData.metrics.manualCount : 0,
        statusDistribution: historyData ? historyData.metrics.statusDistribution : { delivered: 0, pending: 0, cancelled: 0 }
      },
      aiRecommendation: recommendation
    }
  };
};

// API Exports
export const getAllSuppliers = (search, category, status) => {
  return handleRequest(
    () => supplierApi.get("/", { params: { search, category, status } }),
    () => fallbackGetAllSuppliers(search, category, status)
  );
};

export const getSupplierById = (id) => {
  return handleRequest(
    () => supplierApi.get(`/${id}`),
    () => fallbackGetSupplier(id)
  );
};

export const addSupplier = (supplierData) => {
  return handleRequest(
    () => supplierApi.post("/", supplierData),
    () => fallbackCreateSupplier(supplierData)
  );
};

export const updateSupplier = (id, supplierData) => {
  return handleRequest(
    () => supplierApi.put(`/${id}`, supplierData),
    () => fallbackUpdateSupplier(id, supplierData)
  );
};

export const deleteSupplier = (id) => {
  return handleRequest(
    () => supplierApi.delete(`/${id}`),
    () => fallbackDeleteSupplier(id)
  );
};

export const getContract = (id) => {
  return handleRequest(
    () => supplierApi.get(`/${id}/contract`),
    () => fallbackGetContract(id)
  );
};

export const updateContract = (id, contractData) => {
  return handleRequest(
    () => supplierApi.put(`/${id}/contract`, contractData),
    () => fallbackUpdateContract(id, contractData)
  );
};

export const addTransaction = (id, transactionData) => {
  return handleRequest(
    () => supplierApi.post(`/${id}/transactions`, transactionData),
    () => fallbackAddTransaction(id, transactionData)
  );
};

export const getProcurementHistory = (id) => {
  return handleRequest(
    () => supplierApi.get(`/${id}/procurement`),
    () => fallbackGetProcurementHistory(id)
  );
};

export const getPerformanceReports = () => {
  return handleRequest(
    () => supplierApi.get("/reports/performance"),
    () => fallbackGetAllPerformanceReports()
  );
};

export const getDetailedPerformance = (id) => {
  return handleRequest(
    () => supplierApi.get(`/${id}/performance`),
    () => fallbackGetDetailedPerformance(id)
  );
};

export const updateTransactionStatus = (supplierId, transactionId, status) => {
  return handleRequest(
    () => supplierApi.patch(`/${supplierId}/transactions/${transactionId}`, { status }),
    () => fallbackUpdateTransactionStatus(supplierId, transactionId, status)
  );
};
