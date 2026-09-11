import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import Link from "next/link";
import { Sparkles, UploadCloud } from "lucide-react";

export default function RawMaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Material Records"
        description="Unprocessed legacy material master records directly ingested from CPSE ERP dumps. These records contain abbreviations, non-standard units, and irregular delimiters."
        breadcrumbs={[{ label: "Material Data" }, { label: "Raw Materials" }]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/material-data/upload"
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-[#582C87]" />
              <span>Upload New Batch</span>
            </Link>
            <Link
              href="/ai-standardization/data-cleaning"
              className="px-3.5 py-2 bg-[#1E0E38] hover:bg-[#2C1752] text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Start Data Cleaning</span>
            </Link>
          </div>
        }
      />

      <DataTable
        data={MOCK_MATERIALS}
        initialStatus="ALL"
        title="Ingested Raw Records Catalog"
        subtitle="Filter by CPSE, search for specific material codes, or inspect detected quality anomalies"
      />
    </div>
  );
}

