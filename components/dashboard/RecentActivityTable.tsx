"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MaterialRecord } from "@/lib/types";
import { CPSEBadge } from "../shared/CPSEBadge";
import { showToast } from "../shared/Toast";

interface MasterDataOverviewTableProps {
  records?: MaterialRecord[];
}

interface StitchRowData {
  id: string;
  cpse: string;
  materialCode: string;
  rawDescription: string;
  cleanedDescription: string;
  confidence: number;
}

const DEFAULT_STITCH_RECORDS: StitchRowData[] = [
  {
    id: "rec-1",
    cpse: "NTPC",
    materialCode: "NTP-4402",
    rawDescription: 'CS FLG WNRF 150# 4" SCH 40 40 ASTM A105',
    cleanedDescription: "FLANGE, WNRF, 4 IN, 150 LB, SCH 40, ASTM A105",
    confidence: 96,
  },
  {
    id: "rec-2",
    cpse: "IOCL",
    materialCode: "IOC-7719",
    rawDescription: "BALL VLV 2 in 800#",
    cleanedDescription: "VALVE, BALL, 2 IN, CLASS 800",
    confidence: 94,
  },
  {
    id: "rec-3",
    cpse: "SAIL",
    materialCode: "GAL-S321",
    rawDescription: "CARBON STEEL WKUCK FLANGE 4 INCH 150 LBS SCH40 A10SN",
    cleanedDescription: "FLANGE, WNRF, 4 IN, 150 LB, SCH 40, CS",
    confidence: 91,
  },
  {
    id: "rec-4",
    cpse: "ONGC",
    materialCode: "ONG-8820",
    rawDescription: 'GASKET SPIRAL WOUND 3" 300# GRAPHITE FILLER SS316',
    cleanedDescription: "GASKET, SPIRAL WOUND, 3 IN, 300 LB, SS316/GRAPHITE",
    confidence: 98,
  },
  {
    id: "rec-5",
    cpse: "BHEL",
    materialCode: "BHL-1094",
    rawDescription: "HEX HEAD BOLT M20 X 75 GR 8.8 GALV",
    cleanedDescription: "BOLT, HEX HEAD, M20 X 75MM, GRADE 8.8, GALVANIZED",
    confidence: 95,
  },
];

export const RecentActivityTable: React.FC<MasterDataOverviewTableProps> = ({ records }) => {
  const [selectedFilterCPSE, setSelectedFilterCPSE] = useState<string>("ALL");
  const [editingRecord, setEditingRecord] = useState<StitchRowData | null>(null);
  const [tableData, setTableData] = useState<StitchRowData[]>(DEFAULT_STITCH_RECORDS);

  useEffect(() => {
    const handleCPSEFilter = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setSelectedFilterCPSE(custom.detail);
      }
    };
    window.addEventListener("sih_cpse_filter_changed", handleCPSEFilter);
    return () => window.removeEventListener("sih_cpse_filter_changed", handleCPSEFilter);
  }, []);

  const displayedRows = tableData.filter((row) =>
    selectedFilterCPSE === "ALL" ? true : row.cpse === selectedFilterCPSE
  );

  const handleDelete = (id: string, code: string) => {
    setTableData((prev) => prev.filter((r) => r.id !== id));
    showToast({
      type: "info",
      title: "Record Removed",
      message: `${code} removed from catalog view.`,
    });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-purpose="harmonized-materials-table-card">
      {/* Interactive Table Header Controls */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">National Master Catalog Records</h2>
          <p className="text-xs text-slate-500">Cross-enterprise material descriptions harmonized with AI noun-modifier parsing</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter CPSE:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800">
            {selectedFilterCPSE === "ALL" ? "All 7 Enterprises" : selectedFilterCPSE}
          </span>
        </div>
      </div>

      {/* Table Viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
          {/* Table Columns */}
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              <th className="py-3.5 pl-5 pr-3 text-left w-24" scope="col">CPSE</th>
              <th className="py-3.5 px-3 text-left w-36" scope="col">
                <div className="flex items-center gap-1 cursor-pointer group">
                  <span>Material Code</span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
              </th>
              <th className="py-3.5 px-4 text-left" scope="col">Raw Material Description</th>
              <th className="py-3.5 px-4 text-left" scope="col">Standardized Description</th>
              <th className="py-3.5 px-3 text-center w-28" scope="col">AI Confidence</th>
              <th className="py-3.5 pr-5 pl-3 text-right w-24" scope="col">Actions</th>
            </tr>
          </thead>

          {/* Table Rows Data */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No records matching the selected CPSE filter.
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => (
                <tr key={row.id} className="hover:bg-purple-50/30 transition-colors group">
                  {/* CPSE */}
                  <td className="py-3.5 pl-5 pr-3 whitespace-nowrap font-bold">
                    <CPSEBadge cpse={row.cpse} />
                  </td>

                  {/* Material Code */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] font-medium text-slate-600">
                    {row.materialCode}
                  </td>

                  {/* Raw Material Description */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={row.rawDescription}>
                    {row.rawDescription}
                  </td>

                  {/* Standardized Description */}
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {row.cleanedDescription}
                  </td>

                  {/* AI Confidence */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.confidence}% Match
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-5 pl-3 whitespace-nowrap text-right text-slate-400 group-hover:text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(row)}
                        className="p-1 hover:text-purple-700 rounded hover:bg-slate-100 transition-colors"
                        title="Edit Specification"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(row.id, row.materialCode)}
                        className="p-1 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                        title="Remove Record"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingRecord(row)}
                        className="p-1 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title="More Options"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Pagination & Batch Run Action Buttons */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-purpose="table-footer-controls">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Page 1 of 2</span>
          <span className="text-slate-300">|</span>
          <span>Showing 1-{displayedRows.length} of 24,810 records</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ai-standardization/data-cleaning"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1E0E38] hover:bg-[#2C1752] border border-purple-950 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Start Data Cleaning</span>
          </Link>
          <Link
            href="/material-data/raw"
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <span>View in Raw Catalog</span>
          </Link>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-purple-200 shadow-xl p-5 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CPSEBadge cpse={editingRecord.cpse} />
                <span className="font-mono font-bold text-slate-900 text-xs">{editingRecord.materialCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm px-1.5 py-0.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Raw Description
                </span>
                <p className="font-mono text-slate-700">{editingRecord.rawDescription}</p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-200">
                <span className="text-[10px] font-bold text-[#582C87] uppercase tracking-wider block mb-1">
                  Standardized Noun-Modifier Output
                </span>
                <input
                  type="text"
                  value={editingRecord.cleanedDescription}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, cleanedDescription: e.target.value })
                  }
                  className="w-full bg-white border border-purple-200 rounded px-2.5 py-1.5 font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTableData((prev) =>
                    prev.map((r) => (r.id === editingRecord.id ? editingRecord : r))
                  );
                  setEditingRecord(null);
                  showToast({
                    type: "success",
                    title: "Specification Updated",
                    message: `${editingRecord.materialCode} updated successfully.`,
                  });
                }}
                className="px-4 py-1.5 bg-[#1E0E38] hover:bg-[#2C1752] text-white text-xs font-semibold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
