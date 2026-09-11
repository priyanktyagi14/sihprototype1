"use client";

import React, { useState, useMemo } from "react";
import { CleanedMaterialItem, CPSE } from "@/lib/types";
import { CPSEBadge } from "@/components/shared/CPSEBadge";
import { TransformationDetailsModal } from "./TransformationDetailsModal";
import { showToast } from "@/components/shared/Toast";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Check,
  Copy,
} from "lucide-react";

interface CleaningResultsTableProps {
  items: CleanedMaterialItem[];
  datasetName?: string;
  sourceCPSE?: string;
  onRefresh?: () => void;
}

export const CleaningResultsTable: React.FC<CleaningResultsTableProps> = ({
  items,
  datasetName = "dataset.csv",
  sourceCPSE,
  onRefresh,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [filterModifiedOnly, setFilterModifiedOnly] = useState(false);
  const [filterReviewOnly, setFilterReviewOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<CleanedMaterialItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active CPSE list available in items
  const availableCPSEs = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.cpse) set.add(i.cpse.toUpperCase());
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search filter: Material Code, Raw Description, Cleaned Description
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = item.materialCode.toLowerCase().includes(q);
        const rawMatch = item.rawDescription.toLowerCase().includes(q);
        const cleanMatch = item.cleanedDescription.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q) || false;

        if (!codeMatch && !rawMatch && !cleanMatch && !catMatch) {
          return false;
        }
      }

      // 2. CPSE filter
      if (selectedCPSE !== "ALL" && item.cpse.toUpperCase() !== selectedCPSE.toUpperCase()) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== "ALL" && item.processingStatus !== selectedStatus) {
        return false;
      }

      // 4. Toggle: Modified only
      if (filterModifiedOnly && !item.isModified) {
        return false;
      }

      // 5. Toggle: Requires Review only
      if (filterReviewOnly && !item.requiresReview) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCPSE, selectedStatus, filterModifiedOnly, filterReviewOnly]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCPSE, selectedStatus, filterModifiedOnly, filterReviewOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Helper to extract canonical national material code
  const getCanonicalNationalCode = (item: CleanedMaterialItem) => {
    return (
      item.nationalMaterialCode ||
      item.rawRow?.national_material_code ||
      item.rawRow?.Standard_Material_ID ||
      item.rawRow?.nationalMaterialCode ||
      "NMC-000001"
    );
  };

  // Helper to extract canonical description
  const getCanonicalDescription = (item: CleanedMaterialItem) => {
    return (
      item.standardizedDescription ||
      item.rawRow?.Standardized_Material_Description ||
      item.rawRow?.standardized_material_description ||
      item.cleanedDescription ||
      item.rawDescription
    );
  };

  // Helper to extract AI Equivalence result
  const getAIEquivalenceResult = (item: CleanedMaterialItem) => {
    if (item.aiEquivalenceResult) return item.aiEquivalenceResult;
    if (item.rawRow?.AI_Equivalence_Result) return item.rawRow.AI_Equivalence_Result;
    if (item.rawRow?.ai_equivalence_result) return item.rawRow.ai_equivalence_result;
    if (item.rawRow?.Match_Reason) return item.rawRow.Match_Reason;
    if (item.processingStatus === "Requires Review" || item.requiresReview) {
      return "Potentially Same (Variant / Review Required)";
    }
    return "Same (Exact Physical Equivalence across CPSEs)";
  };

  // Handle Export to 3-Column Cleaned Master CSV
  const handleExportThreeColumnCSV = () => {
    if (items.length === 0) {
      showToast({ type: "warning", title: "Dataset Empty", message: "No records to export." });
      return;
    }

    try {
      const headers = [
        "National Material Code",
        "Standardized Material Description",
        "AI Equivalence Result",
      ];

      const rows = filteredItems.map((item) => {
        const nmc = getCanonicalNationalCode(item);
        const stdDesc = getCanonicalDescription(item);
        const aiResult = getAIEquivalenceResult(item);

        return [escapeCSV(nmc), escapeCSV(stdDesc), escapeCSV(aiResult)];
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanFileName = datasetName.replace(/\.[^/.]+$/, "");
      link.setAttribute("href", url);
      link.setAttribute("download", `National_Material_Master_3Col_${cleanFileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: "success",
        title: "3-Column Cleaned Master Exported",
        message: `Successfully downloaded ${filteredItems.length} records in 3-column format with shared National Material Codes.`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to generate 3-column CSV export.",
      });
    }
  };

  // Handle Export to Consolidated Unique Master CSV (Deduplicated by National Material Code)
  const handleExportConsolidatedMasterCSV = () => {
    if (items.length === 0) {
      showToast({ type: "warning", title: "Dataset Empty", message: "No records to export." });
      return;
    }

    try {
      const grouped: Record<
        string,
        {
          nmc: string;
          groupId: string;
          stdDesc: string;
          aiResult: string;
          cpses: Set<string>;
          count: number;
        }
      > = {};

      filteredItems.forEach((item) => {
        const nmc = getCanonicalNationalCode(item);
        const stdDesc = getCanonicalDescription(item);
        const aiResult = getAIEquivalenceResult(item);
        const groupId = item.equivalenceGroupId || item.rawRow?.Equivalence_Group_ID || "GRP-00001";

        if (!grouped[nmc]) {
          grouped[nmc] = {
            nmc,
            groupId,
            stdDesc,
            aiResult,
            cpses: new Set<string>(),
            count: 0,
          };
        }
        grouped[nmc].count += 1;
        if (item.cpse) grouped[nmc].cpses.add(item.cpse.toUpperCase());
      });

      const headers = [
        "National Material Code",
        "Equivalence Group ID",
        "Standardized Material Description",
        "Linked Enterprise Count",
        "Participating CPSEs",
        "AI Equivalence Result",
      ];

      const rows = Object.values(grouped).map((g) => [
        escapeCSV(g.nmc),
        escapeCSV(g.groupId),
        escapeCSV(g.stdDesc),
        g.count,
        escapeCSV(Array.from(g.cpses).sort().join(", ") || "N/A"),
        escapeCSV(g.aiResult),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanFileName = datasetName.replace(/\.[^/.]+$/, "");
      link.setAttribute("href", url);
      link.setAttribute("download", `Consolidated_Unique_Master_${cleanFileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: "success",
        title: "Consolidated Master Exported",
        message: `Successfully downloaded ${Object.keys(grouped).length} unique National Material Master entities.`,
      });
    } catch (err: any) {
      console.error("Consolidated export error:", err);
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to generate consolidated CSV export.",
      });
    }
  };

  // Handle Export to Full Audit CSV (10 Columns for 100% Traceability)
  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast({ type: "warning", title: "Dataset Empty", message: "No records to export." });
      return;
    }

    try {
      const headers = [
        "National Material Code",
        "Equivalence Group ID",
        "Enterprise (CPSE)",
        "Enterprise Material Code",
        "Raw Material Description",
        "Standardized Cleaned Description",
        "AI Equivalence Result",
        "Changes Count",
        "Transformations Applied",
        "Processing Status",
        "Category",
        "Unit",
      ];

      const rows = filteredItems.map((item) => [
        escapeCSV(getCanonicalNationalCode(item)),
        escapeCSV(item.equivalenceGroupId || item.rawRow?.Equivalence_Group_ID || "GRP-00001"),
        escapeCSV(item.cpse),
        escapeCSV(item.materialCode),
        escapeCSV(item.rawDescription),
        escapeCSV(item.cleanedDescription),
        escapeCSV(getAIEquivalenceResult(item)),
        item.changesMade.length,
        escapeCSV(item.changesMade.join(" | ")),
        escapeCSV(item.processingStatus),
        escapeCSV(item.category || ""),
        escapeCSV(item.unit || ""),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanFileName = datasetName.replace(/\.[^/.]+$/, "");
      link.setAttribute("href", url);
      link.setAttribute("download", `Cleaned_FullAudit_${cleanFileName}_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: "success",
        title: "Full Audit Dataset Exported",
        message: `Successfully downloaded ${filteredItems.length} cleaned records as CSV with enterprise traceability.`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to generate CSV export.",
      });
    }
  };

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleOpenDetails = (item: CleanedMaterialItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCPSE("ALL");
    setSelectedStatus("ALL");
    setFilterModifiedOnly(false);
    setFilterReviewOnly(false);
    setCurrentPage(1);
    showToast({ type: "info", title: "Filters Reset", message: "Showing all records." });
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER & SEARCH CONTROL TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Row: Search Input, Quick Toggles & Export Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Material Code, Raw Description, or Cleaned Output..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Export & Reset */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Primary 3-Column Cleaned Master Button */}
            <button
              type="button"
              onClick={handleExportThreeColumnCSV}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Download clean sheet with 3 columns: National Material Code, Standardized Material Description, and AI Equivalence Result"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
              <span>3-Col Cleaned Master</span>
            </button>

            {/* Consolidated Unique Master (Deduplicated) Button */}
            <button
              type="button"
              onClick={handleExportConsolidatedMasterCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Download deduplicated National Material Master catalog where each physical material is unique"
            >
              <Layers className="w-4 h-4 text-emerald-200" />
              <span>Unique National Master</span>
            </button>

            {/* Download Full Audit Dataset Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Download full 12-column audit dataset including enterprise codes and national mapping"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Audit</span>
            </button>

            {(searchQuery || selectedCPSE !== "ALL" || selectedStatus !== "ALL" || filterModifiedOnly || filterReviewOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Multi-Facet Dropdowns & Toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* CPSE Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">CPSE:</span>
            <select
              value={selectedCPSE}
              onChange={(e) => setSelectedCPSE(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All CPSEs ({items.length})</option>
              {availableCPSEs.map((cpse) => (
                <option key={cpse} value={cpse}>
                  {cpse} ({items.filter((i) => i.cpse.toUpperCase() === cpse).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Cleaned Successfully">Cleaned Successfully</option>
              <option value="Requires Review">Requires Review</option>
              <option value="Unchanged">Unchanged</option>
              <option value="Processing Error">Processing Error</option>
            </select>
          </div>

          {/* Modified Only Toggle Pill */}
          <button
            type="button"
            onClick={() => setFilterModifiedOnly(!filterModifiedOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterModifiedOnly
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Records Modified</span>
          </button>

          {/* Requires Review Toggle Pill */}
          <button
            type="button"
            onClick={() => setFilterReviewOnly(!filterReviewOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterReviewOnly
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Requires Review</span>
          </button>

          {/* Match Counter */}
          <div className="ml-auto text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800 font-bold">{filteredItems.length}</strong> of {items.length} records
          </div>
        </div>
      </div>

      {/* 2. MAIN RESULTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <th className="py-3.5 px-4 w-36">National Material Code</th>
                <th className="py-3.5 px-4 w-28">Enterprise Code</th>
                <th className="py-3.5 px-4 w-24">CPSE</th>
                <th className="py-3.5 px-4 min-w-[200px]">Raw Description</th>
                <th className="py-3.5 px-4 min-w-[220px]">Cleaned Description</th>
                <th className="py-3.5 px-4 w-36 text-center">AI Equivalence</th>
                <th className="py-3.5 px-4 w-32 text-center">Status</th>
                <th className="py-3.5 px-4 w-28 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No matching material records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query or active filter pills</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isCleaned = item.processingStatus === "Cleaned Successfully";
                  const isUnchanged = item.processingStatus === "Unchanged";
                  const isReview = item.processingStatus === "Requires Review" || item.processingStatus === "Processing Error";
                  const nmc = getCanonicalNationalCode(item);
                  const aiResult = getAIEquivalenceResult(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. National Material Code */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 px-2 py-0.5 rounded-md text-[11px] inline-block shadow-2xs">
                            {nmc}
                          </span>
                          {item.equivalenceGroupId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.equivalenceGroupId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Enterprise Code */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-mono font-semibold text-slate-800">
                          {item.materialCode}
                        </div>
                      </td>

                      {/* 3. CPSE */}
                      <td className="py-3.5 px-4 align-middle">
                        <CPSEBadge cpse={item.cpse as any} size="sm" />
                      </td>

                      {/* 4. Raw Description */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80 max-w-xs break-words text-[11px] leading-relaxed">
                          {item.rawDescription || <span className="text-slate-400 italic">Empty</span>}
                        </div>
                      </td>

                      {/* 5. Cleaned Description */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-mono font-semibold text-slate-900 bg-indigo-50/40 p-2 rounded-lg border border-indigo-100 max-w-xs break-words text-[11px] leading-relaxed">
                          {item.cleanedDescription ? (
                            <span>{item.cleanedDescription}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unprocessed</span>
                          )}
                        </div>
                      </td>

                      {/* 6. AI Equivalence Result */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            aiResult.includes("Exact")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : aiResult.includes("Potentially") || aiResult.includes("Variant")
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                          title={aiResult}
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[130px]">{aiResult}</span>
                        </span>
                      </td>

                      {/* 7. Status Badge */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        {isCleaned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Cleaned</span>
                          </span>
                        ) : isReview ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Review</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Check className="w-3 h-3 text-slate-500" />
                            <span>Unchanged</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Actions Button */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(item)}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-800 text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Pagination Bar */}
        {filteredItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length}
              </span>
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. TRANSFORMATION DETAILS MODAL */}
      <TransformationDetailsModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};
