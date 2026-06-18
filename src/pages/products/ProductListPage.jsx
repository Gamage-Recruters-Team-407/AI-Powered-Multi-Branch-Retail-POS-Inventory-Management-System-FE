import { useEffect, useState } from "react";
import {
  getAllProducts,
  deactivateProduct,
  reactivateProduct,
  deleteProduct,
  searchProducts,
  getProductByBarcode,
  getActiveProducts,
  getInactiveProducts,
} from "../../services/productManagementApi";
import { getAllCategories } from "../../services/categoryManagementApi";
import { getAllSuppliers } from "../../services/supplierManagementApi";
import toast from "react-hot-toast";

function ProductListPage({
  onOpenCategories,
  onAddProduct,
  onViewProduct,
  onEditProduct,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchMode, setSearchMode] = useState("all");

  const [filters, setFilters] = useState({
    keyword: "",
    brand: "",
    category: "",
    supplier: "",
    minPrice: "",
    maxPrice: "",
  });

  const [barcode, setBarcode] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      setMessage("Failed to load categories");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await getAllSuppliers();
      setSuppliers(response.data.data || []);
    } catch (error) {
      setMessage("Failed to load suppliers");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage("");
      setSearchMode("all");

      const response = await getAllProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      setMessage("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSearchMode("filter");

      const params = {};

      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.brand) params.brand = filters.brand;
      if (filters.category) params.category = filters.category;
      if (filters.supplier) params.supplier = filters.supplier;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await searchProducts(params);
      const resultProducts = response.data.products || [];

      setProducts(resultProducts);

      if (resultProducts.length === 0) {
        setMessage("No matching products found");
      }
    } catch (error) {
      setMessage("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();

    if (!barcode.trim()) {
      setMessage("Please enter barcode");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSearchMode("barcode");

      const response = await getProductByBarcode(barcode.trim());
      setProducts(response.data.product ? [response.data.product] : []);
    } catch (error) {
      setProducts([]);
      setMessage(
        error.response?.data?.message || "Product not found for this barcode"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      brand: "",
      category: "",
      supplier: "",
      minPrice: "",
      maxPrice: "",
    });

    setBarcode("");
    fetchProducts();
  };

  const handleShowActiveProducts = async () => {
    try {
      setLoading(true);
      setMessage("");
      setSearchMode("active");

      const response = await getActiveProducts();
      const resultProducts = response.data.products || [];

      setProducts(resultProducts);

      if (resultProducts.length === 0) {
        setMessage("No active products found");
      }
    } catch (error) {
      setMessage("Failed to load active products");
    } finally {
      setLoading(false);
    }
  };

  const handleShowInactiveProducts = async () => {
    try {
      setLoading(true);
      setMessage("");
      setSearchMode("inactive");

      const response = await getInactiveProducts();
      const resultProducts = response.data.products || [];

      setProducts(resultProducts);

      if (resultProducts.length === 0) {
        setMessage("No inactive products found");
      }
    } catch (error) {
      setMessage("Failed to load inactive products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmAction) return;

    try {
      await deactivateProduct(id);
      toast.success("Product deactivated successfully");
      setMessage("Product deactivated successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to deactivate product");
      setMessage("Failed to deactivate product");
    }
  };

  const handleReactivate = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to reactivate this product?"
    );

    if (!confirmAction) return;

    try {
      await reactivateProduct(id);
      toast.success("Product reactivated successfully");
      setMessage("Product reactivated successfully");
      fetchProducts();
    } catch (error) {
      toast.error(`Failed to reactivate product: ${error.message}`);
      setMessage(`Failed to reactivate product: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to permanently delete this product?"
    );

    if (!confirmAction) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
      setMessage("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage products, categories, suppliers, images, barcodes, prices,
              and product status.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenCategories}
              className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Manage Categories
            </button>

            <button
              type="button"
              onClick={onAddProduct}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Add Product
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Search & Filter Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search by name, barcode, brand, category, supplier, or price
              range.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-7">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Search name, barcode, or brand"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                placeholder="Example: Coca Cola"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Supplier
              </label>
              <select
                name="supplier"
                value={filters.supplier}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Suppliers</option>
                {suppliers
                  .filter((supplier) => supplier.status === "Active")
                  .map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.companyName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="100"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="500"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-7">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Search Products
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="my-6 border-t border-slate-200" />

          <form
            onSubmit={handleBarcodeSearch}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Exact Barcode Search
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Enter or scan exact barcode"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
              >
                Find Barcode
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              All Products
            </button>

            <button
              type="button"
              onClick={handleShowActiveProducts}
              className="rounded-lg border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              Active Products
            </button>

            <button
              type="button"
              onClick={handleShowInactiveProducts}
              className="rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Inactive Products
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Product List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {products.length} product(s)
                {searchMode === "filter" && " from filter search"}
                {searchMode === "barcode" && " from barcode search"}
                {searchMode === "active" && " from active products"}
                {searchMode === "inactive" && " from inactive products"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Image
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Product
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Barcode
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-400">
                            No Image
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Unit: {product.unit || "N/A"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.barcode || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.brand || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.category?.name || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.supplier?.companyName || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        Rs. {product.price || 0}
                      </td>

                      <td className="px-6 py-4">
                        {product.isActive ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onViewProduct(product._id)}
                            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditProduct(product._id)}
                            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {product.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(product._id)}
                              className="rounded-md border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivate(product._id)}
                              className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                            >
                              Reactivate
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;