"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CPSE_PROFILES, MOCK_PROCESSING_STATS_BY_CPSE, MOCK_CATEGORY_DISTRIBUTION } from "@/lib/mockData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Building2,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const timeSeriesData = [
    { month: "Apr", accuracy: 78, processed: 18000 },
    { month: "May", accuracy: 82, processed: 24000 },
    { month: "Jun", accuracy: 85, processed: 32000 },
    { month: "Jul", accuracy: 89, processed: 45000 },
    { month: "Aug", accuracy: 91, processed: 62000 },
    { month: "Sep", accuracy: 94.8, processed: 88920 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Harmonization & Data Quality Analytics"
        description="Cross-enterprise performance indicators, standardization accuracy scores, and catalog category distribution across all participating CPSEs."
        breadcrumbs={[{ label: "Analytics" }]}
      />

      {/* Top High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Overall Accuracy</span>
          <div className="text-2xl font-bold text-emerald-600">94.8%</div>
          <p className="text-[11px] text-slate-400">+6.2% since rule dictionary v1.4</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Participating CPSEs</span>
          <div className="text-2xl font-bold text-indigo-600">7 Enterprises</div>
          <p className="text-[11px] text-slate-400">ONGC, BHEL, NTPC, IOCL, SAIL, GAIL, CIL</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Estimated Duplication</span>
          <div className="text-2xl font-bold text-amber-600">~24.3%</div>
          <p className="text-[11px] text-slate-400">Potential cross-CPSE procurement synergy</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rule Dictionary Terms</span>
          <div className="text-2xl font-bold text-blue-600">2,450+ Terms</div>
          <p className="text-[11px] text-slate-400">Across electrical, mechanical & piping</p>
        </div>
      </div>

      {/* CPSE Accuracy Matrix Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">CPSE Master Quality Index</h3>
            <p className="text-xs text-slate-500">Standardization readiness score per central public enterprise</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>GAIL Leading (95.0%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CPSE_PROFILES.map((cpse) => (
            <div key={cpse.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{cpse.id}</span>
                <span className="text-xs font-bold text-indigo-600">{cpse.cleanedPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${cpse.cleanedPercentage}%` }} />
              </div>
              <div className="text-[11px] text-slate-500 truncate">{cpse.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Volume Per CPSE */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Material Records Volume by CPSE</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_PROCESSING_STATS_BY_CPSE} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cpse" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cleaned" name="Cleaned Master" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Accuracy Over Time */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Standardization Accuracy Progression (%)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val}%`, "Accuracy"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy Score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
