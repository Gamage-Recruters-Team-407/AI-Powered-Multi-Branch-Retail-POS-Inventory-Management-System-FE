import { useEffect } from "react";
import { useInventory } from "../context/InventoryContext";
import { socketService } from "../services/socketService";

export const useInventorySocket = (selectedBranch = "", lowStockOnly = false) => {
  const { refreshAll } = useInventory();

  useEffect(() => {
    // Socket connect status is managed globally or by Dashboard, 
    // but we can register specific listeners here.
    const handleStockUpdate = (data) => {
      console.log("📝 Socket event received: stockUpdated", data);
      // Trigger a context refresh when stock is updated
      refreshAll(selectedBranch, lowStockOnly);
    };

    const handleLowStockAlert = (data) => {
      console.log("⚠️ Socket event received: lowStockAlert", data);
      // Trigger a context refresh when a low stock alert fires
      refreshAll(selectedBranch, lowStockOnly);
    };

    // Attach listeners
    socketService.on("stockUpdated", handleStockUpdate);
    socketService.on("lowStockAlert", handleLowStockAlert);

    return () => {
      // Detach listeners on cleanup
      socketService.off("stockUpdated", handleStockUpdate);
      socketService.off("lowStockAlert", handleLowStockAlert);
    };
  }, [refreshAll, selectedBranch, lowStockOnly]);
};

export default useInventorySocket;
