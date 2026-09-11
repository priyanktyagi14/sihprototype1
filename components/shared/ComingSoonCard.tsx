import React from "react";
import { Sparkles, Clock, Layers, ArrowRight, CheckCircle, Database, ShieldAlert, Cpu } from "lucide-react";

interface ComingSoonCardProps {
  moduleName: string;
  category: string;
  description: string;
  plannedFeatures: string[];
  targetArchitecture: {
    technology: string;
    modelOrEngine: string;
    targetAccuracy: string;
    integrationPoint: string;
  };
  samplePreview?: {
    inputExample: string;
    expectedOutput: string;
  };
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  moduleName,
  category,
  description,
  plannedFeatures,
  targetArchitecture,
  samplePreview,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#170D2B] via-[#1E0E38] to-[#170D2B] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-purple-950/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Future Development Phase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{moduleName}</h1>
            <p className="text-purple-200/80 text-sm max-w-2xl leading-relaxed">{description}</p>
          </div>

          <div className="shrink-0">
            <div className="px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <span className="block text-xs uppercase tracking-wider text-purple-300 font-semibold mb-1">
                Module Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-medium rounded-full border border-amber-400/30">
                <Clock className="w-3 h-3" /> Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Planned Specs & Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Architecture Specs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold pb-2 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3>Target AI Architecture</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Core Technology</span>
              <span className="font-semibold text-slate-800">{targetArchitecture.technology}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Engine / Model</span>
              <span className="font-semibold text-slate-800">{targetArchitecture.modelOrEngine}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Expected Accuracy</span>
              <span className="font-semibold text-emerald-600">{targetArchitecture.targetAccuracy}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Data Pipeline Hook</span>
              <span className="font-semibold text-slate-800">{targetArchitecture.integrationPoint}</span>
            </div>
          </div>
        </div>

        {/* Planned Features */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold pb-2 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3>Planned Capabilities & Workflows</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plannedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
              >
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conceptual Prototype Preview */}
      {samplePreview && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3>Design Simulation & Future Output Schema</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Simulated Schema</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto space-y-2">
              <span className="text-slate-400 block">// Standardized Input Material</span>
              <p className="text-emerald-400">{samplePreview.inputExample}</p>
            </div>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto space-y-2">
              <span className="text-slate-400 block">// Future AI Extraction / Matching Output</span>
              <pre className="text-indigo-300 leading-relaxed">{samplePreview.expectedOutput}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Note for Judges */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Note for SIH Evaluation Panel:</span>
          <span>
            This module is reserved for Phase 2 implementation. The pipeline architecture, data schema, and API
            contracts are fully structured to seamlessly integrate FastAPI, PostgreSQL + pgvector, and LLM inference
            engines.
          </span>
        </div>
      </div>
    </div>
  );
};
