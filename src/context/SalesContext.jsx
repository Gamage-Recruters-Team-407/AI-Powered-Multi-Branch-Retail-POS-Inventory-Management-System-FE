import { createContext, useContext, useState } from "react";

const SalesContext = createContext();
export const useSales = () => useContext(SalesContext);

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);

  const addSale = (sale) => {
    setSales((prev) => [sale, ...prev]);
  };

  const removeSale = (id) => {
    setSales((prev) => prev.filter((s) => s._id !== id && s.id !== id));
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, removeSale }}>
      {children}
    </SalesContext.Provider>
  );
};
