"use client";

import React from "react";
import { PIPELINE_STAGES } from "@/lib/mockData";
import {
  UploadCloud,
  Sparkles,
  Cpu,
  Layers,
  Network,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Info,
} from "lucide-react";

export const AIPipelineProgress: React.FC = () => {
  const getIcon = (iconName: string, isActive: boolean) => {
    switch (iconName) {
      case "UploadCloud":
        return <UploadCloud className="w-4 h-4 text-blue-600" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />;
      case "FileSearch":
      case "Cpu":
        return <Cpu className="w-4 h-4 text-slate-500" />;
      case "Network":
        return <Network className="w-4 h-4 text-slate-500" />;
      case "CheckCircle2":
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">AI Standardization & Harmonization Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end multi-stage architecture from raw legacy CPSE descriptions to National Material Code
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Stage 2 (Data Cleaning) Active</span>
        </div>
      </div>

      {/* Pipeline Grid / Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
        {PIPELINE_STAGES.map((stage, index) => {
          const isCleaningActive = stage.id === "cleaning";
          const isReady = stage.status === "active";
          const isComingSoon = stage.status === "coming_soon";

          return (
            <div
              key={stage.id}
              className={`relative rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isCleaningActive
                  ? "bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 border-2 border-emerald-500 shadow-xs ring-2 ring-emerald-500/10"
                  : isReady
                  ? "bg-slate-50/80 border border-slate-200"
                  : isComingSoon
                  ? "bg-white border border-slate-200/90 hover:border-slate-300"
                  : "bg-slate-50/40 border border-dashed border-slate-200 opacity-80"
              }`}
            >
              {/* Step number badge & icon */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCleaningActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isReady
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stage.stepNumber}
                </span>

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isCleaningActive
                      ? "bg-emerald-100/80 border-emerald-300"
                      : isReady
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-100 border-slate-200"
                  }`}
                >
                  {getIcon(stage.iconName, isCleaningActive)}
                </div>
              </div>

              {/* Title and subtitle */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{stage.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{stage.description}</p>
              </div>

              {/* Status Pill Badge */}
              <div className="pt-1 border-t border-slate-100/60 flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isCleaningActive
                      ? "bg-emerald-600 text-white"
                      : stage.status === "active"
                      ? "bg-blue-100 text-blue-800"
                      : stage.status === "coming_soon"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stage.badgeText}
                </span>

                {index < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
