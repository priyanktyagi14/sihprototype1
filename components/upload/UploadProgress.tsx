"use client";

import React from "react";
import {
  FileUp,
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface UploadProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  progressPercent: number;
  statusMessage: string;
  isProcessing?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  currentStep,
  progressPercent,
  statusMessage,
  isProcessing = true,
}) => {
  const steps = [
    { step: 1, label: "Upload File", icon: FileUp },
    { step: 2, label: "Validate Data", icon: ShieldCheck },
    { step: 3, label: "Detect Columns", icon: Layers },
    { step: 4, label: "Ready for Cleaning", icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 animate-in fade-in">
      {/* Steps Row */}
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-300 -z-0"
          style={{ width: `${Math.max(0, ((currentStep - 1) / 3) * 100)}%` }}
        />

        {steps.map((s) => {
          const isDone = s.step < currentStep || (s.step === currentStep && progressPercent === 100);
          const isCurrent = s.step === currentStep && progressPercent < 100;
          const isPending = s.step > currentStep;

          return (
            <div key={s.step} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100"
                    : isCurrent
                    ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 scale-110"
                    : "bg-white text-slate-400 border-2 border-slate-300"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight text-center max-w-[80px] hidden sm:block ${
                  isCurrent || isDone ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar & Status Text */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
            {statusMessage}
          </span>
          <span className="font-bold text-indigo-600">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
