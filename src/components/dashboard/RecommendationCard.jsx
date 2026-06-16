import React from 'react';
import { ArrowUpRight, Package, ShoppingBag, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const formatMoney = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const RecommendationCard = ({ product, rank, variant = 'seller', index = 0 }) => {
  const name = product.name || product.productName || product.product_name || 'Recommended Product';
  const category = product.category || product.categoryName || product.categoryId || 'Retail item';
  const sold = product.totalSold || product.units_sold || product.timesSold || product.quantity || product.currentSales;
  const price = formatMoney(product.price);
  const revenue = formatMoney(product.revenue);
  const growth = product.growthPercentage || product.growth || product.trendPercent || product.lift || product.score;
  const reason = product.reason || product.recommendationReason || product.basedOn || 
    (variant === 'personalized' ? 'Matches customer purchase history' : 'High-performing item');

  // Aesthetic mappings based on variant
  const styles = {
    seller: {
      bg: "bg-gradient-to-br from-white to-blue-50/50",
      border: "border-blue-100/50",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      rankBg: "bg-slate-800 text-white",
      Icon: ShoppingBag
    },
    trending: {
      bg: "bg-gradient-to-br from-white to-orange-50/50",
      border: "border-orange-100/50",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      rankBg: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20",
      Icon: TrendingUp
    },
    personalized: {
      bg: "bg-gradient-to-br from-white to-emerald-50/50",
      border: "border-emerald-100/50",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      rankBg: "bg-emerald-600 text-white",
      Icon: Sparkles
    }
  };

  const currentStyle = styles[variant] || styles.seller;
  const Icon = currentStyle.Icon;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative flex flex-col h-full rounded-2xl p-5 border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${currentStyle.bg} ${currentStyle.border}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center justify-center h-7 px-3 rounded-lg font-bold text-xs shrink-0 ${currentStyle.rankBg}`}>
          #{product.rank || rank}
        </div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${currentStyle.iconBg} ${currentStyle.iconText}`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0 ${currentStyle.iconText}`}>
          <Package size={22} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-2" title={name}>{name}</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide truncate" title={category}>{category}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {sold && (
          <div className="flex-1 min-w-[45%] bg-white/60 rounded-lg p-2 border border-slate-100 backdrop-blur-sm">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">Sold</span>
            <span className="block text-sm font-extrabold text-slate-700">{Number(sold).toLocaleString()}</span>
          </div>
        )}
        {price && (
          <div className="flex-1 min-w-[45%] bg-white/60 rounded-lg p-2 border border-slate-100 backdrop-blur-sm">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">Price</span>
            <span className="block text-sm font-extrabold text-slate-700">{price}</span>
          </div>
        )}
        {growth && (
          <div className="w-full bg-white/60 rounded-lg p-2 border border-slate-100 backdrop-blur-sm">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">Growth Metric</span>
            <span className="flex items-center gap-1 text-sm font-extrabold text-emerald-600">
              <TrendingUp size={14} strokeWidth={3} />
              +{Math.abs(Number(growth)).toLocaleString()}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-slate-200/60 flex items-start gap-2">
        <div className="mt-0.5 p-1 rounded-full bg-slate-100 shrink-0">
          <Zap size={10} className="text-slate-500 fill-slate-500" />
        </div>
        <span className="text-xs font-medium text-slate-600 leading-snug line-clamp-3" title={reason}>{reason}</span>
      </div>
    </motion.article>
  );
};

export default RecommendationCard;
