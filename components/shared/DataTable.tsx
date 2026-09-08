"use client";

import React, { useState, useMemo } from "react";
import { MaterialRecord, CPSE, ProcessingStatus } from "@/lib/types";
import { CPSEBadge } from "./CPSEBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Sparkles, Check, X, AlertCircle } from "lucide-react";

interface DataTableProps {
  data: MaterialRecord[];
  initialCPSE?: string;
  initialStatus?: string;
  title?: string;
  subtitle?: string;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  initialCPSE = "ALL",
  initialStatus = "ALL",
  title,
  subtitle,
  showActions = true,
  onApprove,
  onReject,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCPSE, setSelectedCPSE] = useState<string>(initialCPSE);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord | null>(null);
  const pageSize = 8;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        item.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rawDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cleanedDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nationalMaterialCode &&
          item.nationalMaterialCode.toLowerCase().includes(searchQuery.toLowerCase()));

      // CPSE Filter
      const matchesCPSE = selectedCPSE === "ALL" || item.cpse === selectedCPSE;

      // Status Filter
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

      // Category Filter
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

      return matchesSearch && matchesCPSE && matchesStatus && matchesCategory;
    });
  }, [data, searchQuery, selectedCPSE, selectedStatus, selectedCategory]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header / Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {subtitle ? (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <span className="font-medium text-slate-800">{filteredData.length}</span> records
            </p>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, desc..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* CPSE Selector */}
          <select
            value={selectedCPSE}
            onChange={(e) => {
              setSelectedCPSE(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by CPSE enterprise"
            className="px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All CPSEs</option>
            <option value="ONGC">ONGC</option>
            <option value="BHEL">BHEL</option>
            <option value="NTPC">NTPC</option>
            <option value="IOCL">IOCL</option>
            <option value="SAIL">SAIL</option>
            <option value="GAIL">GAIL</option>
            <option value="CIL">CIL</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by processing status"
            className="px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="cleaned">Cleaned</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="raw">Raw</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="table-container">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Material Code</th>
              <th className="py-3 px-4">CPSE</th>
              <th className="py-3 px-4">Raw Description</th>
              <th className="py-3 px-4">Cleaned / Standardized Description</th>
              <th className="py-3 px-3 text-center">Confidence</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300 stroke-1" />
                    <p className="text-sm font-medium text-slate-600">No matching material records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-4 font-mono font-medium text-xs text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{item.materialCode}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CPSEBadge cpse={item.cpse} />
                  </td>
                  <td className="py-3 px-4 max-w-[240px] truncate font-mono text-xs text-slate-700" title={item.rawDescription}>
                    {item.rawDescription}
                  </td>
                  <td className="py-3 px-4 max-w-[280px]">
                    <div className="font-medium text-xs text-slate-900 line-clamp-2" title={item.cleanedDescription}>
                      {item.cleanedDescription}
                    </div>
                    {item.abbreviationsFound && item.abbreviationsFound.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.abbreviationsFound.slice(0, 2).map((abbr, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {abbr}
                          </span>
                        ))}
                        {item.abbreviationsFound.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{item.abbreviationsFound.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <span
                        className={`text-xs font-semibold ${
                          item.confidenceScore >= 90
                            ? "text-emerald-600"
                            : item.confidenceScore >= 75
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {item.confidenceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="View Record Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {showActions && item.status === "pending_review" && (
                        <>
                          <button
                            onClick={() => onApprove?.(item.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Approve Cleaned Master"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject?.(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Reject Record"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">{currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal Dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <CPSEBadge cpse={selectedRecord.cpse} />
                <span className="font-mono font-bold text-slate-900">{selectedRecord.materialCode}</span>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Raw Input Description</span>
                <p className="font-mono text-xs text-slate-800 break-words">{selectedRecord.rawDescription}</p>
              </div>

              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-indigo-700 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Cleaned & Standardized Master
                  </span>
                  <span className="text-xs font-bold text-indigo-700">Score: {selectedRecord.confidenceScore}%</span>
                </div>
                <p className="text-slate-900 font-medium">{selectedRecord.cleanedDescription}</p>
              </div>

              {selectedRecord.nationalMaterialCode && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                  <span className="text-emerald-900 font-medium">Mapped National Material Code (UNMC):</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedRecord.nationalMaterialCode}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-1">Standardized Category</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-1">Standard UOM (Unit of Measure)</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.standardUnit} (Raw: {selectedRecord.rawUnit || "N/A"})</span>
                </div>
              </div>

              {selectedRecord.abbreviationsFound && selectedRecord.abbreviationsFound.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">Rule Transformations Applied</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecord.abbreviationsFound.map((item, idx) => (
                      <span key={idx} className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.reviewNote && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Reviewer Audit Note:</span>
                  <span>{selectedRecord.reviewNote}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
