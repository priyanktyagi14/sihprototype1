"use client";

import React, { useState, useEffect } from "react";
import { CleanedMaterialItem } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { showToast } from "@/components/shared/Toast";
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowDown,
  Copy,
  Check,
  FileCode,
  Layers,
  HelpCircle,
  Wand2,
  Tag,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface TransformationDetailsModalProps {
  item: CleanedMaterialItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransformationDetailsModal: React.FC<TransformationDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [copiedCleaned, setCopiedCleaned] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleCopyCleaned = () => {
    navigator.clipboard.writeText(item.cleanedDescription);
    setCopiedCleaned(true);
    showToast({
      type: "success",
      title: "Copied to Clipboard",
      message: `Cleaned description for ${item.materialCode} copied successfully.`,
    });
    setTimeout(() => setCopiedCleaned(false), 2000);
  };

  const handleCopyJSON = () => {
    const auditPayload = {
      material_id: item.materialCode,
      cpse: item.cpse,
      raw_description: item.rawDescription,
      standardized_description: item.cleanedDescription,
      transformations_applied: item.changesMade,
      processing_status: item.processingStatus,
      category: item.category,
      unit: item.unit,
      raw_attributes: item.rawRow,
      standardized_at: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(auditPayload, null, 2));
    setCopiedJSON(true);
    showToast({
      type: "info",
      title: "Audit JSON Copied",
      message: "Complete transformation trace payload copied to clipboard.",
    });
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  // Helper to parse individual transformation step details
  const getParsedTransformations = (changes: string[]) => {
    if (!changes || changes.length === 0) {
      return [
        {
          title: "No Changes Required",
          detail: "Material description conforms to standard industrial syntax.",
          type: "standard",
        },
      ];
    }

    return changes.map((change) => {
      if (change.toLowerCase().includes("lowercase")) {
        return {
          title: "Converted text to lowercase",
          detail: "Unified mixed and uppercase characters for canonical indexing.",
          type: "case",
        };
      }
      if (change.toLowerCase().includes("special character")) {
        return {
          title: "Removed unnecessary special characters",
          detail: "Sanitized trailing noise symbols (!, @, #, $, extra punctuation) while preserving technical notations.",
          type: "sanitize",
        };
      }
      if (change.toLowerCase().includes("abbreviation")) {
        return {
          title: "Expanded abbreviation",
          detail: change.replace(/^Expanded abbreviation:?\s*/i, ""),
          type: "abbreviation",
        };
      }
      if (change.toLowerCase().includes("dimension")) {
        return {
          title: "Standardized dimension formatting",
          detail: change.replace(/^Standardized dimension formatting:?\s*/i, ""),
          type: "dimension",
        };
      }
      if (change.toLowerCase().includes("unit") || change.toLowerCase().includes("separated number")) {
        return {
          title: "Normalized measurement unit",
          detail: change.replace(/^Normalized measurement unit:?\s*/i, "").replace(/^Separated number and unit:?\s*/i, ""),
          type: "unit",
        };
      }
      return {
        title: change,
        detail: "Applied deterministic standardization rule.",
        type: "general",
      };
    });
  };

  const transformations = getParsedTransformations(item.changesMade);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Wand2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Transformation Details & Audit Trace
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  7-Step Pipeline
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                <span className="font-mono font-bold text-indigo-200">{item.materialCode}</span>
                <span>•</span>
                <CPSEBadge cpse={item.cpse as any} size="sm" />
                {item.category && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">{item.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* 0. NATIONAL MATERIAL HARMONIZATION CARD */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-sm border border-indigo-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> National Material Master Harmonization
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {item.aiEquivalenceResult || item.rawRow?.AI_Equivalence_Result || "Harmonized Physical Entity"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-300">National Material Code</span>
                <div className="font-mono text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span className="bg-indigo-600/80 px-2 py-0.5 rounded-lg border border-indigo-400/50">
                    {item.nationalMaterialCode || item.rawRow?.Standard_Material_ID || item.rawRow?.national_material_code || "NMC-000001"}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-300">Enterprise Traceability</span>
                <div className="text-xs text-slate-200 font-medium">
                  CPSE: <strong className="text-white font-mono">{item.cpse}</strong> | Legacy Code: <strong className="text-white font-mono">{item.materialCode}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 1. VISUAL BEFORE -> AFTER COMPARISON BOX */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Before → After Standardization Comparison
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {item.changesMade.length} Transformations Applied
              </span>
            </div>

            {/* Visual Box Container */}
            <div className="flex flex-col items-center gap-3">
              {/* RAW INPUT BOX */}
              <div className="w-full rounded-xl bg-white border border-rose-200/70 p-4 shadow-2xs space-y-1.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                    Raw Description (Input)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.rawDescription.length} characters
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm text-slate-900 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 font-semibold break-words">
                  {item.rawDescription || <span className="text-slate-400 italic">Empty string</span>}
                </div>
              </div>

              {/* FLOW ARROW & CLEANING BADGE */}
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                <span>CLEANING ENGINE</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </div>

              {/* STANDARDIZED OUTPUT BOX */}
              <div className="w-full rounded-xl bg-gradient-to-br from-indigo-50/70 to-emerald-50/40 border border-indigo-200 p-4 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                    Standardized Description (Output)
                  </span>
                  <button
                    onClick={handleCopyCleaned}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedCleaned ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs sm:text-sm text-slate-900 bg-white p-2.5 rounded-lg border border-indigo-200 font-bold break-words shadow-inner">
                  {item.cleanedDescription || <span className="text-slate-400 italic">No output</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CHRONOLOGICAL PROCESSING PIPELINE TRACE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Processing Pipeline Trace
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Deterministic Rule Audit</span>
            </h4>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
              {transformations.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-slate-50/80 transition-colors text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 font-bold mt-0.5 shadow-2xs">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">{step.title}</span>
                      <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Step {idx + 1}
                      </span>
                    </div>
                    {step.detail && (
                      <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SIH EXPLAINABILITY CARDS: WHAT, WHY, FINAL OUTPUT */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                SIH Standardization Explainability Matrix
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide text-indigo-700">
                  1. What Was Changed?
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.changesMade.length} transformations executed including casing, noise removal, and abbreviation expansions.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide text-indigo-700">
                  2. Why Was It Changed?
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  To eliminate legacy vendor shorthand and conform to national ISO / IS interoperability standards across all CPSEs.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide text-indigo-700">
                  3. Final Master Output
                </span>
                <p className="text-[11px] font-mono text-emerald-800 font-semibold truncate">
                  {item.cleanedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copiedJSON ? <Check className="w-4 h-4 text-emerald-600" /> : <FileCode className="w-4 h-4 text-indigo-600" />}
            <span>{copiedJSON ? "JSON Audit Copied!" : "Export Audit JSON"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCleaned}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedCleaned ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>Copy Cleaned Description</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
