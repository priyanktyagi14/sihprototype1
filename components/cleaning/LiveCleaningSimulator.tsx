"use client";

import React, { useState } from "react";
import { cleanMaterialDescription, CleaningSimulationResult } from "@/lib/cleaningRules";
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Copy, Check, FileCode, Wand2 } from "lucide-react";

export const LiveCleaningSimulator: React.FC = () => {
  const samplePresets = [
    { label: "ONGC Fastener", text: "SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR" },
    { label: "BHEL Fastener", text: "STAINLESS STEEL HEXAGONAL BOLT M10 X 50MM GRADE 316" },
    { label: "NTPC Flange", text: "CS FLG WNRF 150# 4\" SCH 40 ASTM A105" },
    { label: "IOCL Valve", text: "BALL VLV 2\" 300# FLGD END BODY A216 WCB TRIM SS316" },
    { label: "SAIL Plate", text: "MS PLT 25MM THK IS 2062 E250 BR 2500X10000MM" },
    { label: "GAIL Gasket", text: "SPIRAL WOUND GASK 3\" 600# ASME B16.20 HOOPOUTERING SS316" },
  ];

  const [inputRaw, setInputRaw] = useState("SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR");
  const [result, setResult] = useState<CleaningSimulationResult>(() =>
    cleanMaterialDescription("SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR")
  );
  const [copied, setCopied] = useState(false);

  const handleRunCleaning = (text: string) => {
    setInputRaw(text);
    const cleaned = cleanMaterialDescription(text);
    setResult(cleaned);
  };

  const handleCopy = () => {
    if (!result.cleaned) return;
    navigator.clipboard.writeText(result.cleaned);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Live Data Cleaning & Normalization Engine</h2>
          <p className="text-xs text-slate-300">
            Test how raw CPSE descriptions are parsed, expanded, and converted to standardized terminology in real-time.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-slate-400 mr-1 font-medium">Quick Presets:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleRunCleaning(preset.text)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Input Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Raw Material Description Input
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputRaw}
              onChange={(e) => handleRunCleaning(e.target.value)}
              placeholder="e.g. SS HEX BOLT M10X50 MM WITH NUT..."
              className="w-full px-4 py-3 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-colors"
            />
            {inputRaw && (
              <button
                onClick={() => handleRunCleaning("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-200/60"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Output Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Raw Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Raw Ingested Text</span>
              <span className="text-[11px] text-slate-400 font-mono">{inputRaw.length} chars</span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 break-words min-h-[50px] flex items-center">
              {inputRaw || <span className="text-slate-400 italic">Type a description above to simulate...</span>}
            </div>
          </div>

          {/* Standardized Panel */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Standardized Master Description
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Score: {result.confidenceScore}%
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                  title="Copy cleaned string"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-indigo-200 font-medium text-xs sm:text-sm text-slate-900 break-words min-h-[50px] flex items-center">
              {result.cleaned || <span className="text-slate-400 italic">Waiting for input...</span>}
            </div>
          </div>
        </div>

        {/* Rule Breakdown & Detections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Abbreviations */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">
              Abbreviations Resolved ({result.detectedAbbreviations.length})
            </span>
            {result.detectedAbbreviations.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">No shorthand detected.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {result.detectedAbbreviations.map((abbr, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-[11px] font-medium"
                  >
                    {abbr}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Units */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">
              SI Units Standardized ({result.standardizedUnits.length})
            </span>
            {result.standardizedUnits.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">Standard units preserved.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {result.standardizedUnits.map((u, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[11px] font-medium"
                  >
                    {u}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Taxonomy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Taxonomy Deductions</span>
            <div className="space-y-1">
              <div className="text-slate-500">
                Class: <span className="font-semibold text-slate-900">{result.taxonomySuggested.category}</span>
              </div>
              <div className="text-slate-500">
                Sub-Class: <span className="font-semibold text-slate-900">{result.taxonomySuggested.subCategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Transformation Log */}
        {result.stepsApplied.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-indigo-600" /> Pipeline Transformation Execution Trace
            </h4>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {result.stepsApplied.map((step, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-mono font-bold text-slate-600 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{step.stepName}</span>
                      <p className="text-[11px] text-slate-500">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                    <span className="text-rose-600 line-through max-w-[120px] truncate">{step.originalFragment}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-emerald-700 font-bold max-w-[150px] truncate">{step.replacedFragment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
