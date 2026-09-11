"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MaterialRecord } from "@/lib/types";
import { CPSEBadge } from "../shared/CPSEBadge";
import { StatusBadge } from "../shared/StatusBadge";
import {
  ArrowUpRight,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";
import { showToast } from "../shared/Toast";

interface MasterDataOverviewTableProps {
  records: MaterialRecord[];
}

export const RecentActivityTable: React.FC<MasterDataOverviewTableProps> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord | null>(null);
  const displayRecords = records.slice(0, 8);

  const handleQuickApprove = (rec: MaterialRecord) => {
    showToast({
      type: "success",
      title: "Record Approved",
      message: `${rec.materialCode} committed to National Material Master.`,
    });
  };

  const handleQuickFlag = (rec: MaterialRecord) => {
    showToast({
      type: "warning",
      title: "Flagged for Auditor Review",
      message: `${rec.materialCode} added to HITL Review Queue.`,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9FE] shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Master Data Overview
            </h3>
            <span className="text-[10px] font-bold text-[#582C87] bg-[#F3E8FF] px-2 py-0.5 rounded-full border border-[#EDE9FE]">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-CPSE material descriptions harmonized with confidence scores & audit verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/material-data/cleaned"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#582C87] bg-[#F3E8FF]/60 hover:bg-[#F3E8FF] border border-[#EDE9FE] transition-colors"
          >
            <span>View Harmonized Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-[#FAF5FF]/60 text-[11px] font-bold uppercase tracking-wider text-[#582C87] border-b border-[#EDE9FE]">
            <tr>
              <th className="py-3 px-4">CPSE</th>
              <th className="py-3 px-4">Material Code</th>
              <th className="py-3 px-4">Raw Description</th>
              <th className="py-3 px-4">Standardized Output</th>
              <th className="py-3 px-4 text-center">Confidence</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRecords.map((item, idx) => {
              const confidence = item.confidenceScore || 92;
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-[#FAF5FF]/40 transition-colors ${
                    idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {/* CPSE Tag */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CPSEBadge cpse={item.cpse} />
                  </td>

                  {/* Material Code */}
                  <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900 whitespace-nowrap">
                    {item.materialCode}
                  </td>

                  {/* Raw Description */}
                  <td
                    className="py-3 px-4 max-w-[220px] lg:max-w-[280px] truncate font-mono text-slate-600 text-[11px]"
                    title={item.rawDescription}
                  >
                    {item.rawDescription}
                  </td>

                  {/* Standardized Description */}
                  <td
                    className="py-3 px-4 max-w-[240px] lg:max-w-[320px] truncate text-slate-900 font-medium text-xs"
                    title={item.cleanedDescription}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#7C3AED] shrink-0" />
                      <span className="truncate">{item.cleanedDescription}</span>
                    </div>
                  </td>

                  {/* Confidence Score Bar & Badge */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            confidence >= 90
                              ? "bg-emerald-500"
                              : confidence >= 75
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          confidence >= 90
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : confidence >= 75
                            ? "text-amber-800 bg-amber-50 border border-amber-200"
                            : "text-rose-700 bg-rose-50 border border-rose-200"
                        }`}
                      >
                        {confidence}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(item)}
                        title="Inspect Transformations"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#582C87] hover:bg-[#F3E8FF] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(item)}
                        title="Commit Standard"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFlag(item)}
                        title="Flag for Review"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch Execution Footer Bar */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-[#FAF5FF]/50 border-t border-[#EDE9FE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Layers className="w-4 h-4 text-[#582C87]" />
          <span>
            Displaying <strong>{displayRecords.length}</strong> of{" "}
            <strong>{records.length}</strong> active CPSE records in this session
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link
            href="/ai-standardization/data-cleaning"
            className="px-3.5 py-1.5 rounded-xl bg-[#582C87] hover:bg-[#7C3AED] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Harmonization Batch</span>
          </Link>
        </div>
      </div>

      {/* Inline Quick Audit Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EDE9FE] shadow-xl p-5 sm:p-6 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CPSEBadge cpse={selectedRecord.cpse} />
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedRecord.materialCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Raw CPSE Input Description
                </span>
                <p className="font-mono text-slate-800 font-medium">
                  {selectedRecord.rawDescription}
                </p>
              </div>

              <div className="p-3 bg-[#F3E8FF]/60 rounded-xl border border-[#EDE9FE] space-y-1">
                <span className="text-[10px] font-bold text-[#582C87] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Standardized Noun-Modifier Format
                </span>
                <p className="font-semibold text-slate-900">
                  {selectedRecord.cleanedDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Confidence Score</span>
                  <span className="font-bold text-emerald-700">
                    {selectedRecord.confidenceScore || 95}% Deterministic
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-bold text-slate-800">
                    {selectedRecord.category || "General"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleQuickApprove(selectedRecord);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 bg-[#582C87] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Confirm Standard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
