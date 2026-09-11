"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { CleaningSummaryCards } from "@/components/cleaning/CleaningSummaryCards";
import { CleaningResultsTable } from "@/components/cleaning/CleaningResultsTable";
import { LiveCleaningSimulator } from "@/components/cleaning/LiveCleaningSimulator";
import { BackendStatusBadge } from "@/components/shared/BackendStatusBadge";
import {
  getLatestCleaningResults,
  saveCleaningResults,
  generateDefaultCleaningResults,
} from "@/lib/cleaningStore";
import { CleaningStoreState } from "@/lib/types";
import { showToast } from "@/components/shared/Toast";
import {
  Sparkles,
  UploadCloud,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Wand2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export default function DataCleaningResultsPage() {
  const [cleaningState, setCleaningState] = useState<CleaningStoreState | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load cleaning state on mount
  useEffect(() => {
    const stored = getLatestCleaningResults();
    if (stored && stored.items.length > 0) {
      setCleaningState(stored);
    } else {
      // Initialize with default standard dataset if user navigated directly
      const defaultState = generateDefaultCleaningResults();
      setCleaningState(defaultState);
      saveCleaningResults(defaultState);
    }

    // Listen to custom updates from upload page
    const handleStateUpdate = (e: Event) => {
      const custom = e as CustomEvent<CleaningStoreState>;
      if (custom.detail) {
        setCleaningState(custom.detail);
      }
    };

    window.addEventListener("sih_cleaning_state_updated", handleStateUpdate);
    return () => window.removeEventListener("sih_cleaning_state_updated", handleStateUpdate);
  }, []);

  const handleResetToDefault = () => {
    setIsRefreshing(true);
    const defaultState = generateDefaultCleaningResults();
    setCleaningState(defaultState);
    saveCleaningResults(defaultState);
    showToast({
      type: "info",
      title: "Sample Results Loaded",
      message: "Restored multi-CPSE industrial sample catalog.",
    });
    setTimeout(() => setIsRefreshing(false), 400);
  };

  if (!cleaningState) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Loading Data Cleaning Results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Data Cleaning Results"
        description="Review AI-assisted preprocessing and standardization applied to material descriptions."
        breadcrumbs={[
          { label: "AI Standardization" },
          { label: "Data Cleaning Results" },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cleaningState.metrics.totalRecords} Records Cleaned</span>
            </span>
            <BackendStatusBadge />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Upload New Batch Button */}
            <Link
              href="/material-data/upload"
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Upload New CSV</span>
            </Link>

            {/* Toggle Single Description Test Simulator */}
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{showSimulator ? "Hide Simulator" : "Test Single String"}</span>
              {showSimulator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Reset / Reload Sample */}
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isRefreshing}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Reload default sample dataset"
            >
              <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        }
      />

      {/* 2. RUN SUMMARY HEADER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white text-slate-800 shadow-xs border border-[#EDE9FE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] border border-[#EDE9FE] flex items-center justify-center text-[#582C87] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Batch Metadata:</span>
              <strong className="text-[#0F172A] font-mono font-bold">{cleaningState.datasetName}</strong>
              {cleaningState.metrics.isFallbackMode ? (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-50 text-[#582C87] border border-[#EDE9FE] font-bold">
                  Deterministic Rule Engine
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  FastAPI Live Engine
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Source column mapped: <code className="bg-slate-100 text-[#582C87] px-1.5 py-0.2 rounded font-mono font-bold">{cleaningState.metrics.detectedDescriptionColumn}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs self-start sm:self-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Processing Latency</span>
            <strong className="text-[#0F172A] font-mono font-bold">{cleaningState.metrics.processingTimeMs} ms</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50/50 border border-[#EDE9FE]">
            <span className="text-[10px] text-[#582C87] block uppercase font-bold">Deterministic Match</span>
            <strong className="text-[#582C87] font-mono font-bold">{cleaningState.metrics.successRate}% Score</strong>
          </div>
        </div>
      </div>

      {/* 3. TOP SUMMARY CARDS (Processed, Cleaned, Modified, Requiring Review) */}
      <CleaningSummaryCards metrics={cleaningState.metrics} />

      {/* 4. OPTIONAL COLLAPSIBLE INTERACTIVE TEST SIMULATOR */}
      {showSimulator && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-200">
          <LiveCleaningSimulator />
        </div>
      )}

      {/* 5. MAIN RESULTS TABLE & AUDIT MODAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Standardized Master Catalog Records</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {cleaningState.items.length} Total
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Click &quot;View Details&quot; on any row to inspect the complete 7-step transformation audit trail and before/after comparisons.
            </p>
          </div>
        </div>

        <CleaningResultsTable
          items={cleaningState.items}
          datasetName={cleaningState.datasetName}
          sourceCPSE={cleaningState.metrics.sourceCPSE}
        />
      </div>
    </div>
  );
}
