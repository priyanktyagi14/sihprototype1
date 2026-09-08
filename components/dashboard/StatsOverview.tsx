"use client";

import React from "react";
import { Database, Cpu, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { INITIAL_DATA_QUALITY_STATS } from "@/lib/mockData";

export const StatsOverview: React.FC = () => {
  const stats = [
    {
      id: "total",
      label: "Total Material Records",
      value: formatNumber(INITIAL_DATA_QUALITY_STATS.totalRecords),
      subtext: "+12.4% from last ingestion batch",
      icon: Database,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-100",
      accentBorder: "hover:border-blue-300",
    },
    {
      id: "processed",
      label: "Records Processed",
      value: formatNumber(INITIAL_DATA_QUALITY_STATS.recordsProcessed),
      subtext: "88.9% automation throughput",
      icon: Cpu,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-100",
      accentBorder: "hover:border-indigo-300",
    },
    {
      id: "cleaned",
      label: "Successfully Cleaned",
      value: formatNumber(INITIAL_DATA_QUALITY_STATS.successfullyCleaned),
      subtext: "91.9% accuracy score rate",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-100",
      accentBorder: "hover:border-emerald-300",
    },
    {
      id: "pending",
      label: "Pending Review",
      value: formatNumber(INITIAL_DATA_QUALITY_STATS.pendingReview),
      subtext: "Manual quality check required",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-100",
      accentBorder: "hover:border-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all duration-200 ${stat.accentBorder} hover:shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${stat.iconBg}`}
            >
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{stat.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
