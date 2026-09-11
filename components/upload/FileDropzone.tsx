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
  Sparkles,
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
        accept=".csv,.xlsx,.xls,.parquet,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileInputChange}
        className="hidden"
        id="material-file-upload-input"
      />

      {/* Main Drag & Drop Zone */}
      {!dataset ? (
        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerBrowse}
          className={`bg-white rounded-xl border-2 border-dashed p-10 text-center shadow-xs transition-all duration-200 flex flex-col items-center justify-center min-h-[340px] cursor-pointer group ${
            isDragOver
              ? "border-[#7C3AED] bg-[#F5F0FF] ring-4 ring-[#7C3AED]/10"
              : errorMessage
              ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
              : "border-indigo-200 hover:border-[#7C3AED]"
          }`}
          data-purpose="file-upload-dropzone"
        >
          {/* Soft Purple Circle Upload Cloud Icon */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7C3AED] mb-4 shadow-xs group-hover:scale-105 transition-transform">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 animate-spin text-[#7C3AED]" />
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
              </svg>
            )}
          </div>

          {/* Upload Titles */}
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
            {isDragOver ? "Drop your file to upload" : "Drag & drop your file here"}
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Supported formats: <span className="font-semibold text-slate-700">CSV, XLSX</span> (Excel)
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Primary Browse Files Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-lg shadow-sm shadow-purple-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span>Browse Files</span>
            </button>

            {/* Secondary Try Sample Dataset Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSample();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-amber-600 hover:text-amber-700 border border-amber-200/80 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span>Try Sample Dataset</span>
            </button>
          </div>

          {/* Upload Caveat / Footer Note */}
          <p className="text-[11px] text-slate-400 mt-8 font-normal">
            Supports files up to 500,000 records. Parsed securely in your browser session.
          </p>
        </section>
      ) : (
        /* Selected File Card */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* File Details */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  dataset.fileType === "CSV"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#F3E8FF] text-[#582C87] border border-[#EDE9FE]"
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
                        : "bg-[#F3E8FF] text-[#582C87]"
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


