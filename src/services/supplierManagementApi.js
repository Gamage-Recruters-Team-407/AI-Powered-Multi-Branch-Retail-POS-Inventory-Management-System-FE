import axios from "axios";

const SUPPLIER_API_URL = import.meta.env.VITE_RETAIL_POS_SUPPLIER_API_URL;

const supplierManagementApi = axios.create({
  baseURL: SUPPLIER_API_URL,
});

export const getAllSuppliers = () => {
  return supplierManagementApi.get("/");
};