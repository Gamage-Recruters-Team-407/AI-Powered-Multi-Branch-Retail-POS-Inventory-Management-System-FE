// import CartItem from "./CartItem";

// const Cart = ({
//   cart,
//   total,
//   increaseQty,
//   decreaseQty,
//   removeItem,
// }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5">
//       <h2 className="text-xl font-bold text-blue-600 mb-4">
//         Shopping Cart
//       </h2>

//       <div className="space-y-4">
//         {cart.map((item) => (
//           <CartItem
//             key={item._id}
//             item={item}
//             increaseQty={increaseQty}
//             decreaseQty={decreaseQty}
//             removeItem={removeItem}
//           />
//         ))}
//       </div>

//       <div className="border-t mt-5 pt-4">
//         <div className="flex justify-between text-lg font-bold">
//           <span>Total</span>
//           <span className="text-blue-600">
//             Rs. {total}
//           </span>
//         </div>

//         <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg">
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;

// import { useNavigate } from "react-router-dom";
// import { ShoppingCart, Tag } from "lucide-react";
// import CartItem from "./CartItem";

// const Cart = ({
//   cart = [],
//   subtotal = 0,
//   discount = 0,
//   setDiscount,
//   taxRate = 0,
//   taxAmount = 0,
//   total = 0,
//   increaseQty,
//   decreaseQty,
//   removeItem,
//   onClearCart,
// }) => {
//   const navigate   = useNavigate();
//   const itemCount  = cart.reduce((s, i) => s + i.qty, 0);

//   return (
//     <div className="w-80 xl:w-96 bg-white border-l flex flex-col h-full">
//        {/* Header  */}
//       <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-2">
//           <ShoppingCart size={18} className="text-blue-600" />
//           <span className="font-semibold text-sm">Cart</span>
//           {itemCount > 0 && (
//             <span className="bg-blue-600 text-white text-[10px] rounded-full px-1.5 py-0.5 font-medium">
//               {itemCount}
//             </span>
//           )}
//         </div>
//         {cart.length > 0 && (
//           <button
//             onClick={() => { if (window.confirm("Clear cart?")) onClearCart?.(); }}
//             className="text-xs text-red-400 hover:text-red-600"
//           >
//             Clear all
//           </button>
//         )}
//       </div>

//       {/* Items */}
//       <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
//         {cart.length === 0 ? (
//           <div className="text-center text-gray-300 mt-20">
//             <ShoppingCart size={36} className="mx-auto mb-2" />
//             <p className="text-sm">Cart is empty</p>
//             <p className="text-xs mt-1">Scan a barcode or tap a product</p>
//           </div>
//         ) : (
//           cart.map((item) => (
//             <CartItem
//               key={item._id}
//               item={item}
//               increaseQty={increaseQty}
//               decreaseQty={decreaseQty}
//               removeItem={removeItem}
//             />
//           ))
//         )}
//       </div>

//       {/* Totals */}
//       {cart.length > 0 && (
//         <div className="border-t px-4 py-3 space-y-1.5 shrink-0">
//           {/* Discount */}
//           <div className="flex items-center gap-2">
//             <Tag size={12} className="text-gray-400" />
//             <label className="text-xs text-gray-500">Discount (Rs.)</label>
//             <input
//               type="number"
//               min="0"
//               max={subtotal}
//               value={discount}
//               onChange={(e) => setDiscount?.(Math.max(0, Number(e.target.value)))}
//               className="border rounded px-2 py-0.5 text-xs w-20 text-right ml-auto"
//             />
//           </div>

//           <div className="flex justify-between text-xs text-gray-500">
//             <span>Subtotal</span>
//             <span>Rs.{subtotal.toLocaleString()}</span>
//           </div>
//           {discount > 0 && (
//             <div className="flex justify-between text-xs text-green-600">
//               <span>Discount</span>
//               <span>– Rs.{discount.toLocaleString()}</span>
//             </div>
//           )}
//           {taxRate > 0 && (
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>Tax ({taxRate}%)</span>
//               <span>Rs.{taxAmount.toLocaleString()}</span>
//             </div>
//           )}

//           <div className="flex justify-between font-bold text-blue-600 text-base border-t pt-1.5">
//             <span>Total</span>
//             <span>Rs.{total.toLocaleString()}</span>
//           </div>

//           <button
//             onClick={() => navigate("/checkout")}
//             className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm mt-1"
//           >
//             Proceed to Checkout →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Cart;

import { useNavigate } from "react-router-dom";
import { ShoppingCart, Tag, ArrowRight, Trash2 } from "lucide-react";
import CartItem from "./CartItem";

const Cart = ({
  cart = [],
  subtotal = 0,
  discount = 0,
  setDiscount,
  taxRate = 0,
  taxAmount = 0,
  total = 0,
  increaseQty,
  decreaseQty,
  removeItem,
  onClearCart,
  onCheckout,
}) => {
  const navigate = useNavigate();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart size={18} className="text-slate-700" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight ml-1">Current Order</span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => { if (window.confirm("Are you sure you want to clear the cart?")) onClearCart?.(); }}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition flex items-center gap-1 p-1 rounded-lg hover:bg-rose-50"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-slate-50/30">
        {cart.length === 0 ? (
          <div className="text-center text-slate-400 mt-28 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 border border-dashed border-slate-200">
              <ShoppingCart size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Scan barcodes or select items from the grid to build an order.</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeItem={removeItem}
            />
          ))
        )}
      </div>

      {/* Totals Summary */}
      {cart.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3 shrink-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          {/* Discount Box */}
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-slate-400" />
              <label className="text-xs font-semibold text-slate-600">Apply Discount</label>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
              <span className="text-xs font-semibold text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discount || ""}
                onChange={(e) => setDiscount?.(Math.max(0, Number(e.target.value)))}
                className="text-xs font-bold w-16 text-right outline-none text-slate-700"
                placeholder="0"
              />
            </div>
          </div>

          
          <div className="space-y-1.5 text-xs font-medium text-slate-500 px-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-700 font-semibold">Rs.{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-semibold">– Rs.{discount.toLocaleString()}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}%)</span>
                <span className="text-slate-700 font-semibold">Rs.{taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-blue-600 text-base border-t border-dashed border-slate-200 pt-2.5 mt-2">
              <span>Total Bill</span>
              <span className="text-lg">Rs.{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onCheckout ? onCheckout() : navigate("/checkout")}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/10 mt-1"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;