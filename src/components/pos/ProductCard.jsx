// const ProductCard = ({ product, onAddToCart }) => {
//   return (
//     <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
//       <div className="h-32 bg-blue-50 rounded-lg mb-3"></div>

//       <h3 className="font-semibold text-gray-800">
//         {product.name}
//       </h3>

//       <p className="text-blue-600 font-bold">
//         Rs. {product.price}
//       </p>

//       <p className="text-sm text-gray-500">
//         Stock : {product.stock}
//       </p>

//       <button
//         onClick={() => onAddToCart(product)}
//         className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
//       >
//         Add To Cart
//       </button>
//     </div>
//   );
// };

// export default ProductCard;


import { Package, Plus } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
  const price = product.price ?? product.sellingPrice ?? 0;
  const stock = product.stock ?? product.quantity ?? null;
  const lowStock = stock !== null && stock < 10;
  
  const getBadgeColor = (cat) => {
    const c = String(cat).toUpperCase();
    if (c.includes("FOOD") || c.includes("BEVERAGE")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (c.includes("ADMIN") || c.includes("ELECTRONIC")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="backdrop-blur-md bg-white/80 border border-white/40 rounded-2xl p-4 cursor-pointer hover:shadow-xl hover:bg-white/90 hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between h-full relative"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {product.category && typeof product.category === 'object' 
                ? product.category.name 
                : (product.category && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "Other")}
            </span>
          
          {stock !== null && (
            <span className={`text-[10px] font-bold flex items-center gap-1 ${lowStock ? "text-rose-500 animate-pulse" : "text-slate-400"}`}>
              {lowStock ? `⚠️ ${stock} left` : `Stock: ${stock}`}
            </span>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 border border-slate-200/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {product.image || product.imageUrl ? (
              <img
                src={product.image || product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <Package size={22} className="text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Barcode / SKU */}
            {(product.barcode || product.sku) && (
              <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tight truncate mb-0.5">
                #{product.barcode || product.sku}
              </p>
            )}
            <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/70 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Price</p>
          <span className="text-blue-600 font-extrabold text-base tracking-tight">
            Rs.{price.toLocaleString()}
          </span>
        </div>

        <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200">
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;