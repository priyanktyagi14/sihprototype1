import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { MOCK_MATERIALS } from "@/lib/mockData";
import { CheckCheck } from "lucide-react";

export default function ApprovedRecordsPage() {
  const approvedRecords = MOCK_MATERIALS.filter((m) => m.status === "approved" || m.status === "cleaned");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Center: Approved Records"
        description="Historical log of all material master records that have passed automated verification or human auditor approval."
        breadcrumbs={[{ label: "Review Center" }, { label: "Approved Records" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{approvedRecords.length} Approved & Harmonized</span>
          </span>
        }
      />

      <DataTable
        data={approvedRecords}
        initialStatus="ALL"
        title="Approved Master Records Archive"
        subtitle="Search approved records with verified UNMC mappings and auditor authorizations"
      />
    </div>
  );
}
