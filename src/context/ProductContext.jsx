import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/axiosInstance";

const ProductContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductProvider");
  }

  return context;
};

const isMongoId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const getCategoryId = (product) => {
  if (product?.category && typeof product.category === "object") {
    return product.category._id || product.category.id || "";
  }

  if (product?.category && isMongoId(product.category)) {
    return product.category;
  }

  return "";
};

const getCategoryName = (product) => {
  if (product?.categoryName) return product.categoryName;

  if (product?.category && typeof product.category === "object") {
    return product.category.name || "Other";
  }

  if (product?.category && typeof product.category === "string") {
    return isMongoId(product.category) ? "Other" : product.category;
  }

  return "Other";
};

const normalizeProduct = (product) => {
  // Backend already sends branch-specific stock from Inventory
  const stock = Number(product.stock ?? product.quantity ?? 0);

  return {
    ...product,

    _id: product._id || product.id,
    id: product._id || product.id,

    categoryId: getCategoryId(product),
    categoryName: getCategoryName(product),

    price: Number(product.price ?? product.sellingPrice ?? 0),

    stock,
    quantity: stock,
    availableStock: stock,

    image: product.image || product.imageUrl || "",
    imageUrl: product.imageUrl || product.image || "",

    isActive: product.isActive !== false,
  };
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [productError, setProductError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError("");

    try {
      const response = await api.get("/products/status/active");

      const items = Array.isArray(response.data?.products)
        ? response.data.products
        : [];

      const mappedProducts = items
        .map(normalizeProduct)
        .filter((product) => product._id && product.name && product.isActive);

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);

      setProducts([]);
      setProductError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load products"
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoryError("");

    try {
      const response = await api.get("/categories");

      const items = Array.isArray(response.data?.categories)
        ? response.data.categories
        : [];

      setCategories(items);
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      setCategories([]);
      setCategoryError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchCategories()]);
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const value = useMemo(
    () => ({
      products,
      categories,

      loadingProducts,
      loadingCategories,
      loading: loadingProducts || loadingCategories,

      productError,
      categoryError,
      error: productError || categoryError,

      fetchProducts,
      fetchCategories,
      refreshProducts,
    }),
    [
      products,
      categories,
      loadingProducts,
      loadingCategories,
      productError,
      categoryError,
      fetchProducts,
      fetchCategories,
      refreshProducts,
    ]
  );

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};