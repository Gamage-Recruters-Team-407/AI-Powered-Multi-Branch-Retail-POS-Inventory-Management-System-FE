import { FiEdit2, FiTrash2, FiLayers } from "react-icons/fi";

export default function ZoneCard({ zone, onEdit, onDelete }) {
  const usagePercent = zone.usagePercent || 0;
  const capacity = zone.capacity || 1000;
  const used = zone.currentStock || 0;

  return (
    <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/70 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/60 group">
      
      {/* Soft background glow */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-gradient-to-br from-indigo-200/40 to-blue-200/40 rounded-full blur-2xl group-hover:bg-blue-300/50 transition-colors duration-500 z-0"></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl shadow-sm border border-white">
            <FiLayers size={18} />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 drop-shadow-sm mb-1">{zone.zoneName}</h4>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/60 text-slate-500 border border-white/80 shadow-sm">
              Code: {zone.zoneCode}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(zone)}
            className="p-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 bg-white/50 active:scale-95"
            title="Edit Zone"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(zone._id)}
            className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 bg-white/50 active:scale-95"
            title="Delete Zone"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="relative z-10 bg-white/40 p-4 rounded-2xl border border-white/50 mb-4">
        <div className="flex justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
          <span>Zone Usage</span>
          <span className={usagePercent > 80 ? "text-red-500" : usagePercent > 50 ? "text-amber-500" : "text-blue-600"}>
            {usagePercent}%
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-2.5 shadow-inner border border-white/60 p-0.5">
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
      </div>

      {/* Info Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3 text-sm bg-white/30 rounded-2xl p-3 border border-white/40">
        <div className="text-center border-r border-slate-200/50">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Used</p>
          <p className="font-black text-slate-700 text-lg">{used}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Capacity</p>
          <p className="font-black text-slate-700 text-lg">{capacity}</p>
        </div>
      </div>
    </div>
  );
}