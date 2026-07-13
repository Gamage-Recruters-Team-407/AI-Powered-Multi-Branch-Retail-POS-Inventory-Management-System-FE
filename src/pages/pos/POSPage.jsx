import { History, RefreshCw, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import BarcodeScanner from "../../components/pos/BarcodeScanner";
import ProductList from "../../components/pos/ProductList";
import Cart from "../../components/pos/Cart";

const POSPage = ({ onCheckout, onViewHistory }) => {
  const navigate = useNavigate();

  const {
    cart,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    subtotal,
    discount,
    setDiscount,
    taxRate,
    taxAmount,
    total,
  } = useCart();

  const { products, categories, loading, error, refreshProducts } = useProducts();

  const [showCart, setShowCart] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="w-full min-w-0 min-h-screen overflow-y-auto bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 p-2 sm:p-3">
      <div className="relative flex h-[calc(100dvh+170px)] min-h-[860px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl sm:h-[calc(100dvh+150px)] sm:min-h-[840px] lg:h-[calc(100dvh+120px)] lg:min-h-[800px]">
        <div className="pointer-events-none absolute -top-24 right-10 h-52 w-52 rounded-full bg-sky-300/40 blur-3xl sm:right-20" />
        <div className="pointer-events-none absolute bottom-10 left-6 h-52 w-52 rounded-full bg-indigo-300/30 blur-3xl sm:left-10" />

        {/* Header */}
        <div className="relative z-10 shrink-0 border-b border-white/15 bg-slate-900/20 px-3 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-inner">
                <ShoppingBag size={19} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-2xl">
                  Cashier Desk
                </h1>

                <p className="truncate text-[11px] font-semibold text-sky-100/80">
                  {new Date().toLocaleDateString("en-LK", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                <span>{products.length} Products</span>
                <span className="text-white/40">|</span>
                <span>{categories.length} Categories</span>
              </div>

              <button
                type="button"
                onClick={refreshProducts}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 disabled:opacity-60"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 min-[1800px]:hidden"
              >
                <ShoppingCart size={15} />
                Cart

                {itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onViewHistory ? onViewHistory() : navigate("/history")
                }
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-700"
              >
                <History size={14} />
                <span className="hidden sm:inline">Sales History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex min-h-0 min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-2 sm:p-3">
            <div className="shrink-0 rounded-2xl border border-white/20 bg-white/70 p-2 shadow-sm backdrop-blur-md">
              <BarcodeScanner products={products} onFound={addToCart} />
            </div>

            <div className="min-h-0 min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/70 p-2 shadow-sm backdrop-blur-md">
              <ProductList
                products={products}
                categories={categories}
                loading={loading}
                error={error}
                onRetry={refreshProducts}
                onAddToCart={addToCart}
              />
            </div>
          </div>

          {/* Cart only for very large screens */}
          <div className="hidden w-[340px] shrink-0 border-l border-white/20 bg-white shadow-2xl min-[1800px]:flex">
            <Cart
              cart={cart}
              subtotal={subtotal}
              discount={discount}
              setDiscount={setDiscount}
              taxRate={taxRate}
              taxAmount={taxAmount}
              total={total}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeItem={removeItem}
              onClearCart={clearCart}
              onCheckout={onCheckout}
            />
          </div>
        </div>
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 min-[1800px]:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />

          <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl sm:rounded-l-3xl">
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-600" />
                <span className="font-black text-slate-800">Current Order</span>

                {itemCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {itemCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <Cart
                cart={cart}
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
                taxRate={taxRate}
                taxAmount={taxAmount}
                total={total}
                increaseQty={increaseQty}
                decreaseQty={decreaseQty}
                removeItem={removeItem}
                onClearCart={clearCart}
                onCheckout={() => {
                  setShowCart(false);
                  onCheckout?.();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;