import { Minus, Package, Plus, Trash2 } from "lucide-react";

const getItemId = (item) => {
  return item?._id || item?.id || item?.productId || item?.product;
};

const getAvailableStock = (item) => {
  return Number(
    item?.stock ??
      item?.quantity ??
      item?.availableStock ??
      item?.reorderLevel ??
      0
  );
};

const getPrice = (item) => {
  return Number(item?.price ?? item?.sellingPrice ?? item?.unitPrice ?? 0);
};

const CartItem = ({ item, increaseQty, decreaseQty, removeItem }) => {
  const id = getItemId(item);
  const price = getPrice(item);
  const availableStock = getAvailableStock(item);

  const reachedMaxStock = Number(item.qty) >= availableStock;
  const outOfStock = availableStock <= 0;
  const lineTotal = price * Number(item.qty || 0);

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-200 hover:border-blue-200/80">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
        {item.image || item.imageUrl ? (
          <img
            src={item.image || item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={18} className="text-slate-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-xs font-bold leading-tight text-slate-800">
          {item.name}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-[11px] font-medium text-slate-400">
            Rs.{price.toLocaleString()}
          </p>

          <span
            className={`text-[10px] font-black ${
              outOfStock
                ? "text-rose-500"
                : reachedMaxStock
                ? "text-amber-500"
                : "text-emerald-600"
            }`}
          >
            Stock: {availableStock}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => decreaseQty(id)}
            className="flex h-5 w-5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95"
          >
            <Minus size={10} strokeWidth={2.5} />
          </button>

          <span className="w-6 text-center text-xs font-bold text-slate-800">
            {item.qty}
          </span>

          <button
            type="button"
            onClick={() => increaseQty(id)}
            disabled={reachedMaxStock || outOfStock}
            title={
              reachedMaxStock
                ? `Only ${availableStock} stock available`
                : "Increase quantity"
            }
            className={`flex h-5 w-5 items-center justify-center rounded-lg border transition active:scale-95 ${
              reachedMaxStock || outOfStock
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>

          {reachedMaxStock && !outOfStock && (
            <span className="text-[10px] font-bold text-amber-500">Max</span>
          )}

          {outOfStock && (
            <span className="text-[10px] font-bold text-rose-500">
              Out of stock
            </span>
          )}
        </div>
      </div>

      <div className="flex h-12 shrink-0 flex-col items-end justify-between text-right">
        <p className="text-xs font-bold text-slate-800">
          Rs.{lineTotal.toLocaleString()}
        </p>

        <button
          type="button"
          onClick={() => removeItem(id)}
          className="rounded-md p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
          title="Remove item"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;