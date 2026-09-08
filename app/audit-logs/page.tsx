"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MOCK_AUDIT_LOGS } from "@/lib/mockData";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { formatDate } from "@/lib/utils";
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  FileCode,
  ShieldCheck,
} from "lucide-react";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      !search ||
      log.materialCode.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Harmonization Audit Trail & System Logs"
        description="Immutable chronological record of all AI transformations, human review approvals, rule dictionary triggers, and CPSE master modifications."
        breadcrumbs={[{ label: "Audit Logs" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Traceability Verified</span>
          </span>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, code, rule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Event Type:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter audit logs by event type"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Events</option>
              <option value="success">Success</option>
              <option value="warning">Warning / Flag</option>
              <option value="info">Info / Ingestion</option>
              <option value="error">Rejection</option>
            </select>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {getStatusIcon(log.status)}
                  <span className="font-mono font-bold text-slate-900">{log.action}</span>
                  {log.cpse !== "SYSTEM" && <CPSEBadge cpse={log.cpse} />}
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {log.materialCode}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{formatDate(log.timestamp)}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700">{log.details}</p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>
                  Actor: <strong className="text-slate-700">{log.actor}</strong>
                </span>
                {log.ruleApplied && (
                  <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {log.ruleApplied}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
