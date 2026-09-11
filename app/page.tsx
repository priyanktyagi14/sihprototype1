import React from "react";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AIPipelineProgress } from "@/components/dashboard/AIPipelineProgress";
import { ProcessingChart } from "@/components/dashboard/ProcessingChart";
import { DataQualityMetrics } from "@/components/dashboard/DataQualityMetrics";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import Link from "next/link";
import { Sparkles, UploadCloud, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero / Notification Strip: Compact white card with light purple border */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EDE9FE] shadow-[0_2px_12px_rgba(88,44,135,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#582C87] border border-[#EDE9FE]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>SIH Edition — Enterprise Material Harmonization</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
            AI-Driven Standardization & Harmonization Across CPSEs
          </h1>
          <p className="text-xs text-[#475569] leading-relaxed">
            Unifying disparate material catalogs across ONGC, BHEL, IOCL, NTPC, GAIL, SAIL & CIL into a deterministic National Material Master.
          </p>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/ai-standardization/data-cleaning"
            className="px-4 py-2 rounded-xl bg-[#582C87] hover:bg-[#7C3AED] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Workbench</span>
          </Link>
          <Link
            href="/material-data/upload"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#582C87]" />
            <span>Ingest Batch</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Sparklines & Status Tags without oversized numbers) */}
      <StatsOverview />

      {/* AI Pipeline Architecture Stage Tracker */}
      <AIPipelineProgress />

      {/* Analytics & Quality Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingChart />
        <DataQualityMetrics />
      </div>

      {/* Master Data Overview Table */}
      <RecentActivityTable records={MOCK_MATERIALS} />
    </div>
  );
}
