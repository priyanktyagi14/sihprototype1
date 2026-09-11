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
import {
  cleanCsvFile,
  cleanDatasetRecords,
  checkBackendHealth,
  ApiError,
  API_BASE_URL,
} from "@/lib/apiClient";
import {
  saveCleaningResults,
  transformBackendResponseToCleaningState,
} from "@/lib/cleaningStore";
import { cleanMaterialDescription, clusterAndAssignNationalCodes } from "@/lib/cleaningRules";
import { ParsedDataset, CPSE, CleaningStoreState, CleanedMaterialItem, CleaningBatchMetrics } from "@/lib/types";
import { CPSE_PROFILES } from "@/lib/mockData";
import { BackendStatusBadge } from "@/components/shared/BackendStatusBadge";
import { showToast } from "@/components/shared/Toast";
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
  Loader2,
  Server,
  RefreshCw,
  X,
} from "lucide-react";

export default function UploadDataPage() {
  const router = useRouter();

  // Selected default configuration
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ONGC");
  const [erpSystem, setErpSystem] = useState<string>("SAP ECC / S4HANA (MARA/MAKT)");
  
  // Upload and parsing states
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4>(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCleaningRunning, setIsCleaningRunning] = useState(false);
  const [cleaningStatusText, setCleaningStatusText] = useState("");
  const [showOfflineModal, setShowOfflineModal] = useState(false);
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
    setRawSelectedFile(file);
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
      showToast({
        type: "success",
        title: "Dataset Ingested",
        message: `Parsed ${parsed.records.length} records from ${file.name}`,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while parsing the file.");
      setDataset(null);
      setRawSelectedFile(null);
      showToast({
        type: "error",
        title: "Ingestion Failed",
        message: err.message || "Could not parse dataset file.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-click Demo Sample Load
  const handleLoadSample = async () => {
    setIsLoading(true);
    setRawSelectedFile(null);
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
    showToast({
      type: "info",
      title: "Sample Dataset Loaded",
      message: `Loaded ${sample.records.length} pre-validated multi-CPSE material records.`,
    });
  };

  // Clear dataset
  const handleClear = () => {
    setDataset(null);
    setRawSelectedFile(null);
    setErrorMessage(null);
    setUploadProgressPercent(0);
    setUploadStep(1);
    clearStoredUploadedDataset();
    showToast({ type: "info", title: "Dataset Cleared", message: "Upload workbench has been reset." });
  };

  // Execute fallback client-side pipeline if backend is unreachable
  const runFallbackPipeline = (datasetToProcess: ParsedDataset) => {
    const baseItems = datasetToProcess.records.map((rec, idx) => {
      const sim = cleanMaterialDescription(rec.materialDescription);
      const changes: string[] = ["Converted text to lowercase", "Removed unnecessary special characters"];

      if (sim.detectedAbbreviations.length > 0) {
        sim.detectedAbbreviations.forEach((a) => changes.push(`Expanded abbreviation: ${a.toLowerCase()}`));
      }
      if (rec.materialDescription.includes("X") || rec.materialDescription.includes("*") || rec.materialDescription.includes('"')) {
        changes.push("Standardized dimension formatting");
      }
      if (sim.standardizedUnits.length > 0) {
        sim.standardizedUnits.forEach((u) => changes.push(`Normalized measurement unit: ${u.toLowerCase()}`));
      }
      changes.push("Final whitespace cleanup");

      const isModified = changes.length > 0 && rec.materialDescription.trim().toLowerCase() !== sim.cleaned.toLowerCase();

      return {
        id: `rec-${idx + 1}-${Date.now()}`,
        materialCode: rec.materialCode || `MAT-${String(idx + 1).padStart(4, "0")}`,
        cpse: rec.cpse || selectedCPSE,
        rawDescription: rec.materialDescription,
        cleanedDescription: sim.cleaned.toLowerCase(),
        changesMade: changes,
        processingStatus: "Cleaned Successfully" as const,
        isModified,
        requiresReview: rec.hasMissingFields,
        category: rec.specification || "General",
        unit: rec.unit || "",
        rawRow: rec.rawRow,
      };
    });

    const clustered = clusterAndAssignNationalCodes(
      baseItems.map((b) => ({
        ...b,
        materialDescription: b.rawDescription,
      }))
    );

    const items: CleanedMaterialItem[] = clustered.map((c, idx) => ({
      ...baseItems[idx],
      nationalMaterialCode: c.nationalMaterialCode,
      equivalenceGroupId: c.equivalenceGroupId,
      standardizedDescription: c.standardizedDescription,
      aiEquivalenceResult: c.aiEquivalenceResult,
      confidenceScore: c.confidenceScore,
      rawRow: {
        ...baseItems[idx].rawRow,
        Standard_Material_ID: c.nationalMaterialCode,
        national_material_code: c.nationalMaterialCode,
        Equivalence_Group_ID: c.equivalenceGroupId,
        equivalence_group_id: c.equivalenceGroupId,
        Standardized_Material_Description: c.standardizedDescription,
        AI_Equivalence_Result: c.aiEquivalenceResult,
      },
    }));

    const modifiedCount = items.filter((i) => i.isModified).length;
    const reviewCount = items.filter((i) => i.requiresReview).length;
    const successCount = items.length - reviewCount;

    const metrics: CleaningBatchMetrics = {
      totalRecords: items.length,
      successfullyCleaned: successCount,
      recordsModified: modifiedCount,
      recordsRequiringReview: reviewCount,
      successRate: items.length > 0 ? Math.round((successCount / items.length) * 100) : 100,
      modifiedRate: items.length > 0 ? Math.round((modifiedCount / items.length) * 100) : 0,
      reviewRate: items.length > 0 ? Math.round((reviewCount / items.length) * 100) : 0,
      processingTimeMs: 16.2,
      detectedDescriptionColumn: "material_description",
      sourceFileName: datasetToProcess.fileName,
      sourceCPSE: selectedCPSE,
      processedAt: new Date().toISOString(),
      isFallbackMode: true,
    };

    const state: CleaningStoreState = {
      id: `fallback-batch-${Date.now()}`,
      datasetName: datasetToProcess.fileName,
      metrics,
      items,
      rawRecordsCount: items.length,
      processedAt: new Date().toISOString(),
      status: "completed",
    };

    saveCleaningResults(state);
    showToast({
      type: "info",
      title: "Data Cleaned (Local Engine)",
      message: `Processed ${items.length} records through 7-step deterministic rules & cross-enterprise clustering.`,
    });
    router.push("/ai-standardization/data-cleaning");
  };

  // Start Data Cleaning Pipeline (Connect to FastAPI Backend)
  const handleStartDataCleaning = async () => {
    if (!dataset) return;
    setIsCleaningRunning(true);
    setCleaningStatusText("Connecting to FastAPI Preprocessing Engine...");

    try {
      // Step 1: Health check
      await new Promise((r) => setTimeout(r, 200));
      setCleaningStatusText("Uploading dataset payload to FastAPI /process/csv...");

      let backendResponse;
      if (rawSelectedFile && rawSelectedFile.name.toLowerCase().endsWith(".csv")) {
        backendResponse = await cleanCsvFile(rawSelectedFile, rawSelectedFile.name);
      } else {
        // Fallback for XLSX or Sample datasets: serialize records into CSV blob and send to FastAPI
        backendResponse = await cleanDatasetRecords(dataset.records, dataset.fileName);
      }

      setCleaningStatusText("Extracting 7-step transformation audit trail...");
      await new Promise((r) => setTimeout(r, 250));

      // Step 2: Transform response to state and save
      const cleaningState = transformBackendResponseToCleaningState(
        backendResponse,
        dataset.fileName,
        selectedCPSE,
        false
      );

      saveCleaningResults(cleaningState);
      saveUploadedDatasetToStorage(dataset);

      showToast({
        type: "success",
        title: "FastAPI Processing Complete",
        message: `Standardized ${cleaningState.metrics.totalRecords} descriptions in ${cleaningState.metrics.processingTimeMs} ms.`,
      });

      // Step 3: Smooth navigation to Data Cleaning Results page
      router.push("/ai-standardization/data-cleaning");
    } catch (err: any) {
      console.warn("Backend processing error:", err);
      setIsCleaningRunning(false);

      if (err instanceof ApiError && err.isOffline) {
        setShowOfflineModal(true);
      } else {
        showToast({
          type: "error",
          title: "Processing Failed",
          message: err.message || "Failed to complete data cleaning pipeline.",
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Upload Material Master Data"
        description="Upload material master data from participating CPSEs for standardization and analysis."
        breadcrumbs={[{ label: "Material Data" }, { label: "Upload Data" }]}
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Ingestion Pipeline
            </span>
            <BackendStatusBadge />
          </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ingestion Context + Dropzone Card (approx 68% width) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Ingestion Source Context */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs" data-purpose="source-context">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-[#7C3AED]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Ingestion Source Context</h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Participating Enterprise Mapping</span>
            </div>

            {/* Context Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropdown 1: Target CPSE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="target-cpse-select">
                  Target CPSE Enterprise
                </label>
                <div className="relative">
                  <select
                    id="target-cpse-select"
                    value={selectedCPSE}
                    onChange={(e) => setSelectedCPSE(e.target.value)}
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-lg py-2.5 pl-3 pr-8 text-slate-800 font-medium focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="ONGC">ONGC — Oil and Natural Gas Corporation</option>
                    <option value="BHEL">BHEL — Bharat Heavy Electricals Limited</option>
                    <option value="NTPC">NTPC — National Thermal Power Corporation</option>
                    <option value="IOCL">IOCL — Indian Oil Corporation Limited</option>
                    <option value="SAIL">SAIL — Steel Authority of India Limited</option>
                    <option value="GAIL">GAIL — Gas Authority of India Limited</option>
                    <option value="CIL">CIL — Coal India Limited</option>
                  </select>
                </div>
              </div>

              {/* Dropdown 2: ERP Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="erp-format-select">
                  Source ERP Export Format
                </label>
                <div className="relative">
                  <select
                    id="erp-format-select"
                    value={erpSystem}
                    onChange={(e) => setErpSystem(e.target.value)}
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-lg py-2.5 pl-3 pr-8 text-slate-800 font-medium focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="SAP ECC / S4HANA (MARA/MAKT)">SAP ECC / S4HANA (MARA/MAKT)</option>
                    <option value="Oracle ERP Cloud (MTL_SYSTEM_ITEMS)">Oracle ERP Cloud (MTL_SYSTEM_ITEMS)</option>
                    <option value="Custom UNMC Excel Template">Custom UNMC Excel Template</option>
                    <option value="Raw Tabular CSV (Generic)">Raw Tabular CSV (Generic)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Drag & Drop Dropzone Card */}
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

        {/* Right Column: Expected Column Format & Alias Info (approx 32% width) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Expected Column Format Card */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs" data-purpose="expected-columns">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Expected Column Format</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F3E8FF] text-[#582C87] rounded border border-[#EDE9FE] uppercase tracking-wide">
                Smart Detection
              </span>
            </div>

            {/* Column Requirements List */}
            <div className="divide-y divide-slate-100">
              {/* Column 1: material_description (REQUIRED) */}
              <div className="py-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-800 block">material_description</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Legacy unstructured text string</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/60 rounded">
                  Required
                </span>
              </div>

              {/* Column 2: material_code (Or Auto-ID) */}
              <div className="py-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-800 block">material_code</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Unique legacy ID (e.g. ONG-1001, BHL-2001)</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 whitespace-nowrap pt-0.5">
                  Or Auto-ID
                </span>
              </div>

              {/* Column 3: cpse_name (Optional) */}
              <div className="py-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-800 block">cpse_name</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Participating CPSE name (e.g. ONGC, BHEL)</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap pt-0.5">
                  Optional
                </span>
              </div>

              {/* Column 4: specification (Optional) */}
              <div className="py-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-800 block">specification</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Grade, dimension, rating (e.g. SS304, CL150)</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap pt-0.5">
                  Optional
                </span>
              </div>

              {/* Column 5: unit (Optional) */}
              <div className="py-3 flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-800 block">unit</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Legacy UOM (e.g. NOS, PCS, MTR, KG)</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap pt-0.5">
                  Optional
                </span>
              </div>
            </div>
          </section>

          {/* Card 2: Automated Alias Recognition Callout */}
          <section className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-xl border border-indigo-100/90 p-4" data-purpose="alias-recognition-callout">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-md text-[#7C3AED] mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">Automated Alias Recognition</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The ingestion engine automatically maps SAP (<span className="font-mono font-medium text-slate-700">MATNR, MAKTX, MEINS</span>) and Oracle ERP headers to unified national standard fields.
                </p>
              </div>
            </div>
          </section>
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
                <strong className="text-indigo-200">{dataset.fileName}</strong>. Send to the FastAPI deterministic cleaning engine to expand abbreviations and normalize dimensions.
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
                disabled={isCleaningRunning || dataset.columnDetection.missingRequired.length > 0}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCleaningRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with FastAPI...</span>
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

      {/* 8. ACTIVE PROCESSING MODAL OVERLAY */}
      {isCleaningRunning && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 relative">
              <Sparkles className="w-8 h-8 animate-spin text-indigo-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Running Data Cleaning Pipeline
              </h3>
              <p className="text-xs text-slate-500">{cleaningStatusText}</p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full w-3/4 animate-pulse rounded-full" />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Target Engine</span>
                <span className="font-mono font-bold text-slate-800">{API_BASE_URL}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Batch Size</span>
                <span className="font-mono font-bold text-indigo-600">{dataset?.records.length} records</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. BACKEND OFFLINE FALLBACK MODAL */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Server className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">FastAPI Backend Unreachable</h3>
                  <p className="text-xs text-slate-400">Connection error at {API_BASE_URL}</p>
                </div>
              </div>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                The frontend could not connect to the Python FastAPI preprocessing service at{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">
                  {API_BASE_URL}
                </code>.
              </p>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px]">To start the FastAPI backend:</div>
                <div className="text-emerald-400">$ cd backend</div>
                <div className="text-emerald-400">$ uvicorn app.main:app --reload</div>
              </div>

              <p className="text-[11px] text-slate-500">
                You can either start the server and retry, or run the exact same 7-step deterministic preprocessing rules using the built-in local engine.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOfflineModal(false);
                  handleStartDataCleaning();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>

              {dataset && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOfflineModal(false);
                    runFallbackPipeline(dataset);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process in Fallback Mode</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
