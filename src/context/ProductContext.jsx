import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance"; 

const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

const DEMO_PRODUCTS = [
  { _id: "65f8c2b3e4b0c12345678901", name: "Rice 1kg", price: 250, stock: 100, barcode: "10001", category: "Grains", isActive: true },
  { _id: "65f8c2b3e4b0c12345678902", name: "Sugar 1kg", price: 300, stock: 50, barcode: "10002", category: "Grains", isActive: true },
  { _id: "65f8c2b3e4b0c12345678903", name: "Milk Powder", price: 800, stock: 35, barcode: "10003", category: "Dairy", isActive: true },
  { _id: "65f8c2b3e4b0c12345678904", name: "Tea Pack 200g", price: 450, stock: 40, barcode: "10004", category: "Beverages", isActive: true },
  { _id: "65f8c2b3e4b0c12345678905", name: "Coconut Oil", price: 650, stock: 60, barcode: "10005", category: "Household", isActive: true },
  { _id: "65f8c2b3e4b0c12345678906", name: "Biscuits", price: 120, stock: 80, barcode: "10006", category: "Snacks", isActive: true },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProducts(DEMO_PRODUCTS);
      return;
    }

    setLoading(true);
    try {
      // ✅ Correct: No /api prefix because baseURL already has /api
      const response = await api.get("/inventory?limit=200");
      const raw = response.data?.data || response.data?.inventory || response.data || [];
      const items = Array.isArray(raw) ? raw : [];

      const mapped = items
        .map((item) => {
          const p = item.product || item;
          return {
            _id: p._id || item._id,
            name: p.name,
            barcode: p.barcode,
            price: p.price ?? p.sellingPrice ?? 0,
            image: p.image,
            isActive: p.isActive !== false,
            category: p.category?.name || p.category || "Other",
            stock: item.quantity ?? item.stock ?? p.stock ?? 0,
          };
        })
        .filter((p) => p.name && p.isActive);

      setProducts(mapped.length > 0 ? mapped : DEMO_PRODUCTS);
    } catch (err) {
      console.warn("ProductContext: API failed, using demo products.", err.message);
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};