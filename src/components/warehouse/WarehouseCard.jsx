import { FiEdit2, FiTrash2, FiArrowRight, FiMapPin, FiUser, FiPhone } from "react-icons/fi";

export default function WarehouseCard({ warehouse, onEdit, onDelete, onView }) {
  const capacity = warehouse.capacity || 1000;
  const used = warehouse.totalUsed || 0;
  const usagePercent = warehouse.usagePercent || 0;

  return (
    <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/60 group">
      
      {/* Background soft glow on hover */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-2xl group-hover:bg-blue-300/50 transition-colors duration-500"></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex-1 pr-2">
          <h3 className="text-xl font-black text-slate-800 drop-shadow-sm mb-1 line-clamp-1">{warehouse.name}</h3>
          <p className="text-sm font-semibold text-blue-700/80 flex items-center gap-1.5">
            <FiMapPin size={14} /> {warehouse.location}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(warehouse)}
            className="p-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 bg-white/50 active:scale-95"
            title="Edit Warehouse"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(warehouse._id)}
            className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 bg-white/50 active:scale-95"
            title="Delete Warehouse"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="relative z-10 mb-6 bg-white/30 p-4 rounded-2xl border border-white/50">
        <div className="flex justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
          <span>Capacity Usage</span>
          <span className={usagePercent > 80 ? "text-red-500" : usagePercent > 50 ? "text-amber-500" : "text-blue-600"}>
            {usagePercent}%
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-3 shadow-inner border border-white/60 p-0.5 mb-2">
          <div
            className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out ${
              usagePercent > 80 
                ? "bg-gradient-to-r from-red-400 to-red-500" 
                : usagePercent > 50 
                ? "bg-gradient-to-r from-amber-400 to-orange-400" 
                : "bg-gradient-to-r from-blue-400 to-indigo-500"
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mt-1">
          <span>{used} items</span>
          <span>{capacity} total</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1.5 bg-blue-100/50 text-blue-600 rounded-lg"><FiUser size={14}/></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Manager</p>
            <p className="font-bold text-slate-700 truncate">{warehouse.manager?.name || "N/A"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 p-1.5 bg-indigo-100/50 text-indigo-600 rounded-lg"><FiPhone size={14}/></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Phone</p>
            <p className="font-bold text-slate-700 truncate">{warehouse.phone || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* View Button */}
      <button
        onClick={() => onView(warehouse._id)}
        className="relative z-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 active:scale-[0.98]"
      >
        View Details <FiArrowRight size={18} />
      </button>
    </div>
  );
}