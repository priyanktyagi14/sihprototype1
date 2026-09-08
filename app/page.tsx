import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AIPipelineProgress } from "@/components/dashboard/AIPipelineProgress";
import { ProcessingChart } from "@/components/dashboard/ProcessingChart";
import { DataQualityMetrics } from "@/components/dashboard/DataQualityMetrics";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import Link from "next/link";
import { Sparkles, UploadCloud, ArrowRight, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / SIH Project Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart India Hackathon (SIH) Prototype</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              AI-Driven Standardization & Harmonization of Material Codes Across CPSEs
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Harmonizing inconsistent legacy material descriptions across ONGC, BHEL, NTPC, IOCL, SAIL, GAIL, and CIL
              into a unified National Material Master catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/ai-standardization/data-cleaning"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Test Cleaning Workbench</span>
            </Link>
            <Link
              href="/material-data/upload"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 border border-white/15 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Dataset</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <StatsOverview />

      {/* AI Pipeline Architecture Stage Tracker */}
      <AIPipelineProgress />

      {/* Analytics & Quality Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingChart />
        <DataQualityMetrics />
      </div>

      {/* Recent Processing Activity Table */}
      <RecentActivityTable records={MOCK_MATERIALS} />
    </div>
  );
}
