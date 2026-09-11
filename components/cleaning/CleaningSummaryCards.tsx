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
      title: "Batch Ingested",
      value: `${metrics.totalRecords.toLocaleString()} rec`,
      percentage: "100%",
      subtext: `Runtime: ${metrics.processingTimeMs} ms`,
      icon: Layers,
      color: "purple",
      borderColor: activeFilter === "all" ? "border-[#582C87] ring-2 ring-[#7C3AED]/20" : "border-[#EDE9FE]",
      textColor: "text-[#582C87]",
      iconBg: "bg-[#F3E8FF] text-[#582C87] border border-[#EDE9FE]",
      badge: "Ingestion Queue",
    },
    {
      id: "cleaned",
      title: "Deterministic Match",
      value: `${metrics.successfullyCleaned.toLocaleString()} rec`,
      percentage: `${metrics.successRate}%`,
      subtext: "Parsed to National taxonomy",
      icon: CheckCircle2,
      color: "emerald",
      borderColor: activeFilter === "cleaned" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-[#EDE9FE]",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      badge: "Rule Engine",
    },
    {
      id: "modified",
      title: "Standardized",
      value: `${metrics.recordsModified.toLocaleString()} rec`,
      percentage: `${metrics.modifiedRate}%`,
      subtext: "Units, abbreviations normalized",
      icon: Wand2,
      color: "violet",
      borderColor: activeFilter === "modified" ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20" : "border-[#EDE9FE]",
      textColor: "text-[#7C3AED]",
      iconBg: "bg-purple-50 text-[#7C3AED] border border-purple-100",
      badge: "Transformed",
    },
    {
      id: "review",
      title: "Requires Review",
      value: `${metrics.recordsRequiringReview.toLocaleString()} rec`,
      percentage: `${metrics.reviewRate}%`,
      subtext: metrics.recordsRequiringReview === 0 ? "Zero edge anomalies" : "HITL verification alert",
      icon: AlertTriangle,
      color: "amber",
      borderColor: activeFilter === "review" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-[#EDE9FE]",
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
            <div className="flex items-center justify-between pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle row: Metric Value & Percentage Badge */}
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                card.color === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : card.color === "violet" || card.color === "purple"
                  ? "bg-[#F3E8FF] text-[#582C87] border border-[#EDE9FE]"
                  : card.color === "amber"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-slate-100 text-slate-800"
              }`}>
                {card.percentage}
              </span>
            </div>

            {/* Bottom row: Subtext info */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate text-[11px]">{card.subtext}</span>
              <span className="text-[10px] font-semibold text-[#582C87] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

