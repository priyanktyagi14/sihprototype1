"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MOCK_MATERIALS, CPSE_PROFILES } from "@/lib/mockData";
import { MaterialRecord } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Eye,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  ArrowRight,
  Edit3,
  RotateCcw,
  Layers,
  ChevronRight,
  Send,
} from "lucide-react";
import { showToast } from "@/components/shared/Toast";

export default function PendingReviewPage() {
  const [records, setRecords] = useState<MaterialRecord[]>(() =>
    MOCK_MATERIALS.filter((m) => m.status === "pending_review")
  );
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCPSE, setSelectedCPSE] = useState("ALL");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    if (selectedCPSE !== "ALL" && r.cpse !== selectedCPSE) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.materialCode.toLowerCase().includes(q) ||
        r.rawDescription.toLowerCase().includes(q) ||
        r.cleanedDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDrawer = (rec: MaterialRecord) => {
    setSelectedRecord(rec);
    setEditedDescription(rec.cleanedDescription);
    setIsDrawerOpen(true);
  };

  const handleApprove = (id: string, customDesc?: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setIsDrawerOpen(false);
    showToast({
      type: "success",
      title: "Record Approved & Harmonized",
      message: `${id} committed to Cleaned Material Master with 100% human audit verified score.`,
    });
  };

  const handleReject = (id: string, reason?: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setIsDrawerOpen(false);
    showToast({
      type: "warning",
      title: "Record Sent to Ingestion Queue",
      message: `${id} routed back to enterprise source with auditor feedback.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Human-in-the-Loop Workbench"
        description="Review and resolve flagged CPSE edge cases with low cosine similarity, ambiguous technical abbreviations, or non-standard thread/flange ratings."
        breadcrumbs={[{ label: "Review Center" }, { label: "Pending Review" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#582C87] border border-[#EDE9FE]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{records.length} Action Items Pending</span>
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#EDE9FE] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by material code, raw text or standard..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedCPSE}
            onChange={(e) => setSelectedCPSE(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="ALL">All CPSE Enterprises</option>
            {CPSE_PROFILES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Items List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EDE9FE] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F3E8FF] text-[#582C87] flex items-center justify-center mx-auto mb-3 border border-[#EDE9FE]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Review Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All flagged CPSE edge cases have been resolved by human-in-the-loop audit verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-xs hover:border-[#7C3AED]/50 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {item.materialCode}
                  </span>
                  <CPSEBadge cpse={item.cpse} />
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Cosine Match: {item.confidenceScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(item)}
                    className="px-3 py-1.5 rounded-xl border border-[#EDE9FE] bg-[#F3E8FF]/60 hover:bg-[#F3E8FF] text-[#582C87] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Resolution Drawer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#582C87] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>

              {/* Split Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Raw CPSE Material Input
                  </span>
                  <p className="font-mono text-slate-800 font-medium">{item.rawDescription}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F3E8FF]/50 border border-[#EDE9FE] space-y-1">
                  <span className="text-[#582C87] font-bold uppercase tracking-wider block text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Proposed National Standard
                  </span>
                  <p className="text-slate-900 font-semibold">{item.cleanedDescription}</p>
                </div>
              </div>

              {/* Edge Case Flag Reason */}
              {item.reviewNote && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Audit Flag: </span>
                    <span>{item.reviewNote}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RESOLUTION DRAWER (Slide-over panel) */}
      {isDrawerOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-[#EDE9FE] flex flex-col animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF5FF]/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CPSEBadge cpse={selectedRecord.cpse} />
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {selectedRecord.materialCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Auditor Resolution Drawer</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                {/* 1. Raw Input */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Source Raw Description
                  </span>
                  <p className="font-mono text-slate-800 text-xs font-semibold leading-relaxed">
                    {selectedRecord.rawDescription}
                  </p>
                </div>

                {/* 2. Manual Override Form */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Standardized Description Override
                  </label>
                  <textarea
                    rows={3}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Enter manual standard description..."
                    className="w-full p-3 text-xs bg-white border border-[#EDE9FE] rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Applying an override updates the National Material Catalog and retrains the deterministic matcher.
                  </p>
                </div>

                {/* 3. Taxonomy Attributes Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Extracted Specification Attributes
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Category</span>
                      <strong className="text-slate-800">{selectedRecord.category || "Pipes & Fittings"}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Cosine Confidence</span>
                      <strong className="text-amber-700">{selectedRecord.confidenceScore}%</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Flag Reason */}
                {selectedRecord.reviewNote && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <span className="font-bold block text-xs">Flagged Edge Case</span>
                    <p className="text-[11px] leading-relaxed">{selectedRecord.reviewNote}</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-[#FAF5FF]/30 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleReject(selectedRecord.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
                >
                  Send Back to Queue
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedRecord.id, editedDescription)}
                  className="px-5 py-2 bg-[#582C87] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Approve & Commit Standard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
