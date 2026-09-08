"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CPSE_PROFILES } from "@/lib/mockData";
import { ABBREVIATIONS_DICT, UNIT_CONVERSIONS } from "@/lib/cleaningRules";
import {
  Settings as SettingsIcon,
  BookOpen,
  Sliders,
  Building2,
  CheckCircle2,
  Save,
  Plus,
  Search,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"cpse" | "abbr" | "units" | "thresholds">("cpse");
  const [abbrSearch, setAbbrSearch] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  // Confidence thresholds
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(90);
  const [reviewThreshold, setReviewThreshold] = useState(75);

  const filteredAbbrs = Object.entries(ABBREVIATIONS_DICT).filter(([k, v]) => {
    return (
      !abbrSearch ||
      k.toLowerCase().includes(abbrSearch.toLowerCase()) ||
      v.toLowerCase().includes(abbrSearch.toLowerCase())
    );
  });

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Standardization Rules"
        description="Configure CPSE enterprise profiles, custom industrial abbreviation dictionaries, SI unit conversion mappings, and automated audit thresholds."
        breadcrumbs={[{ label: "Settings" }]}
        actions={
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        }
      />

      {savedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully to Central Master repository.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/60 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab("cpse")}
            className={`px-5 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "cpse"
                ? "border-indigo-600 text-indigo-700 bg-white font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>CPSE Enterprise Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab("abbr")}
            className={`px-5 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "abbr"
                ? "border-indigo-600 text-indigo-700 bg-white font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Abbreviation Dictionary ({Object.keys(ABBREVIATIONS_DICT).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("units")}
            className={`px-5 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "units"
                ? "border-indigo-600 text-indigo-700 bg-white font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>SI Unit Normalization</span>
          </button>

          <button
            onClick={() => setActiveTab("thresholds")}
            className={`px-5 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "thresholds"
                ? "border-indigo-600 text-indigo-700 bg-white font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Confidence Thresholds</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* CPSE Profiles Tab */}
          {activeTab === "cpse" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enrolled Public Sector Enterprises</h4>
                  <p className="text-xs text-slate-500">Connected CPSE master sources and prefix identifiers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CPSE_PROFILES.map((cpse) => (
                  <div key={cpse.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cpse.id}</span>
                        <span className="text-xs font-mono bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                          Prefix: {cpse.prefixCode}-
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active Master
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{cpse.name}</p>
                    <p className="text-[11px] text-slate-500">{cpse.ministry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abbreviation Dictionary Tab */}
          {activeTab === "abbr" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search abbreviation term..."
                    value={abbrSearch}
                    onChange={(e) => setAbbrSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredAbbrs.length} terms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredAbbrs.map(([abbr, expansion], idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {abbr}
                    </span>
                    <span className="text-slate-600 truncate ml-2 font-medium" title={expansion}>
                      {expansion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === "units" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Maps legacy and imperial unit notations into standard SI / National Metric units.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto">
                {Object.entries(UNIT_CONVERSIONS).map(([raw, std], idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700 bg-slate-200/70 px-1.5 py-0.5 rounded">{raw}</span>
                    <span className="text-indigo-600 font-mono font-bold">→ {std}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thresholds Tab */}
          {activeTab === "thresholds" && (
            <div className="max-w-xl space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <label>Automated Harmonization Threshold</label>
                  <span className="text-indigo-600 font-bold">{autoApproveThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="99"
                  value={autoApproveThreshold}
                  onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Records with AI confidence above this threshold will automatically bypass human review.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <label>Manual Review Flag Threshold</label>
                  <span className="text-amber-600 font-bold">{reviewThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="85"
                  value={reviewThreshold}
                  onChange={(e) => setReviewThreshold(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Records scoring between this threshold and {autoApproveThreshold}% are routed to the Review Center.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
