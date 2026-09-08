import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import { XCircle } from "lucide-react";

export default function RejectedRecordsPage() {
  const rejectedRecords = MOCK_MATERIALS.filter((m) => m.status === "rejected");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Center: Rejected Records"
        description="Records that failed quality audits due to missing physical specs, corrupted data strings, or severe formatting anomalies."
        breadcrumbs={[{ label: "Review Center" }, { label: "Rejected Records" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>{rejectedRecords.length} Flagged / Rejected</span>
          </span>
        }
      />

      <DataTable
        data={rejectedRecords}
        initialStatus="rejected"
        title="Rejected Records Log"
        subtitle="Review rejection reasons and auditor remediation notes"
      />
    </div>
  );
}
