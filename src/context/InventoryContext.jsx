import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as inventoryService from "../services/inventoryService";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { logout } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    totalStockValue: 0,
    totalUniqueItems: 0,
    totalQuantity: 0,
    lowStockCount: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiError = useCallback((err, contextMessage) => {
    console.error(`Error in ${contextMessage}:`, err);
    if (err.response && err.response.status === 401) {
      setError("Session expired. Logging out...");
      logout();
    } else {
      setError(err.message || `Failed to perform action: ${contextMessage}`);
    }
  }, [logout]);

  const fetchInventory = useCallback(async (branchId = "", lowStock = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getInventory(branchId, lowStock);
      if (res.success) {
        setInventory(res.data);
        if (res.warning) {
          setError(res.warning);
        }
      } else {
        throw new Error(res.error || "Failed to load inventory");
      }
    } catch (err) {
      handleApiError(err, "fetching inventory");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const fetchSummary = useCallback(async () => {
    setError(null);
    try {
      const res = await inventoryService.getInventorySummary();
      if (res.success) {
        setSummary(res.data);
        if (res.warning) {
          setError(res.warning);
        }
      } else {
        throw new Error(res.error || "Failed to load inventory summary");
      }
    } catch (err) {
      handleApiError(err, "fetching summary data");
    }
  }, [handleApiError]);

  const fetchAlerts = useCallback(async () => {
    setError(null);
    try {
      const res = await inventoryService.getLowStockAlerts();
      if (res.success) {
        setAlerts(res.data);
        if (res.warning) {
          setError(res.warning);
        }
      } else {
        throw new Error(res.error || "Failed to load stock alerts");
      }
    } catch (err) {
      handleApiError(err, "fetching low-stock alerts");
    }
  }, [handleApiError]);

  const fetchHistory = useCallback(async (inventoryId = "", branchId = "", startDate = "", endDate = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getMovementHistory(inventoryId, branchId, startDate, endDate);
      if (res.success) {
        setHistory(res.data);
        if (res.warning) {
          setError(res.warning);
        }
        return res.data;
      } else {
        throw new Error(res.error || "Failed to load movement logs");
      }
    } catch (err) {
      handleApiError(err, "fetching inventory history");
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const refreshAll = useCallback(async (branchId = "", lowStock = false) => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchInventory(branchId, lowStock),
        fetchSummary(),
        fetchAlerts()
      ]);
    } catch (err) {
      console.error("Error refreshing inventory context data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchInventory, fetchSummary, fetchAlerts]);

  const value = {
    inventory,
    summary,
    alerts,
    history,
    loading,
    error,
    fetchInventory,
    fetchSummary,
    fetchAlerts,
    fetchHistory,
    refreshAll,
    setError
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};

export default InventoryContext;
