"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MOCK_MATERIALS } from "@/lib/mockData";
import { MaterialRecord } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function PendingReviewPage() {
  const [records, setRecords] = useState<MaterialRecord[]>(() =>
    MOCK_MATERIALS.filter((m) => m.status === "pending_review")
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSuccessToast(`Record ${id} successfully approved and committed to Cleaned Master!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleReject = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSuccessToast(`Record ${id} flagged as rejected and sent back to source CPSE.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Center: Pending Queue"
        description="Records flagged by automated quality audits for human verification due to low confidence scores, ambiguous technical abbreviations, or non-standard specs."
        breadcrumbs={[{ label: "Review Center" }, { label: "Pending Review" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{records.length} Action Items Pending</span>
          </span>
        }
      />

      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Items Cards */}
      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Pending Review Queue is Empty!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All material master records have been verified. Great job maintaining high data quality across CPSEs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-sm text-slate-900">{item.materialCode}</span>
                  <CPSEBadge cpse={item.cpse} />
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    Confidence: {item.confidenceScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                </div>

                {/* Approve / Reject Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Record</span>
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Harmonize</span>
                  </button>
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Raw CPSE Input
                  </span>
                  <p className="font-mono text-slate-800 font-medium">{item.rawDescription}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-1">
                  <span className="text-indigo-700 font-bold uppercase tracking-wider block text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Proposed Standard
                  </span>
                  <p className="text-slate-900 font-semibold">{item.cleanedDescription}</p>
                </div>
              </div>

              {/* Audit Flag Reason */}
              {item.reviewNote && (
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Audit Flag Reason: </span>
                    <span>{item.reviewNote}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
