import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import Link from "next/link";
import { Download, Sparkles } from "lucide-react";

export default function CleanedMaterialsPage() {
  const cleanedRecords = MOCK_MATERIALS.filter((m) => m.status === "cleaned" || m.status === "approved");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Standardized & Cleaned Materials Master"
        description="Verified material master catalog with expanded abbreviations, standardized SI units, canonical Title Casing, and mapped National Material Codes (UNMC)."
        breadcrumbs={[{ label: "Material Data" }, { label: "Cleaned Materials" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {cleanedRecords.length} Active Cleaned
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/ai-standardization/data-cleaning"
              className="px-3.5 py-2 bg-[#1E0E38] hover:bg-[#2C1752] text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Run Cleaning Workbench</span>
            </Link>
          </div>
        }
      />

      <DataTable
        data={cleanedRecords}
        initialStatus="ALL"
        title="Cleaned Material Master Catalog"
        subtitle="Search standardized descriptions, standard units of measure, and mapped National Material Codes"
      />
    </div>
  );
}

