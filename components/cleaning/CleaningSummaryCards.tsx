"use client";

import React from "react";
import { CleaningBatchMetrics } from "@/lib/types";
import {
  Layers,
  CheckCircle2,
  Wand2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface CleaningSummaryCardsProps {
  metrics: CleaningBatchMetrics;
  onFilterClick?: (filterType: "all" | "cleaned" | "modified" | "review") => void;
  activeFilter?: string;
}

export const CleaningSummaryCards: React.FC<CleaningSummaryCardsProps> = ({
  metrics,
  onFilterClick,
  activeFilter = "all",
}) => {
  const cards = [
    {
      id: "all",
      title: "Total Records Processed",
      value: metrics.totalRecords.toLocaleString(),
      percentage: "100%",
      subtext: `Batch runtime: ${metrics.processingTimeMs} ms`,
      icon: Layers,
      color: "indigo",
      bgGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: activeFilter === "all" ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200",
      textColor: "text-indigo-600",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      badge: "Ingestion Batch",
    },
    {
      id: "cleaned",
      title: "Successfully Cleaned",
      value: metrics.successfullyCleaned.toLocaleString(),
      percentage: `${metrics.successRate}%`,
      subtext: "Parsed & normalized to standards",
      icon: CheckCircle2,
      color: "emerald",
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: activeFilter === "cleaned" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      badge: "100% Deterministic",
    },
    {
      id: "modified",
      title: "Records Modified",
      value: metrics.recordsModified.toLocaleString(),
      percentage: `${metrics.modifiedRate}%`,
      subtext: "Abbreviations & units standardized",
      icon: Wand2,
      color: "blue",
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: activeFilter === "modified" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200",
      textColor: "text-blue-600",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      badge: "Transformed",
    },
    {
      id: "review",
      title: "Records Requiring Review",
      value: metrics.recordsRequiringReview.toLocaleString(),
      percentage: `${metrics.reviewRate}%`,
      subtext: metrics.recordsRequiringReview === 0 ? "Zero anomalies flagged" : "Missing fields / anomalies",
      icon: AlertTriangle,
      color: "amber",
      bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: activeFilter === "review" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200",
      textColor: "text-amber-600",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      badge: metrics.recordsRequiringReview === 0 ? "Clean" : "Flagged",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.id as any)}
            className={`relative overflow-hidden rounded-2xl bg-white p-5 border shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer group ${card.borderColor}`}
          >
            {/* Top row: Title and Icon */}
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Middle row: Big Metric Value & Percentage Badge */}
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                card.color === "emerald"
                  ? "bg-emerald-100 text-emerald-800"
                  : card.color === "blue"
                  ? "bg-blue-100 text-blue-800"
                  : card.color === "amber"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-800"
              }`}>
                {card.percentage}
              </span>
            </div>

            {/* Bottom row: Subtext info */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{card.subtext}</span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
