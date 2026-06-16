import React from "react";
import { motion } from "framer-motion";
import {
  FiDollarSign, FiTag, FiBox, FiAlertCircle
} from "react-icons/fi";

const CARDS = (summary) => [
  {
    label: "Total Stock Value",
    sublabel: "Cumulative cost of all inventory",
    value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      summary.totalStockValue || 0
    ),
    rawValue: summary.totalStockValue || 0,
    icon: FiDollarSign,
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "bg-[var(--accent-light)]",
    iconColor: "text-[var(--accent-color)]",
    badge: { label: "On hand", color: "bg-[var(--accent-light)] text-[var(--accent-color)]" },
  },
  {
    label: "Unique Products",
    sublabel: "Distinct SKUs tracked across branches",
    value: (summary.totalUniqueItems || 0).toLocaleString(),
    rawValue: summary.totalUniqueItems || 0,
    icon: FiTag,
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    badge: { label: "SKUs", color: "bg-purple-500/10 text-purple-500" },
  },
  {
    label: "Total Stock Units",
    sublabel: "Combined quantity across all branches",
    value: (summary.totalQuantity || 0).toLocaleString(),
    rawValue: summary.totalQuantity || 0,
    icon: FiBox,
    gradient: "from-cyan-500 to-blue-500",
    iconBg: "bg-[var(--info-light)]",
    iconColor: "text-[var(--info-color)]",
    badge: { label: "Units", color: "bg-[var(--info-light)] text-[var(--info-color)]" },
  },
  {
    label: "Low Stock Alerts",
    sublabel: "Items at or below reorder threshold",
    value: (summary.lowStockCount || 0).toLocaleString(),
    rawValue: summary.lowStockCount || 0,
    icon: FiAlertCircle,
    gradient: summary.lowStockCount > 0 ? "from-red-500 to-rose-500" : "from-emerald-500 to-green-500",
    iconBg: summary.lowStockCount > 0 ? "bg-[var(--danger-light)]" : "bg-[var(--success-light)]",
    iconColor: summary.lowStockCount > 0 ? "text-[var(--danger-color)]" : "text-[var(--success-color)]",
    badge: summary.lowStockCount > 0
      ? { label: "Action needed", color: "bg-[var(--danger-light)] text-[var(--danger-color)]" }
      : { label: "All healthy", color: "bg-[var(--success-light)] text-[var(--success-color)]" },
  },
];

const Skeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm animate-pulse"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--bg-tertiary)]" />
          <div className="h-5 w-20 rounded-full bg-[var(--bg-tertiary)]" />
        </div>
        <div className="h-7 w-28 bg-[var(--bg-tertiary)] rounded-lg mb-2" />
        <div className="h-3 w-40 bg-[var(--bg-tertiary)] rounded" />
      </div>
    ))}
  </div>
);

export const InventorySummaryCards = ({ summary, loading }) => {
  if (loading) return <Skeleton />;

  const cards = CARDS(summary);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={idx}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} shadow-xs`}>
                <Icon className={`text-lg ${card.iconColor}`} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${card.badge.color}`}>
                {card.badge.label}
              </span>
            </div>

            {/* Value */}
            <div className="mb-1">
              <span className="text-2xl font-black text-[var(--text-primary)] leading-tight tabular-nums">
                {card.value}
              </span>
            </div>

            {/* Label */}
            <div className="text-xs font-bold text-[var(--text-secondary)] leading-snug">{card.label}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 leading-snug">{card.sublabel}</div>

            {/* Gradient bottom accent */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient}`} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default InventorySummaryCards;
