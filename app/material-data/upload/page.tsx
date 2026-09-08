"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { ColumnDetector } from "@/components/upload/ColumnDetector";
import { DatasetSummary } from "@/components/upload/DatasetSummary";
import { DataPreviewTable } from "@/components/upload/DataPreviewTable";
import { UploadProgress } from "@/components/upload/UploadProgress";
import {
  parseUploadedFile,
  getPreloadedSampleDataset,
  downloadSampleCSVTemplate,
  downloadSampleXLSXTemplate,
} from "@/lib/uploadParser";
import {
  saveUploadedDatasetToStorage,
  getLatestUploadedDataset,
  clearStoredUploadedDataset,
} from "@/lib/uploadStore";
import { ParsedDataset, CPSE } from "@/lib/types";
import { CPSE_PROFILES } from "@/lib/mockData";
import {
  Download,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function UploadDataPage() {
  const router = useRouter();

  // Selected default configuration
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ONGC");
  const [erpSystem, setErpSystem] = useState<string>("SAP ECC / S4HANA (MARA/MAKT)");
  
  // Upload and parsing states
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4>(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCleaningRedirecting, setIsCleaningRedirecting] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Load existing session dataset if available on mount
  useEffect(() => {
    const existing = getLatestUploadedDataset();
    if (existing && !dataset) {
      setDataset(existing);
    }
  }, []);

  // Handle file selection and parsing
  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUploadStep(1);
    setUploadProgressPercent(25);
    setStatusMessage(`Reading ${file.name}...`);

    try {
      // Step 2: Validate Data
      await new Promise((r) => setTimeout(r, 200));
      setUploadStep(2);
      setUploadProgressPercent(50);
      setStatusMessage("Validating file structure and schema headers...");

      // Step 3: Parse and Detect Columns
      await new Promise((r) => setTimeout(r, 250));
      setUploadStep(3);
      setUploadProgressPercent(75);
      setStatusMessage("Detecting columns and standardizing records...");

      const parsed = await parseUploadedFile(file, selectedCPSE);

      // Step 4: Ready
      await new Promise((r) => setTimeout(r, 150));
      setUploadStep(4);
      setUploadProgressPercent(100);
      setStatusMessage("Dataset parsed and validated successfully!");

      setDataset(parsed);
      saveUploadedDatasetToStorage(parsed);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while parsing the file.");
      setDataset(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-click Demo Sample Load
  const handleLoadSample = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setUploadStep(1);
    setUploadProgressPercent(30);
    setStatusMessage("Loading multi-CPSE master catalog sample...");

    await new Promise((r) => setTimeout(r, 200));
    setUploadStep(2);
    setUploadProgressPercent(65);
    setStatusMessage("Validating sample CPSE entries...");

    await new Promise((r) => setTimeout(r, 200));
    setUploadStep(3);
    setUploadProgressPercent(90);
    setStatusMessage("Extracting specification and unit attributes...");

    const sample = getPreloadedSampleDataset();
    setUploadStep(4);
    setUploadProgressPercent(100);
    setStatusMessage("Sample dataset loaded successfully!");

    setDataset(sample);
    saveUploadedDatasetToStorage(sample);
    setIsLoading(false);
  };

  // Clear dataset
  const handleClear = () => {
    setDataset(null);
    setErrorMessage(null);
    setUploadProgressPercent(0);
    setUploadStep(1);
    clearStoredUploadedDataset();
  };

  // Start Data Cleaning Pipeline
  const handleStartDataCleaning = async () => {
    if (!dataset) return;
    setIsCleaningRedirecting(true);

    // Save latest dataset
    saveUploadedDatasetToStorage(dataset);

    // Simulate pipeline initiation transition
    await new Promise((r) => setTimeout(r, 600));
    router.push("/ai-standardization/data-cleaning");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Upload Material Master Data"
        description="Upload material master data from participating CPSEs for standardization and analysis."
        breadcrumbs={[{ label: "Material Data" }, { label: "Upload Data" }]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Ingestion Pipeline
          </span>
        }
        actions={
          <div className="flex items-center gap-2 relative">
            {/* Download Template Action Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Download Template</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showTemplateDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1.5 animate-in fade-in space-y-1">
                  <button
                    onClick={() => {
                      downloadSampleCSVTemplate(selectedCPSE);
                      setShowTemplateDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold block">CSV Template (.csv)</span>
                      <span className="text-[10px] text-slate-400">Lightweight UTF-8 format</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      downloadSampleXLSXTemplate(selectedCPSE);
                      setShowTemplateDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-semibold block">Excel Template (.xlsx)</span>
                      <span className="text-[10px] text-slate-400">Formatted workbook</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Clear Button if dataset exists */}
            {dataset && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset upload state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Upload Area & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Dropzone & Upload Progress */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ingestion Source Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Ingestion Source Context
                </h3>
              </div>
              <span className="text-xs text-slate-400">Participating Enterprise Mapping</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Target CPSE Enterprise
                </label>
                <select
                  value={selectedCPSE}
                  onChange={(e) => setSelectedCPSE(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {CPSE_PROFILES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Source ERP Export Format
                </label>
                <select
                  value={erpSystem}
                  onChange={(e) => setErpSystem(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="SAP ECC / S4HANA (MARA/MAKT)">SAP ECC / S4HANA (MARA/MAKT)</option>
                  <option value="Oracle ERP Cloud / EBS">Oracle ERP Cloud / EBS</option>
                  <option value="IBM Maximo Asset Management">IBM Maximo Asset Management</option>
                  <option value="Custom In-house CPSE DB">Custom In-house CPSE DB</option>
                  <option value="Standard Flat Dump">Standard Flat CSV / Excel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Drag & Drop Box & File Validation */}
          <FileDropzone
            onFileSelected={handleFileSelected}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
            dataset={dataset}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />

          {/* Upload & Validation Progress Indicator */}
          {isLoading && (
            <UploadProgress
              currentStep={uploadStep}
              progressPercent={uploadProgressPercent}
              statusMessage={statusMessage}
              isProcessing={isLoading}
            />
          )}
        </div>

        {/* Right 1 Col: Expected Schema Guidelines & Info Card */}
        <div className="space-y-5">
          {/* Expected Headers Guidelines */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Expected Column Format</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                Smart Detection
              </span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">material_description</span>
                  <span className="text-[10px] text-rose-600 font-bold uppercase">Required</span>
                </div>
                <p className="text-slate-500 text-[11px]">Legacy unstructured text string</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">material_code</span>
                  <span className="text-[10px] text-amber-700 font-medium">Or Auto-ID</span>
                </div>
                <p className="text-slate-500 text-[11px]">Unique legacy ID (e.g. ONG-1001, BHL-2001)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">cpse_name</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <p className="text-slate-500 text-[11px]">Participating CPSE name (e.g. ONGC, BHEL)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">specification</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <p className="text-slate-500 text-[11px]">Grade, dimension, rating (e.g. SS304, CL150)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">unit</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <p className="text-slate-500 text-[11px]">Legacy UOM (e.g. NOS, PCS, MTR, KG)</p>
              </div>
            </div>
          </div>

          {/* Smart Pipeline Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-slate-50 border border-indigo-100 text-indigo-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Automated Alias Recognition</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-900/80">
              The ingestion engine automatically maps SAP (<code>MATNR</code>, <code>MAKTX</code>, <code>MEINS</code>) and Oracle ERP headers to unified national standard fields.
            </p>
          </div>
        </div>
      </div>

      {/* Render Data Inspection Sections only when a dataset is loaded */}
      {dataset && (
        <div className="space-y-6 animate-in fade-in pt-2">
          {/* 4. Column Detection Badges & Mapping */}
          <ColumnDetector
            detectionResult={dataset.columnDetection}
            rawHeaders={dataset.rawHeaders}
          />

          {/* 5. Dataset Summary Cards */}
          <DatasetSummary summary={dataset.summary} />

          {/* 6. Data Preview Table (First 10 records with tooltips) */}
          <DataPreviewTable
            records={dataset.records}
            totalRecordsCount={dataset.summary.totalRecords}
          />

          {/* 7. Processing Action Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-indigo-900/50">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Dataset Ready for Preprocessing & Normalization
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                {dataset.records.length.toLocaleString()} records validated from{" "}
                <strong className="text-indigo-200">{dataset.fileName}</strong>. Proceed to the Data Cleaning workbench to expand abbreviations and standardize units.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => router.push("/material-data/raw")}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                View in Raw Catalog
              </button>

              <button
                type="button"
                onClick={handleStartDataCleaning}
                disabled={isCleaningRedirecting || dataset.columnDetection.missingRequired.length > 0}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCleaningRedirecting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Preparing Cleaning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Data Cleaning</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
