"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";
import { INITIAL_DATA_QUALITY_STATS } from "@/lib/mockData";
import { FileText, Ruler, Wand2, AlertTriangle, ShieldCheck } from "lucide-react";

export const DataQualityMetrics: React.FC = () => {
  const qualityItems = [
    {
      id: "abbr",
      label: "Abbreviations Expanded",
      count: formatNumber(INITIAL_DATA_QUALITY_STATS.abbreviationsExpanded),
      subtext: "Shorthands like SS, HEX, CS, WNRF normalized",
      icon: FileText,
      color: "text-[#582C87]",
      bg: "bg-[#F3E8FF] border-[#EDE9FE]",
      progress: 94,
      progressColor: "bg-[#582C87]",
    },
    {
      id: "units",
      label: "Units Standardized to SI",
      count: formatNumber(INITIAL_DATA_QUALITY_STATS.unitsStandardized),
      subtext: "Conversions from MM, MTR, LBS, INCH to SI",
      icon: Ruler,
      color: "text-[#7C3AED]",
      bg: "bg-purple-50 border-purple-100",
      progress: 89,
      progressColor: "bg-[#7C3AED]",
    },
    {
      id: "formatting",
      label: "Syntax & Spacing Standardized",
      count: formatNumber(INITIAL_DATA_QUALITY_STATS.formattingFixed),
      subtext: "Whitespace, delimiter inconsistencies resolved",
      icon: Wand2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      progress: 96,
      progressColor: "bg-emerald-600",
    },
    {
      id: "review",
      label: "Manual Review Flagged",
      count: `${INITIAL_DATA_QUALITY_STATS.manualReviewRequired}%`,
      subtext: `${formatNumber(INITIAL_DATA_QUALITY_STATS.pendingReview)} items flagged below confidence threshold`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
      progress: 8.1,
      progressColor: "bg-amber-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Data Quality Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key transformations performed by the automated cleaning pipeline
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Health Score: 94.8%</span>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {qualityItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                  <p className="text-[11px] text-slate-500">{item.subtext}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono shrink-0">{item.count}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${item.progressColor}`}
                  style={{ width: `${Math.min(100, item.progress)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

