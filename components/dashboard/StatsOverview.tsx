"use client";

import React from "react";
import {
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { INITIAL_DATA_QUALITY_STATS } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";

export const StatsOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Cataloged */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 sm:p-5 shadow-xs hover:border-[#7C3AED]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cataloged
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#582C87] border border-purple-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              Continuous Sync
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-slate-900">
                {formatNumber(INITIAL_DATA_QUALITY_STATS.totalRecords)} records
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Across 7 enterprise nodes</p>
            </div>
          </div>
        </div>

        {/* Sparkline & Trend */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% trajectory</span>
            </div>
            {/* Sparkline SVG */}
            <svg className="w-20 h-5 overflow-visible" viewBox="0 0 80 20">
              <path
                d="M 0 15 Q 15 12 30 14 T 50 8 T 70 5 L 80 2"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="80" cy="2" r="2.5" fill="#582C87" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Processing Throughput */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 sm:p-5 shadow-xs hover:border-[#7C3AED]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Processing Flow
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-slate-900">
                {formatNumber(INITIAL_DATA_QUALITY_STATS.recordsProcessed)} processed
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">88.9% automation flow</p>
            </div>
          </div>
        </div>

        {/* Completion Flow Indicator */}
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#582C87] to-[#7C3AED] rounded-full"
              style={{ width: "88.9%" }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Latency: 16.2 ms/rec</span>
            <span className="text-[#582C87] font-semibold">High Efficiency</span>
          </div>
        </div>
      </div>

      {/* 3. Normalized Records */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 sm:p-5 shadow-xs hover:border-[#7C3AED]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Normalized Records
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              96.2% Accuracy
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-slate-900">
                {formatNumber(INITIAL_DATA_QUALITY_STATS.successfullyCleaned)} standardized
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Deterministic 7-step rules</p>
            </div>
          </div>
        </div>

        {/* Mini Distribution Chart */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-2 h-4 rounded-xs bg-[#582C87]" />
              <span className="w-2 h-5 rounded-xs bg-[#7C3AED]" />
              <span className="w-2 h-3.5 rounded-xs bg-purple-300" />
              <span className="w-2 h-6 rounded-xs bg-[#7C3AED]" />
              <span className="w-2 h-5 rounded-xs bg-[#582C87]" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Optimal Health
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pending Review */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 sm:p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              HITL Alert
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-slate-900">
                {INITIAL_DATA_QUALITY_STATS.pendingReview} flagged items
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Human-in-the-loop review</p>
            </div>
          </div>
        </div>

        {/* Flag status line & prompt */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            High Priority Queue
          </span>
          <span className="text-[10px] text-slate-400 font-medium">9.1% of batch</span>
        </div>
      </div>
    </div>
  );
};
