"use client";

import React from "react";
import {
  Database,
  Columns,
  Building2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { DatasetSummaryStats } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { CPSE } from "@/lib/types";

interface DatasetSummaryProps {
  summary: DatasetSummaryStats;
}

export const DatasetSummary: React.FC<DatasetSummaryProps> = ({ summary }) => {
  const {
    totalRecords,
    totalColumns,
    cpseCount,
    cpseList,
    missingValuesCount,
    dataQualityScore,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Records */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Records
          </p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalRecords.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            Parsed material master entries
          </p>
        </div>
      </div>

      {/* 2. Total Columns */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Columns className="w-6 h-6" />
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Columns
          </p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalColumns}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            Dataset schema headers
          </p>
        </div>
      </div>

      {/* 3. CPSEs Detected */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              CPSEs Detected
            </p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {cpseCount} {cpseCount === 1 ? "Enterprise" : "Enterprises"}
            </p>
          </div>
        </div>

        {/* CPSE Badges Pill Row */}
        <div className="flex items-center gap-1 flex-wrap pt-2">
          {cpseList.slice(0, 4).map((cpse) => (
            <span
              key={cpse}
              className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200"
            >
              {cpse}
            </span>
          ))}
          {cpseList.length > 4 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{cpseList.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* 4. Missing Values / Quality Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-colors">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            dataQualityScore >= 90
              ? "bg-emerald-50 text-emerald-600"
              : dataQualityScore >= 75
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {dataQualityScore >= 90 ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Missing Values
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {missingValuesCount.toLocaleString()}
            </p>
            <span
              className={`text-xs font-bold ${
                dataQualityScore >= 90
                  ? "text-emerald-700"
                  : dataQualityScore >= 75
                  ? "text-amber-700"
                  : "text-rose-700"
              }`}
            >
              ({dataQualityScore}% Quality)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {missingValuesCount === 0 ? "Clean complete dataset" : "Cells requiring imputation"}
          </p>
        </div>
      </div>
    </div>
  );
};
