import { useEffect, useMemo, useState } from "react";
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

const inputClass =
  "pm-control w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectClass =
  "pm-control w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    keyword: "",
    brand: "",
    category: "",
    supplier: "",
    minPrice: "",
    maxPrice: "",
  });

  const [barcode, setBarcode] = useState("");

  const resetPagination = () => {
    setCurrentPage(1);
  };

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
      resetPagination();

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
      resetPagination();

      const params = {};

      if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
      if (filters.brand.trim()) params.brand = filters.brand.trim();
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
      resetPagination();

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
      resetPagination();

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
      resetPagination();

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

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);

  const paginatedProducts = products.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const leftPage = Math.max(2, currentPage - 1);
    const rightPage = Math.min(totalPages - 1, currentPage + 1);

    if (leftPage > 2) {
      pages.push("left-ellipsis");
    }

    for (let page = leftPage; page <= rightPage; page += 1) {
      pages.push(page);
    }

    if (rightPage < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="product-management-page min-h-screen bg-slate-50 p-6 text-slate-900">
      <style>
        {`
          .product-management-page .pm-control {
            color: #0f172a !important;
            background-color: #ffffff !important;
            -webkit-text-fill-color: #0f172a !important;
          }

          .product-management-page .pm-control::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #94a3b8 !important;
          }

          .product-management-page .pm-control option {
            color: #0f172a !important;
            background-color: #ffffff !important;
            -webkit-text-fill-color: #0f172a !important;
          }

          .product-management-page .pm-control:-webkit-autofill,
          .product-management-page .pm-control:-webkit-autofill:hover,
          .product-management-page .pm-control:-webkit-autofill:focus {
            -webkit-text-fill-color: #0f172a !important;
            box-shadow: 0 0 0px 1000px #ffffff inset !important;
          }
        `}
      </style>

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
                className={inputClass}
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
                className={inputClass}
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
                className={selectClass}
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
                className={selectClass}
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
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
                Showing {totalProducts === 0 ? 0 : startIndex + 1} to{" "}
                {endIndex} of {totalProducts} product(s)
                {searchMode === "filter" && " from filter search"}
                {searchMode === "barcode" && " from barcode search"}
                {searchMode === "active" && " from active products"}
                {searchMode === "inactive" && " from inactive products"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">
                Rows:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="pm-control rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
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
            <>
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
                    {paginatedProducts.map((product) => (
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

              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 md:flex-row">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    First
                  </button>

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {pageNumbers.map((page) =>
                    typeof page === "string" ? (
                      <span
                        key={page}
                        className="px-2 py-2 text-sm font-semibold text-slate-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                          currentPage === page
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>

                  <button
                    type="button"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;