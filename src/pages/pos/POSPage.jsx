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

import { History, ShoppingBag } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex flex-col antialiased font-sans p-4 relative overflow-hidden">
      
      <div className="absolute top-10 right-1/4 w-36 h-36 bg-yellow-400 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="flex-1 flex flex-col rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl overflow-hidden">
        
        <div className="px-6 py-4 flex justify-between items-center shrink-0 border-b border-white/20 bg-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-inner">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Cashier Desk</h1>
              <p className="text-xs font-semibold text-sky-100/80 mt-0.5">
                {new Date().toLocaleDateString("en-LK", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onViewHistory ? onViewHistory() : navigate("/history")}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-blue-700 hover:shadow-lg transition-all text-xs uppercase tracking-wider shadow-md shadow-blue-700/20"
          >
            <History size={14} /> Sales History
          </button>
        </div>

      
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
            <div className="backdrop-blur-md bg-white/40 p-2 rounded-2xl border border-white/20 shadow-sm">
              <BarcodeScanner products={products} onFound={addToCart} />
            </div>
            <div className="flex-1 overflow-hidden backdrop-blur-md bg-white/30 rounded-2xl border border-white/20 p-4 shadow-sm">
              <ProductList products={products} onAddToCart={addToCart} />
            </div>
          </div>

          <div className="w-[380px] md:w-[420px] backdrop-blur-md bg-white/60 border-l border-white/30 flex flex-col shadow-2xl">
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
    </div>
  );
};

export default POSPage;