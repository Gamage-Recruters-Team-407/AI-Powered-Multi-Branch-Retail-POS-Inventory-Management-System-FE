import { Package, Plus } from "lucide-react";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const isMongoId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:image")
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${API_ORIGIN}${imagePath}`;
  }

  return `${API_ORIGIN}/${imagePath}`;
};

const getCategoryName = (product) => {
  if (product.categoryName) return product.categoryName;

  if (product.category && typeof product.category === "object") {
    return product.category.name || "Other";
  }

  if (product.category && typeof product.category === "string") {
    return isMongoId(product.category) ? "Other" : product.category;
  }

  return "Other";
};

const getStockCount = (product) => {
  return Number(
    product.stock ??
      product.quantity ??
      product.availableStock ??
      product.reorderLevel ??
      0
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const price = Number(product.price ?? product.sellingPrice ?? 0);
  const stock = getStockCount(product);
  const outOfStock = stock <= 0;

  const categoryName = getCategoryName(product);
  const imageSrc = resolveImageUrl(product.image || product.imageUrl);

  const handleAddToCart = () => {
    if (outOfStock) return;
    onAddToCart?.(product);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleAddToCart}
      onKeyDown={(event) => {
        if (event.key === "Enter") handleAddToCart();
      }}
      className={`group flex min-h-[205px] min-w-0 flex-col rounded-2xl border bg-white shadow-sm outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 ${
        outOfStock
          ? "cursor-not-allowed border-slate-200 opacity-70"
          : "cursor-pointer border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <span className="max-w-[95px] truncate rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
          {categoryName}
        </span>

        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
            outOfStock
              ? "bg-rose-50 text-rose-600"
              : stock <= 5
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {outOfStock ? "Out" : stock <= 5 ? `Low: ${stock}` : `Stock: ${stock}`}
        </span>
      </div>

      <div className="mt-3 flex justify-center px-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Package size={22} className="text-slate-400" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 px-3 pt-2 text-center">
        {(product.barcode || product.sku) && (
          <p className="mx-auto max-w-full truncate font-mono text-[9px] font-bold text-slate-400">
            #{product.barcode || product.sku}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 min-h-[34px] text-sm font-black leading-tight text-slate-800 transition-colors group-hover:text-blue-600">
          {product.name}
        </h3>

        {product.brand && (
          <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
            {product.brand}
          </p>
        )}
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between border-t border-slate-100 px-3 py-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
            Price
          </p>

          <p className="max-w-[100px] truncate text-sm font-black text-blue-600">
            Rs.{price.toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition active:scale-95 ${
            outOfStock
              ? "cursor-not-allowed bg-slate-300 shadow-none"
              : "bg-blue-600 shadow-blue-600/20 hover:scale-105 hover:bg-blue-700"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={17} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;