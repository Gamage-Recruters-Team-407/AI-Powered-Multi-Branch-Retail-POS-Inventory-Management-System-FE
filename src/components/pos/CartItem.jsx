// const CartItem = ({
//   item,
//   increaseQty,
//   decreaseQty,
//   removeItem,
// }) => {
//   return (
//     <div className="border-b pb-3">
//       <div className="flex justify-between">
//         <h4 className="font-medium">
//           {item.name}
//         </h4>

//         <button
//           onClick={() => removeItem(item._id)}
//           className="text-red-500"
//         >
//           ✕
//         </button>
//       </div>

//       <div className="flex items-center justify-between mt-2">
//         <div className="flex gap-2">
//           <button
//             onClick={() => decreaseQty(item._id)}
//             className="px-2 bg-gray-200 rounded"
//           >
//             -
//           </button>

//           <span>{item.qty}</span>

//           <button
//             onClick={() => increaseQty(item._id)}
//             className="px-2 bg-gray-200 rounded"
//           >
//             +
//           </button>
//         </div>

//         <span className="font-semibold">
//           Rs. {item.price * item.qty}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default CartItem;

// import { Plus, Minus, Trash2 } from "lucide-react";


// const CartItem = ({ item, increaseQty, decreaseQty, removeItem }) => {
//   const price = item.price ?? item.sellingPrice ?? 0;
//   const lineTotal = price * item.qty;

//   return (
//     <div className="flex items-start gap-2 border rounded-lg p-2 bg-white hover:border-blue-200 transition">
//       <div className="flex-1 min-w-0">
//         <p className="text-xs font-semibold truncate text-gray-800">{item.name}</p>
//         <p className="text-[10px] text-gray-400">
//           Rs.{price.toLocaleString()} each
//         </p>

//         {/* Qty controls */}
//         <div className="flex items-center gap-1.5 mt-1.5">
//           <button
//             onClick={() => decreaseQty(item._id)}
//             className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
//           >
//             <Minus size={9} />
//           </button>
//           <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
//           <button
//             onClick={() => increaseQty(item._id)}
//             className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
//           >
//             <Plus size={9} />
//           </button>
//         </div>
//       </div>

//       {/* Line total + remove */}
//       <div className="text-right shrink-0">
//         <p className="text-sm font-bold text-blue-600">
//           Rs.{lineTotal.toLocaleString()}
//         </p>
//         <button
//           onClick={() => removeItem(item._id)}
//           className="text-red-400 hover:text-red-600 mt-1"
//           title="Remove item"
//         >
//           <Trash2 size={12} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CartItem;

import { Plus, Minus, Trash2, Package } from "lucide-react";

const CartItem = ({ item, increaseQty, decreaseQty, removeItem }) => {
  const price = item.price ?? item.sellingPrice ?? 0;
  const lineTotal = price * item.qty;

  return (
    <div className="flex items-center gap-3 border border-slate-100 p-2.5 bg-white rounded-xl shadow-sm hover:border-blue-200/80 transition-all duration-200 group">
      {/* Product Image in Cart */}
      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
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

      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate text-slate-800 leading-tight mb-0.5">{item.name}</p>
        <p className="text-[11px] font-medium text-slate-400">
          Rs.{price.toLocaleString()}
        </p>

        
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => decreaseQty(item._id)}
            className="w-5 h-5 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-600 active:scale-95 transition"
          >
            <Minus size={10} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-bold w-6 text-center text-slate-800">{item.qty}</span>
          <button
            onClick={() => increaseQty(item._id)}
            className="w-5 h-5 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-600 active:scale-95 transition"
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>

     
      <div className="text-right shrink-0 flex flex-col items-end justify-between h-12">
        <p className="text-xs font-bold text-slate-800">
          Rs.{lineTotal.toLocaleString()}
        </p>
        <button
          onClick={() => removeItem(item._id)}
          className="text-slate-300 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors"
          title="Remove item"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;