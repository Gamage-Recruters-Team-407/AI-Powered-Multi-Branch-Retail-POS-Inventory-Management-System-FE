import { createContext, useContext, useState, useMemo } from "react";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomersByBranch,
  addLoyaltyPoints as apiAddLoyaltyPoints,
} from "../services/customerApi";

const CustomerContext = createContext();

export const useCustomers = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers]             = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // GET ALL
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getAllCustomers();
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.customers)
        ? raw.customers
        : [];
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const addCustomer = async (data) => {
    const res = await createCustomer(data);
    await fetchCustomers();
    return res.data;
  };

  // UPDATE
  const editCustomer = async (id, data) => {
    const res = await updateCustomer(id, data);
    await fetchCustomers();
    return res.data;
  };

  // DELETE
  const removeCustomer = async (id) => {
    const res = await deleteCustomer(id);
    await fetchCustomers();
    return res.data;
  };

  // ADD LOYALTY POINTS
   // ADD LOYALTY POINTS
  const addLoyaltyPoints = async (customerId, amount) => {
    const res = await apiAddLoyaltyPoints(customerId, amount);
    await fetchCustomers();
    return res.data;
  };

  // SEARCH — supports optional branchId
  // If branchId is provided → GET /branch/:branchId?search=
  // Otherwise              → GET /?search=
  const searchCustomer = async (keyword = "", branchId = null) => {
    setLoading(true);
    try {
      let res;

      if (branchId && branchId !== "all") {
        res = await getCustomersByBranch(branchId, keyword);
      } else {
        res = await searchCustomers(keyword);
      }

      const raw  = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.customers)
        ? raw.customers
        : [];

      setCustomers(list);
      return list;
    } catch (err) {
      console.error("Search failed:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      customers,
      loading,
      selectedCustomer,
      setSelectedCustomer,
      fetchCustomers,
      addCustomer,
      editCustomer,
      removeCustomer,
      searchCustomer,
      addLoyaltyPoints,
    }),
    [customers, loading, selectedCustomer]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};