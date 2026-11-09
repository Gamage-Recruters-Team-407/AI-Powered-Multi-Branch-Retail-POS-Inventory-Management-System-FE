import { createContext, useContext, useState, useMemo } from "react";
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  searchBranches,
} from "../services/branchApi";

const BranchContext = createContext();
export const useBranches = () => useContext(BranchContext);

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Load all branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await getAllBranches();
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.branches)
            ? raw.branches
            : [];
      setBranches(list);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create branch
  const addBranch = async (data) => {
    const res = await createBranch(data);
    await fetchBranches();
    return res.data;
  };

  // Update branch
  const editBranch = async (id, data) => {
    const res = await updateBranch(id, data);
    await fetchBranches();
    return res.data;
  };

  // Delete branch
  const removeBranch = async (id) => {
    const res = await deleteBranch(id);
    await fetchBranches();
    return res.data;
  };

  // Search branch
  const searchBranch = async (keyword) => {
    setLoading(true);
    try {
      const res = await searchBranches(keyword);
      setBranches(res.data || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      branches,
      loading,
      selectedBranch,
      setSelectedBranch,
      fetchBranches,
      addBranch,
      editBranch,
      removeBranch,
      searchBranch,
    }),
    [branches, loading, selectedBranch]
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};