"use client";

import React, { useState, useEffect } from "react";
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
} from "recharts";
import { MOCK_PROCESSING_STATS_BY_CPSE, MOCK_CATEGORY_DISTRIBUTION } from "@/lib/mockData";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

export const ProcessingChart: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartView, setChartView] = useState<"cpse" | "category">("cpse");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-80 flex items-center justify-center">
        <div className="text-xs text-slate-400">Loading enterprise metrics...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Processing Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of raw ingested records vs standardized and pending verification
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setChartView("cpse")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              chartView === "cpse"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>By CPSE</span>
          </button>
          <button
            onClick={() => setChartView("category")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              chartView === "category"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>
        </div>
      </div>

      {/* Chart Rendering */}
      <div className="h-72 w-full pt-2">
        {chartView === "cpse" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_PROCESSING_STATS_BY_CPSE}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="cpse" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="raw" name="Raw Ingested" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cleaned" name="Cleaned Master" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}% of Master`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 text-xs pr-4">
              {MOCK_CATEGORY_DISTRIBUTION.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium truncate max-w-[160px]">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
