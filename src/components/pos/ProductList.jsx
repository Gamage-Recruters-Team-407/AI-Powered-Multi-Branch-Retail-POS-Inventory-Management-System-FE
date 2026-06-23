// import { useState } from "react";
// import { Search, X, Layers } from "lucide-react";
// import ProductCard from "./ProductCard";

// const ProductList = ({ products = [], onAddToCart }) => {
//   const [search, setSearch]           = useState("");
//   const [activeCategory, setCategory] = useState("All");

//   const categories = [
//     "All",
//     ...new Set(
//       products
//         .map((p) => p.category?.name || p.category || "Other")
//         .filter(Boolean)
//     ),
//   ];

//   const filtered = products.filter((p) => {
//     const q = search.toLowerCase();
//     const matchSearch =
//       p.name?.toLowerCase().includes(q) ||
//       p.barcode?.toString().includes(q) ||
//       p.sku?.toLowerCase().includes(q);
//     const pCat = p.category?.name || p.category || "Other";
//     const matchCat = activeCategory === "All" || pCat === activeCategory;
//     return matchSearch && matchCat && p.isActive !== false;
//   });

//   return (
//     <div className="flex flex-col h-full bg-transparent">
//       <div className="flex items-center border border-slate-200 rounded-xl px-3.5 bg-slate-50/50 mb-3.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition duration-200">
//         <Search size={16} className="text-slate-400 mr-2 shrink-0" />
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search items by name, barcode or SKU..."
//           className="w-full py-2.5 outline-none text-sm bg-transparent text-slate-700 font-medium"
//         />
//         {search && (
//           <button
//             onClick={() => setSearch("")}
//             className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
//           >
//             <X size={12} />
//           </button>
//         )}
//       </div>

//       {/* <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 shrink-0 scrollbar-none">
//         <Layers size={14} className="text-slate-400 mr-1 shrink-0 hidden sm:inline" />
//         {categories.map((cat) => (
//           <button
//             key={cat}
//             onClick={() => setCategory(cat)}
//             className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
//               activeCategory === cat
//                 ? "bg-slate-800 text-white shadow-sm"
//                 : "bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
//             }`}
//           >
//             {cat}
//           </button>
//         ))}
//       </div> */}
//       <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 shrink-0 scrollbar-none">
//         <Layers size={14} className="text-slate-400 mr-1 shrink-0 hidden sm:inline" />
//         {categories.map((cat) => (
//           <button
//             // 1. key එකට unique ID එකක් වෙන '_id' දෙන්න
//             key={cat._id || cat} 
//             // 2. onClick එකෙන් state එක update කරද්දී ID එක හෝ Object එක pass කරන්න
//             onClick={() => setCategory(cat._id || cat)}
//             className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
//               // 3. Active category එක check කරන්නේ ID එකෙන් නම් මෙතනත් ._id දාන්න
//               activeCategory === (cat._id || cat)
//                 ? "bg-slate-800 text-white shadow-sm"
//                 : "bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
//             }`}
//           >
//             {/* 4. බටන් එක උඩ පේන්න ඕනේ category නම නිසා මෙතනට .name දෙන්න */}
//             {cat.name || cat}
//           </button>
//         ))}
//       </div>

//       <div className="flex-1 overflow-y-auto pr-1">
//         {filtered.length === 0 ? (
//           <div className="text-center text-slate-400 mt-20 text-sm font-medium">
//             {search ? `No items found matching "${search}"` : "No products available in database"}
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
//             {filtered.map((product) => (
//               <ProductCard
//                 key={product.name}
//                 product={product}
//                 onAddToCart={onAddToCart}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductList;

import { useState } from "react";
import { Search, X, Layers } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductList = ({ products = [], onAddToCart }) => {
  const [search, setSearch]           = useState("");
  const [activeCategory, setCategory] = useState("All");

  const defaultCategories = ["All", "Snacks", "Household", "Beverages", "Dairy", "Grains", "Other"];

  const categories = [
  ...new Set([
    ...defaultCategories,
    ...products
      .map((p) => {
        if (p.category && typeof p.category === 'object') {
          return p.category.name;
        }
        if (p.category && p.category.match(/^[0-9a-fA-F]{24}$/)) {
          return "Other"; 
        }
        return p.category || "Other";
      })
      .filter(Boolean)
  ])
];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name?.toLowerCase().includes(q) ||
      p.barcode?.toString().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    
    const pCat = p.category?.name || p.category || "Other";
    const matchCat = activeCategory === "All" || pCat === activeCategory;
    return matchSearch && matchCat && p.isActive !== false;
  });

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Search Bar */}
      <div className="flex items-center border border-slate-200 rounded-xl px-3.5 bg-slate-50/50 mb-3.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition duration-200">
        <Search size={16} className="text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items by name, barcode or SKU..."
          className="w-full py-2.5 outline-none text-sm bg-transparent text-slate-700 font-medium"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 shrink-0 scrollbar-none">
        <Layers size={14} className="text-slate-400 mr-1 shrink-0 hidden sm:inline" />
        {categories.map((cat) => (
          <button
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 mt-20 text-sm font-medium">
            {search ? `No items found matching "${search}"` : "No products available in database"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {filtered.map((product) => (
              <ProductCard
                key={product._id || product.name} 
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;