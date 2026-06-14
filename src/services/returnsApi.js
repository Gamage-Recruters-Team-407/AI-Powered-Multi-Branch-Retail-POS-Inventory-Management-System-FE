import api from "../api/axiosInstance"; 

const returnsApi = {
  getInvoices: async () => {
    // ✅ Correct: No /api prefix
    const response = await api.get("/returns/invoices");
    return response.data;
  },

  getInvoiceById: async (invoiceId) => {
    const response = await api.get(`/returns/invoices/${invoiceId}`);
    return response.data;
  },

  getReturns: async () => {
    const response = await api.get("/returns");
    return response.data;
  },

  createReturn: async (returnData) => {
    const response = await api.post("/returns", returnData);
    return response.data;
  },

  updateReturnStatus: async (id, status) => {
    const response = await api.patch(`/returns/${id}/status`, { status });
    return response.data;
  },
};

export const getInvoices = returnsApi.getInvoices;
export const getInvoiceById = returnsApi.getInvoiceById;
export const getReturns = returnsApi.getReturns;
export const createReturn = returnsApi.createReturn;
export const updateReturnStatus = returnsApi.updateReturnStatus;

export default returnsApi;