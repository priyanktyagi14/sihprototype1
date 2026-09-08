import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LiveCleaningSimulator } from "@/components/cleaning/LiveCleaningSimulator";
import { DataTable } from "@/components/shared/DataTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import { Sparkles, Play, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

export default function DataCleaningPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Cleaning & Normalization Workbench"
        description="The active stage of the harmonization pipeline. Applies industrial rule dictionaries, SI unit standardization, delimiter parsing, and whitespace normalization."
        breadcrumbs={[{ label: "AI Standardization" }, { label: "Data Cleaning" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Module
          </span>
        }
        actions={
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors">
            <Play className="w-4 h-4 fill-current" />
            <span>Run Batch Cleaning Pipeline</span>
          </button>
        }
      />

      {/* Interactive Simulator Component */}
      <LiveCleaningSimulator />

      {/* Standardized Master Catalog Preview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Standardized Master Records</h3>
            <p className="text-xs text-slate-500">Live view of CPSE records processed through the cleaning engine</p>
          </div>
        </div>

        <DataTable
          data={MOCK_MATERIALS}
          initialStatus="ALL"
          title="Cleaned Material Master Catalog"
          subtitle="Showing unified descriptions alongside original legacy CPSE strings"
        />
      </div>
    </div>
  );
}
