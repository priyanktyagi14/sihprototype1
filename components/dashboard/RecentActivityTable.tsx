"use client";

import React from "react";
import Link from "next/link";
import { MaterialRecord } from "@/lib/types";
import { CPSEBadge } from "../shared/CPSEBadge";
import { StatusBadge } from "../shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, Clock } from "lucide-react";

interface RecentActivityTableProps {
  records: MaterialRecord[];
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ records }) => {
  const displayRecords = records.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Processing Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of material records parsed and standardized across CPSEs
          </p>
        </div>

        <Link
          href="/material-data/raw"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>View All Records</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Material Code</th>
              <th className="py-3 px-4">CPSE</th>
              <th className="py-3 px-4">Raw Description</th>
              <th className="py-3 px-4">Processing Status</th>
              <th className="py-3 px-4 text-right">Date/Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRecords.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-xs text-slate-900 whitespace-nowrap">
                  {item.materialCode}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <CPSEBadge cpse={item.cpse} />
                </td>
                <td className="py-3 px-4 max-w-[280px] truncate font-mono text-xs text-slate-700" title={item.rawDescription}>
                  {item.rawDescription}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-3 px-4 text-right text-xs text-slate-500 whitespace-nowrap font-mono">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
