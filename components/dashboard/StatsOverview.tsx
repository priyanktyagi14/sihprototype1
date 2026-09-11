"use client";

import React from "react";

export const StatsOverview: React.FC = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metric-flow-indicators">
      {/* Metric Card 1: Total Material Records */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Material Records
          </span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Sparkline Wave SVG */}
        <div className="my-3 h-10 w-full overflow-hidden">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 45">
            <path d="M0 38 Q30 35, 60 28 T120 22 T160 14 L200 12 L200 45 L0 45 Z" fill="#E8EDF5" opacity="0.6"></path>
            <path d="M0 38 Q30 35, 60 28 T120 22 T160 14 L200 12" fill="none" stroke="#8DA2FB" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>

        {/* Status Indicator Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
            Records Ingested (Context Status)
          </span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            - 2%
          </span>
        </div>
      </div>

      {/* Metric Card 2: Records Processed */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Records Processed
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#582C87] flex items-center justify-center border border-purple-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Sparkline Wave SVG */}
        <div className="my-3 h-10 w-full overflow-hidden">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 45">
            <path d="M0 35 Q40 32, 70 20 T130 18 T170 12 L200 8 L200 45 L0 45 Z" fill="#EDE9FE" opacity="0.7"></path>
            <path d="M0 35 Q40 32, 70 20 T130 18 T170 12 L200 8" fill="none" stroke="#8B5CF6" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>

        {/* Status Indicator Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            Automation Throughput (Efficiency Status)
          </span>
          <span className="text-[10px] font-bold text-[#582C87] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            88.0%
          </span>
        </div>
      </div>

      {/* Metric Card 3: Successfully Cleaned */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Successfully Cleaned
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Sparkline Wave SVG */}
        <div className="my-3 h-10 w-full overflow-hidden">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 45">
            <path d="M0 32 Q35 30, 80 18 T140 22 T175 14 L200 10 L200 45 L0 45 Z" fill="#D1FAE5" opacity="0.6"></path>
            <path d="M0 32 Q35 30, 80 18 T140 22 T175 14 L200 10" fill="none" stroke="#10B981" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>

        {/* Status Indicator Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            Data Cleaned (Accuracy Status)
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            92%
          </span>
        </div>
      </div>

      {/* Metric Card 4: Pending Review */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending Review
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Sparkline Wave SVG */}
        <div className="my-3 h-10 w-full overflow-hidden">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 45">
            <path d="M0 38 Q40 36, 75 25 T130 28 T170 18 L200 14 L200 45 L0 45 Z" fill="#FEF3C7" opacity="0.6"></path>
            <path d="M0 38 Q40 36, 75 25 T130 28 T170 18 L200 14" fill="none" stroke="#F59E0B" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>

        {/* Status Indicator Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-600 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
            Manual Review Flag (Attention Status)
          </span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            0%
          </span>
        </div>
      </div>
    </section>
  );
};

