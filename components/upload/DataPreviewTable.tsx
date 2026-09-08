"use client";

import React, { useState } from "react";
import {
  Table as TableIcon,
  Search,
  Copy,
  Check,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { StandardizedUploadRecord, CPSE } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";

interface DataPreviewTableProps {
  records: StandardizedUploadRecord[];
  totalRecordsCount: number;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  records,
  totalRecordsCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<StandardizedUploadRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter records based on search term
  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      rec.cpse.toLowerCase().includes(term) ||
      rec.materialCode.toLowerCase().includes(term) ||
      rec.materialDescription.toLowerCase().includes(term) ||
      rec.specification.toLowerCase().includes(term) ||
      rec.unit.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Check if string is known CPSE type
  const isKnownCPSE = (cpse: string): cpse is CPSE => {
    return ["ONGC", "BHEL", "NTPC", "IOCL", "SAIL", "GAIL", "CIL"].includes(cpse.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* Table Header & Controls Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Ingested Data Preview</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                Showing {Math.min(filteredRecords.length, pageSize)} of {records.length} {records.length < totalRecordsCount ? `(Parsed sample of ${totalRecordsCount.toLocaleString()})` : "records"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              First rows parsed from the uploaded sheet before sending to cleaning engine
            </p>
          </div>
        </div>

        {/* Search Input & Page Size */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in preview..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th className="py-3 px-4 w-12 text-slate-400 text-center">#</th>
              <th className="py-3 px-4 w-28">CPSE</th>
              <th className="py-3 px-4 w-36">Material Code</th>
              <th className="py-3 px-4 min-w-[280px]">Material Description</th>
              <th className="py-3 px-4 w-44">Specification</th>
              <th className="py-3 px-4 w-24">Unit</th>
              <th className="py-3 px-4 w-16 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No records match your search query.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {globalIndex}
                    </td>

                    {/* CPSE */}
                    <td className="py-3 px-4">
                      {isKnownCPSE(rec.cpse) ? (
                        <CPSEBadge cpse={rec.cpse} />
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                          {rec.cpse}
                        </span>
                      )}
                    </td>

                    {/* Material Code */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{rec.materialCode}</span>
                        {rec.isCodeAutoGenerated && (
                          <span
                            className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold"
                            title="Auto-generated temporary code"
                          >
                            Auto
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Material Description with clean truncation and rich hover tooltip */}
                    <td className="py-3 px-4 text-slate-800">
                      <div className="relative group/tooltip flex items-center gap-1.5 max-w-md sm:max-w-lg">
                        <span className="truncate text-xs font-medium cursor-help text-slate-900 group-hover/tooltip:text-indigo-600 transition-colors">
                          {rec.materialDescription}
                        </span>

                        {/* Hover Tooltip for complete text */}
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-30 w-80 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 pointer-events-none transition-opacity">
                          <span className="text-[10px] text-indigo-300 uppercase tracking-wider block font-bold mb-1">
                            Full Legacy Description
                          </span>
                          <p className="leading-relaxed font-normal">{rec.materialDescription}</p>
                          {rec.rawRow.category && (
                            <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
                              Category: {rec.rawRow.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Specification */}
                    <td className="py-3 px-4">
                      {rec.specification && rec.specification !== "—" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 max-w-[150px] truncate" title={rec.specification}>
                          {rec.specification}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
                        {rec.unit || "NOS"}
                      </span>
                    </td>

                    {/* Actions: Copy & Inspect */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(rec.materialDescription, rec.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Copy description"
                        >
                          {copiedId === rec.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForDetail(rec)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="View all raw fields"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredRecords.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal for Raw Field Inspection */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Record Details: {selectedRecordForDetail.materialCode}
                </h4>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Raw Description</span>
                <p className="font-semibold text-slate-900 leading-relaxed">{selectedRecordForDetail.materialDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">CPSE Enterprise</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedRecordForDetail.cpse}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Standardized Unit</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedRecordForDetail.unit}</p>
                </div>
              </div>

              {/* All Raw Key-Values */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Raw Ingested Row Attributes
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {Object.entries(selectedRecordForDetail.rawRow).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs">
                      <span className="font-mono text-slate-500">{key}</span>
                      <span className="font-medium text-slate-900 truncate max-w-xs">{String(val) || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
