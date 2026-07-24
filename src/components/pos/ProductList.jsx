import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import ProductCard from "./ProductCard";

const getProductCategoryId = (product) => {
  return product.categoryId || product.category?._id || product.category?.id || "";
};

const getProductCategoryName = (product) => {
  return (
    product.categoryName ||
    product.category?.name ||
    (typeof product.category === "string" ? product.category : "") ||
    "Other"
  );
};

const ProductList = ({
  products = [],
  categories = [],
  loading = false,
  error = "",
  onRetry,
  onAddToCart,
}) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.isActive !== false);
  }, [products]);

  const categoryTabs = useMemo(() => {
    const map = new Map();

    map.set("All", {
      id: "All",
      name: "All",
    });

    categories.forEach((category) => {
      const id = category._id || category.id || category.name;
      const name = category.name || "Unnamed";

      if (id) {
        map.set(id, { id, name });
      }
    });

    activeProducts.forEach((product) => {
      const categoryId = getProductCategoryId(product);
      const categoryName = getProductCategoryName(product);
      const id = categoryId || categoryName;

      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: categoryName,
        });
      }
    });

    return Array.from(map.values())
      .map((category) => {
        if (category.id === "All") {
          return {
            ...category,
            count: activeProducts.length,
          };
        }

        const count = activeProducts.filter((product) => {
          const productCategoryId = getProductCategoryId(product);
          const productCategoryName = getProductCategoryName(product);

          return (
            productCategoryId === category.id ||
            productCategoryName === category.name ||
            productCategoryName === category.id
          );
        }).length;

        return {
          ...category,
          count,
        };
      })
      .filter((category) => category.id === "All" || category.count > 0);
  }, [categories, activeProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activeProducts.filter((product) => {
      const categoryId = getProductCategoryId(product);
      const categoryName = getProductCategoryName(product);

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.barcode?.toString().toLowerCase().includes(query) ||
        product.sku?.toString().toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        categoryName?.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" ||
        categoryId === activeCategory ||
        categoryName === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeProducts, search, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const startItem =
    filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1;

  const endItem = Math.min(page * pageSize, filteredProducts.length);

  useEffect(() => {
    setPage(1);
  }, [search, activeCategory, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxButtons = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let number = start; number <= end; number += 1) {
      pages.push(number);
    }

    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <div className="shrink-0 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <Search size={16} className="mr-2 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product name, barcode, brand..."
              className="w-full bg-transparent py-2.5 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:w-[140px]">
            <span className="text-xs font-black text-slate-500">Rows</span>

            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
          <Layers size={14} className="hidden shrink-0 text-slate-400 sm:block" />

          {categoryTabs.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition-all ${
                activeCategory === category.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {category.name}
              <span className="ml-1 opacity-60">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="flex gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />

            <div>
              <p className="text-sm font-black text-rose-700">
                Unable to load products
              </p>
              <p className="mt-0.5 text-xs font-medium text-rose-500">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRetry?.()}
            className="flex items-center gap-1 text-xs font-black text-rose-600 hover:text-rose-800"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto py-2 pr-1">
        {loading ? (
          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            }}
          >
            {Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={index}
                className="h-[205px] animate-pulse rounded-2xl border border-white/40 bg-white/70"
              />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
            <p className="text-sm font-black text-slate-700">
              {search
                ? `No products found for "${search}"`
                : "No active products available"}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Check product status, inventory records, branch, or search keyword.
            </p>
          </div>
        ) : (
          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            }}
          >
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product._id || product.id || product.name}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 rounded-2xl border border-white/60 bg-white/85 px-3 py-2.5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs font-bold text-slate-500 sm:text-left">
            Showing <span className="text-slate-900">{startItem}</span>
            {" - "}
            <span className="text-slate-900">{endItem}</span>
            {" of "}
            <span className="text-slate-900">{filteredProducts.length}</span>{" "}
            products
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() => setPage(number)}
                  disabled={loading}
                  className={`h-8 min-w-8 rounded-xl px-2.5 text-xs font-black transition ${
                    page === number
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 sm:hidden">
              {page} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages || loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;