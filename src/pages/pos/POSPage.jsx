// import { History } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../../context/CartContext";
// import { useProducts } from "../../context/ProductContext";
// import BarcodeScanner from "../../components/pos/BarcodeScanner";
// import ProductList    from "../../components/pos/ProductList";
// import Cart           from "../../components/pos/Cart";

// const POSPage = () => {
//   const navigate = useNavigate();
//   const {
//     cart, addToCart, increaseQty, decreaseQty, removeItem, clearCart,
//     subtotal, discount, setDiscount, taxRate, taxAmount, total,
//   } = useCart();
//   const { products } = useProducts();

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
//         <div>
//           <h1 className="text-xl font-bold text-blue-600">🛒 POS — Cashier</h1>
//           <p className="text-xs text-gray-400">
//             {new Date().toLocaleDateString("en-LK", {
//               weekday: "long", year: "numeric", month: "long", day: "numeric",
//             })}
//           </p>
//         </div>
//         <button
//           onClick={() => navigate("/history")}
//           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm"
//         >
//           <History size={15} /> Sales History
//         </button>
//       </div>

//       {/* Body */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Left — Products */}
//         <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
//           <BarcodeScanner products={products} onFound={addToCart} />
//           <div className="flex-1 overflow-hidden">
//             <ProductList products={products} onAddToCart={addToCart} />
//           </div>
//         </div>

//         {/* Right — Cart */}
//         <Cart
//           cart={cart}
//           subtotal={subtotal}
//           discount={discount}
//           setDiscount={setDiscount}
//           taxRate={taxRate}
//           taxAmount={taxAmount}
//           total={total}
//           increaseQty={increaseQty}
//           decreaseQty={decreaseQty}
//           removeItem={removeItem}
//           onClearCart={clearCart}
//         />
//       </div>
//     </div>
//   );
// };

// export default POSPage;

import { History, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import BarcodeScanner from "../../components/pos/BarcodeScanner";
import ProductList    from "../../components/pos/ProductList";
import Cart           from "../../components/pos/Cart";

const POSPage = ({ onCheckout, onViewHistory }) => {
  const navigate = useNavigate();
  const {
    cart, addToCart, increaseQty, decreaseQty, removeItem, clearCart,
    subtotal, discount, setDiscount, taxRate, taxAmount, total,
  } = useCart();
  const { products } = useProducts();
  const [showCart, setShowCart] = useState(false);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex flex-col antialiased font-sans p-2 sm:p-4 relative overflow-hidden">

      <div className="absolute top-10 right-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="flex-1 flex flex-col rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center shrink-0 border-b border-white/20 bg-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-white border border-white/30">
              <ShoppingBag size={16} className="sm:hidden" />
              <ShoppingBag size={20} className="hidden sm:block" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight">Cashier Desk</h1>
              <p className="text-[10px] sm:text-xs font-semibold text-sky-100/80 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString("en-LK", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
              <p className="text-[10px] font-semibold text-sky-100/80 mt-0.5 sm:hidden">
                {new Date().toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile cart toggle */}
            <button
              onClick={() => setShowCart(true)}
              className="relative lg:hidden flex items-center gap-1.5 bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs border border-white/30"
            >
              <ShoppingCart size={14} />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewHistory ? onViewHistory() : navigate("/history")}
              className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all text-[10px] sm:text-xs uppercase tracking-wider shadow-md"
            >
              <History size={12} className="sm:hidden" />
              <History size={14} className="hidden sm:block" />
              <span className="hidden sm:inline">Sales History</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Products — full width on mobile */}
          <div className="flex-1 flex flex-col overflow-hidden p-2 sm:p-5 gap-2 sm:gap-4">
            <div className="backdrop-blur-md bg-white/40 p-2 rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
              <BarcodeScanner products={products} onFound={addToCart} />
            </div>
            <div className="flex-1 overflow-hidden backdrop-blur-md bg-white/30 rounded-xl sm:rounded-2xl border border-white/20 p-2 sm:p-4 shadow-sm">
              <ProductList products={products} onAddToCart={addToCart} />
            </div>
          </div>

          {/* Cart — sidebar on desktop */}
          <div className="hidden lg:flex w-[380px] xl:w-[420px] backdrop-blur-md bg-white/60 border-l border-white/30 flex-col shadow-2xl">
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

      {/* Mobile Cart — Bottom Sheet */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-600" />
                <span className="font-bold text-slate-800">Cart</span>
                {itemCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
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
                onCheckout={() => { setShowCart(false); onCheckout?.(); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;