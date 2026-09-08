"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ParsedDataset } from "@/lib/types";

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  onClear: () => void;
  dataset: ParsedDataset | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  onLoadSample,
  onClear,
  dataset,
  isLoading,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileInputChange}
        className="hidden"
        id="material-file-upload-input"
      />

      {/* Main Drag & Drop Zone */}
      {!dataset ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer group select-none ${
            isDragOver
              ? "border-indigo-600 bg-indigo-50/60 ring-4 ring-indigo-500/10 scale-[1.005]"
              : errorMessage
              ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
              : "border-slate-300 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-400 shadow-xs"
          }`}
        >
          {/* Animated Glow / Radial Backdrop */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
            {/* Upload Icon Circle */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragOver
                  ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/25"
                  : errorMessage
                  ? "bg-rose-100 text-rose-600"
                  : "bg-white text-indigo-600 shadow-md border border-slate-200 group-hover:border-indigo-300 group-hover:scale-105"
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            {/* Instruction Texts */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isDragOver ? "Drop file to parse dataset" : "Drag & drop your file here"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Supported formats: <span className="font-semibold text-slate-700">CSV, XLSX</span> (Excel)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerBrowse();
                }}
                disabled={isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                <span>Browse Files</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadSample();
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Sample Dataset</span>
              </button>
            </div>

            {/* Size & Privacy footnote */}
            <p className="text-[11px] text-slate-400 pt-1">
              Supports files up to 500,000 records. Parsed securely in your browser session.
            </p>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* File Details */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  dataset.fileType === "CSV"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {dataset.fileType === "CSV" ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-slate-900 truncate max-w-xs sm:max-w-md">
                    {dataset.fileName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      dataset.fileType === "CSV"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {dataset.fileType}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span>Size: <strong className="text-slate-700 font-semibold">{dataset.fileSizeBytesFormatted}</strong></span>
                  <span>•</span>
                  <span>Records: <strong className="text-slate-700 font-semibold">{dataset.records.length.toLocaleString()} rows</strong></span>
                  <span>•</span>
                  {/* Status Indicator */}
                  <span className="flex items-center gap-1 font-medium">
                    {dataset.validationStatus === "valid" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Valid Structure
                      </span>
                    ) : dataset.validationStatus === "warning" ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Warnings Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px] font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Validation Error
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Replace / Remove */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={triggerBrowse}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Replace with another file"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Replace File</span>
              </button>

              <button
                type="button"
                onClick={onClear}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-rose-800">File Ingestion Error</h4>
            <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
