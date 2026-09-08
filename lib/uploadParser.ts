import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  ParsedDataset,
  StandardizedUploadRecord,
  ColumnDetectionResult,
  DetectedColumn,
  DatasetSummaryStats,
} from "./types";

// Standard column alias definitions for flexible legacy ERP ingestion
const COLUMN_ALIASES: Record<DetectedColumn["key"], { label: string; aliases: string[]; isRequired: boolean; description: string }> = {
  material_description: {
    label: "Material Description",
    aliases: [
      "material_description",
      "material_desc",
      "raw_description",
      "raw_desc",
      "description",
      "item_description",
      "item_desc",
      "maktx",
      "desc",
      "short_text",
      "materialdescription",
      "part_description",
      "item_details",
    ],
    isRequired: true,
    description: "Unstructured legacy text description of the material or spare part.",
  },
  material_code: {
    label: "Material Code",
    aliases: [
      "material_code",
      "materialcode",
      "material_id",
      "matnr",
      "item_code",
      "item_number",
      "part_number",
      "part_no",
      "code",
      "mat_code",
      "item_id",
      "legacy_code",
      "itemcode",
    ],
    isRequired: false, // Can be auto-generated with temporary IDs if absent
    description: "Unique legacy identifier from CPSE ERP (or auto-generated temporary ID).",
  },
  cpse_name: {
    label: "CPSE Name",
    aliases: [
      "cpse_name",
      "cpse",
      "enterprise",
      "org",
      "company",
      "psu",
      "organization",
      "entity",
      "plant_cpse",
      "cpse_code",
      "source_cpse",
    ],
    isRequired: false,
    description: "Participating Central Public Sector Enterprise name (e.g. ONGC, BHEL).",
  },
  specification: {
    label: "Specification",
    aliases: [
      "specification",
      "specification_details",
      "specs",
      "spec",
      "material_spec",
      "technical_spec",
      "grade",
      "dimension",
      "dimensions",
      "specifications",
      "spec_desc",
      "rating",
      "standard",
    ],
    isRequired: false,
    description: "Technical dimensions, material grades (e.g. SS304, A105, Class 150), or standards.",
  },
  unit: {
    label: "Unit of Measure",
    aliases: [
      "unit",
      "unit_of_measure",
      "uom",
      "legacy_uom",
      "meins",
      "base_unit",
      "units",
      "uom_code",
      "measurement_unit",
      "unit_measure",
      "qty_unit",
    ],
    isRequired: false,
    description: "Standard or legacy unit of measurement (e.g. NOS, PCS, MTR, KG, SET).",
  },
  category: {
    label: "Category / Material Group",
    aliases: [
      "category",
      "mat_group",
      "material_group",
      "matkl",
      "commodity",
      "item_group",
      "class",
      "family",
      "discipline",
    ],
    isRequired: false,
    description: "Legacy taxonomy category or material group hierarchy.",
  },
  plant: {
    label: "Plant / Location",
    aliases: [
      "plant",
      "location",
      "werks",
      "plant_location",
      "unit_location",
      "site",
      "facility",
      "refinery",
    ],
    isRequired: false,
    description: "CPSE operating unit, plant, or refinery location.",
  },
};

/**
 * Format bytes into human-readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Clean & normalize header string for comparison
 */
function normalizeHeaderName(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Automatically detects standard columns from raw header names
 */
export function detectColumnsFromHeaders(rawHeaders: string[], sampleRows: Record<string, any>[] = []): ColumnDetectionResult {
  const normalizedRawMap = new Map<string, string>();
  rawHeaders.forEach((h) => {
    normalizedRawMap.set(normalizeHeaderName(h), h);
  });

  const matchedRawHeaders = new Set<string>();
  const detectedColumns: DetectedColumn[] = [];

  // Check each standardized column key
  (Object.keys(COLUMN_ALIASES) as DetectedColumn["key"][]).forEach((key) => {
    const config = COLUMN_ALIASES[key];
    let matchedOriginalHeader: string | null = null;

    // Search for direct or alias matches
    for (const alias of config.aliases) {
      const normalizedAlias = normalizeHeaderName(alias);
      if (normalizedRawMap.has(normalizedAlias)) {
        matchedOriginalHeader = normalizedRawMap.get(normalizedAlias)!;
        break;
      }
    }

    // Fallback: substring matching if not directly matched
    if (!matchedOriginalHeader) {
      for (const [normHeader, origHeader] of normalizedRawMap.entries()) {
        if (
          !matchedRawHeaders.has(origHeader) &&
          config.aliases.some((alias) => normHeader.includes(normalizeHeaderName(alias)))
        ) {
          matchedOriginalHeader = origHeader;
          break;
        }
      }
    }

    const isDetected = matchedOriginalHeader !== null;
    if (matchedOriginalHeader) {
      matchedRawHeaders.add(matchedOriginalHeader);
    }

    // Extract sample value if available
    let sampleValue: string | undefined;
    if (matchedOriginalHeader && sampleRows.length > 0) {
      const firstNonEmpty = sampleRows.find((r) => r[matchedOriginalHeader!] !== undefined && r[matchedOriginalHeader!] !== "");
      if (firstNonEmpty) {
        sampleValue = String(firstNonEmpty[matchedOriginalHeader]);
      }
    }

    detectedColumns.push({
      key,
      label: config.label,
      originalHeader: matchedOriginalHeader,
      isRequired: config.isRequired,
      isDetected,
      sampleValue,
      description: config.description,
    });
  });

  const missingRequired = detectedColumns.filter((c) => c.isRequired && !c.isDetected);
  const materialCodeCol = detectedColumns.find((c) => c.key === "material_code");
  const hasAutoGeneratedCode = !materialCodeCol?.isDetected;

  const extraHeaders = rawHeaders.filter((h) => !matchedRawHeaders.has(h));

  return {
    detected: detectedColumns,
    missingRequired,
    extraHeaders,
    totalHeaders: rawHeaders.length,
    hasAutoGeneratedCode,
  };
}

/**
 * Standardizes raw row objects into normalized StandardizedUploadRecord objects
 */
export function standardizeRecords(
  rawRows: Record<string, any>[],
  columnDetection: ColumnDetectionResult,
  fallbackCPSE = "CPSE-GENERAL"
): StandardizedUploadRecord[] {
  const colMap = new Map<DetectedColumn["key"], string | null>();
  columnDetection.detected.forEach((c) => colMap.set(c.key, c.originalHeader));

  const descHeader = colMap.get("material_description");
  const codeHeader = colMap.get("material_code");
  const cpseHeader = colMap.get("cpse_name");
  const specHeader = colMap.get("specification");
  const unitHeader = colMap.get("unit");

  return rawRows.map((row, index) => {
    const rawDesc = descHeader && row[descHeader] !== undefined ? String(row[descHeader]).trim() : "";
    let matCode = codeHeader && row[codeHeader] !== undefined ? String(row[codeHeader]).trim() : "";
    let isCodeAutoGenerated = false;

    if (!matCode) {
      matCode = `TMP-${String(1001 + index).padStart(5, "0")}`;
      isCodeAutoGenerated = true;
    }

    let cpse = cpseHeader && row[cpseHeader] !== undefined ? String(row[cpseHeader]).trim().toUpperCase() : "";
    if (!cpse) {
      cpse = fallbackCPSE;
    }

    const spec = specHeader && row[specHeader] !== undefined ? String(row[specHeader]).trim() : "";
    const unit = unitHeader && row[unitHeader] !== undefined ? String(row[unitHeader]).trim() : "NOS";

    const missingFieldNames: string[] = [];
    if (!rawDesc) missingFieldNames.push("Material Description");
    if (!spec) missingFieldNames.push("Specification");
    if (!unit) missingFieldNames.push("Unit");

    return {
      id: `up-rec-${index + 1}-${Date.now().toString().slice(-4)}`,
      rowIndex: index + 1,
      cpse,
      materialCode: matCode,
      materialDescription: rawDesc || "[Empty Description]",
      specification: spec || "—",
      unit: unit || "NOS",
      rawRow: row,
      hasMissingFields: missingFieldNames.length > 0,
      missingFieldNames,
      isCodeAutoGenerated,
    };
  });
}

/**
 * Calculates dataset summary metrics
 */
export function calculateDatasetSummary(
  records: StandardizedUploadRecord[],
  rawHeaders: string[]
): DatasetSummaryStats {
  const totalRecords = records.length;
  const totalColumns = rawHeaders.length;

  const cpseSet = new Set<string>();
  let totalMissingCells = 0;

  records.forEach((rec) => {
    if (rec.cpse && rec.cpse !== "CPSE-GENERAL") {
      cpseSet.add(rec.cpse);
    }
    // Check missing values across raw row or standard fields
    rawHeaders.forEach((h) => {
      const val = rec.rawRow[h];
      if (val === undefined || val === null || String(val).trim() === "") {
        totalMissingCells += 1;
      }
    });
  });

  const cpseList = Array.from(cpseSet);
  if (cpseList.length === 0 && totalRecords > 0) {
    cpseList.push("CPSE-GENERAL");
  }

  const totalPossibleCells = totalRecords * (totalColumns || 1);
  const emptyFieldPercentage = totalPossibleCells > 0 ? (totalMissingCells / totalPossibleCells) * 100 : 0;
  const dataQualityScore = Math.max(10, Math.min(100, Math.round(100 - emptyFieldPercentage)));

  return {
    totalRecords,
    totalColumns,
    cpseCount: cpseList.length,
    cpseList,
    missingValuesCount: totalMissingCells,
    dataQualityScore,
    emptyFieldPercentage: Math.round(emptyFieldPercentage * 10) / 10,
  };
}

/**
 * Parse CSV raw text or file
 */
function parseCSVContent(fileContent: string): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(fileContent, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = (results.data || []).filter((r) => {
          return Object.values(r).some((v) => v !== null && v !== undefined && String(v).trim() !== "");
        });
        resolve({ headers, rows });
      },
      error: (err: Error) => {
        reject(new Error(`CSV Parsing Error: ${err.message}`));
      },
    });
  });
}

/**
 * Parse Excel array buffer (XLSX, XLS)
 */
function parseExcelContent(arrayBuffer: ArrayBuffer): { headers: string[]; rows: Record<string, any>[] } {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  if (workbook.SheetNames.length === 0) {
    throw new Error("Excel file has no worksheets.");
  }
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to json with header row
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: "",
    raw: false,
  });

  if (rawRows.length === 0) {
    // Try getting header row even if no data
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
      if (cell && cell.v) headers.push(String(cell.v).trim());
    }
    return { headers, rows: [] };
  }

  const headers = Object.keys(rawRows[0] || {});
  return { headers, rows: rawRows };
}

/**
 * Master file parser for CSV, XLSX, XLS
 */
export async function parseUploadedFile(file: File, selectedDefaultCPSE = "ONGC"): Promise<ParsedDataset> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  let fileType: ParsedDataset["fileType"] = "UNKNOWN";

  if (extension === "csv" || extension === "txt") fileType = "CSV";
  else if (extension === "xlsx") fileType = "XLSX";
  else if (extension === "xls") fileType = "XLS";
  else if (extension === "tsv") fileType = "TSV";

  if (fileType === "UNKNOWN") {
    throw new Error(`Unsupported file format (.${extension}). Please upload a .csv or .xlsx / .xls file.`);
  }

  if (file.size === 0) {
    throw new Error("The selected file is completely empty (0 Bytes).");
  }

  let headers: string[] = [];
  let rawRows: Record<string, any>[] = [];

  if (fileType === "CSV" || fileType === "TSV") {
    const text = await file.text();
    const parsed = await parseCSVContent(text);
    headers = parsed.headers;
    rawRows = parsed.rows;
  } else {
    const buffer = await file.arrayBuffer();
    const parsed = parseExcelContent(buffer);
    headers = parsed.headers;
    rawRows = parsed.rows;
  }

  if (headers.length === 0) {
    throw new Error("No column headers detected in the file. Please ensure the first row contains column headers.");
  }

  if (rawRows.length === 0) {
    throw new Error("No data records found in the uploaded file. Only headers were present.");
  }

  // Detect columns
  const columnDetection = detectColumnsFromHeaders(headers, rawRows.slice(0, 10));

  // Validation errors & warnings
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  if (columnDetection.missingRequired.length > 0) {
    const missingNames = columnDetection.missingRequired.map((c) => c.label).join(", ");
    validationErrors.push(`Required column missing: [${missingNames}]. The dataset must contain material descriptions.`);
  }

  if (columnDetection.hasAutoGeneratedCode) {
    validationWarnings.push("No 'Material Code' column detected. Temporary unique IDs (TMP-1001, TMP-1002...) will be assigned automatically.");
  }

  const cpseCol = columnDetection.detected.find((c) => c.key === "cpse_name");
  if (!cpseCol?.isDetected) {
    validationWarnings.push(`No 'CPSE Name' column found. Defaulting enterprise ownership to '${selectedDefaultCPSE}'.`);
  }

  const records = standardizeRecords(
    rawRows,
    columnDetection,
    cpseCol?.isDetected ? undefined : selectedDefaultCPSE
  );

  const summary = calculateDatasetSummary(records, headers);

  let validationStatus: ParsedDataset["validationStatus"] = "valid";
  if (validationErrors.length > 0) {
    validationStatus = "error";
  } else if (validationWarnings.length > 0) {
    validationStatus = "warning";
  }

  return {
    id: `ds-${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    fileSizeBytesFormatted: formatBytes(file.size),
    fileType,
    rawHeaders: headers,
    records,
    columnDetection,
    summary,
    validationStatus,
    validationErrors,
    validationWarnings,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Returns a high quality preloaded demonstration dataset for testing with 1-click
 */
export function getPreloadedSampleDataset(): ParsedDataset {
  const sampleRows: Record<string, any>[] = [
    {
      cpse_name: "ONGC",
      material_code: "ONG-1001",
      material_description: "SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR",
      specification: "SS304 / ASTM A193 B8",
      unit: "NOS",
      category: "Fasteners",
      plant: "Mumbai Offshore High",
    },
    {
      cpse_name: "BHEL",
      material_code: "BHL-2001",
      material_description: "STAINLESS STEEL HEXAGONAL BOLT M10 X 50MM GRADE 316",
      specification: "SS316 / IS 1364",
      unit: "PCS",
      category: "Hardware",
      plant: "Bhopal Unit-02",
    },
    {
      cpse_name: "NTPC",
      material_code: "NTP-4402",
      material_description: "CS FLG WNRF 150# 4\" SCH 40 ASTM A105",
      specification: "ASTM A105 / ANSI B16.5",
      unit: "NO",
      category: "Piping & Flanges",
      plant: "Singrauli Super Thermal",
    },
    {
      cpse_name: "IOCL",
      material_code: "IOC-7719",
      material_description: "CARBON STEEL WELD NECK FLANGE 4 INCH 150 LBS SCH40 A105N",
      specification: "ASME B16.5 CL150 A105N",
      unit: "EA",
      category: "Piping Spares",
      plant: "Mathura Refinery",
    },
    {
      cpse_name: "GAIL",
      material_code: "GAL-5091",
      material_description: "BALL VLV 2 IN 600# FLGD FB SS316 BODY PTFE SEAT",
      specification: "API 6D / ASME B16.34 600#",
      unit: "NOS",
      category: "Valves",
      plant: "Hazira-Vijaipur-Jagdishpur Pipeline",
    },
    {
      cpse_name: "SAIL",
      material_code: "SAIL-3321",
      material_description: "BALL VALVE 2\" CLASS 600 FULL BORE FLANGED SS 316",
      specification: "SS 316 / Class 600",
      unit: "SET",
      category: "Valves & Actuators",
      plant: "Bhilai Steel Plant",
    },
    {
      cpse_name: "ONGC",
      material_code: "ONG-9923",
      material_description: "CENTRIFUGAL PUMP IMPELLER BRONZE DIA 250MM SHAFT 45MM",
      specification: "BS 1400 LG2 Bronze",
      unit: "NOS",
      category: "Rotary Equipment",
      plant: "Hazira Gas Processing",
    },
    {
      cpse_name: "CIL",
      material_code: "CIL-1104",
      material_description: "HEAVY DUTY CONVEYOR BELT EP 400/3 800MM WIDTH DIN Y GRADE",
      specification: "DIN 22102 / EP 400",
      unit: "MTR",
      category: "Mining Equipment",
      plant: "South Eastern Coalfields",
    },
    {
      cpse_name: "BHEL",
      material_code: "BHL-8890",
      material_description: "GASKET SPIRAL WOUND 4\" 150# SS316 GRAPHITE FILLER ASME B16.20",
      specification: "ASME B16.20 150#",
      unit: "PCS",
      category: "Gaskets & Seals",
      plant: "Haridwar Heavy Electrical",
    },
    {
      cpse_name: "NTPC",
      material_code: "NTP-6651",
      material_description: "PRESSURE TRANSMITTER 4-20MA HART 0-100 BAR DC 24V",
      specification: "IP67 / Ex d IIC T4",
      unit: "NOS",
      category: "Instrumentation",
      plant: "Ramagundam Power",
    },
    {
      cpse_name: "IOCL",
      material_code: "IOC-3204",
      material_description: "SEAMLESS PIPE 2\" SCH 80 ASTM A106 GRADE B LENGTH 6M",
      specification: "ASTM A106 Gr.B",
      unit: "MTR",
      category: "Piping",
      plant: "Panipat Petrochemical",
    },
    {
      cpse_name: "GAIL",
      material_code: "GAL-9012",
      material_description: "STUD BOLT WITH 2 HEAVY HEX NUTS 3/4\" X 120MM ASTM A193 B7/2H",
      specification: "ASTM A193 B7 / A194 2H",
      unit: "SET",
      category: "Fasteners",
      plant: "Guna Compressor Station",
    },
  ];

  const headers = ["cpse_name", "material_code", "material_description", "specification", "unit", "category", "plant"];
  const columnDetection = detectColumnsFromHeaders(headers, sampleRows);
  const records = standardizeRecords(sampleRows, columnDetection, "ONGC");
  const summary = calculateDatasetSummary(records, headers);

  return {
    id: "sample-demo-cpse-2026",
    fileName: "CPSE_Consolidated_Master_Data_Demo.csv",
    fileSize: 4520,
    fileSizeBytesFormatted: "4.4 KB",
    fileType: "CSV",
    rawHeaders: headers,
    records,
    columnDetection,
    summary,
    validationStatus: "valid",
    validationErrors: [],
    validationWarnings: [],
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Downloads a sample CSV template file
 */
export function downloadSampleCSVTemplate(cpse = "ONGC") {
  const headers = ["cpse_name", "material_code", "material_description", "specification", "unit", "category", "plant"];
  const sampleData = [
    [
      cpse,
      `${cpse.substring(0, 3).toUpperCase()}-1001`,
      "SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR",
      "SS304",
      "NOS",
      "Fasteners",
      "Offshore Complex",
    ],
    [
      cpse,
      `${cpse.substring(0, 3).toUpperCase()}-1002`,
      "CS FLG WNRF 150# 4\" SCH 40 ASTM A105",
      "ASTM A105",
      "PCS",
      "Piping",
      "Refinery Unit 1",
    ],
    [
      cpse,
      `${cpse.substring(0, 3).toUpperCase()}-1003`,
      "BALL VALVE 2\" 600# FLANGED FULL BORE SS316",
      "API 6D CL600",
      "NOS",
      "Valves",
      "Gas Terminal",
    ],
    [
      cpse,
      `${cpse.substring(0, 3).toUpperCase()}-1004`,
      "SEAMLESS PIPE 2 INCH SCH 80 ASTM A106 GR B",
      "ASTM A106 GR B",
      "MTR",
      "Piping",
      "Process Plant",
    ],
    [
      cpse,
      `${cpse.substring(0, 3).toUpperCase()}-1005`,
      "PRESSURE TRANSMITTER 4-20MA 0-100 BAR HART",
      "IP67 / Ex-proof",
      "NOS",
      "Instrumentation",
      "Control Room",
    ],
  ];

  const csvRows = [headers.join(",")];
  sampleData.forEach((row) => {
    const escaped = row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    csvRows.push(escaped.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `cpse_material_master_template_${cpse.toLowerCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a sample Excel XLSX template file
 */
export function downloadSampleXLSXTemplate(cpse = "ONGC") {
  const sampleData = [
    {
      cpse_name: cpse,
      material_code: `${cpse.substring(0, 3).toUpperCase()}-1001`,
      material_description: "SS HEX BOLT M10X50 MM WITH NUT & 2 WSHR",
      specification: "SS304",
      unit: "NOS",
      category: "Fasteners",
      plant: "Offshore Complex",
    },
    {
      cpse_name: cpse,
      material_code: `${cpse.substring(0, 3).toUpperCase()}-1002`,
      material_description: "CS FLG WNRF 150# 4\" SCH 40 ASTM A105",
      specification: "ASTM A105",
      unit: "PCS",
      category: "Piping",
      plant: "Refinery Unit 1",
    },
    {
      cpse_name: cpse,
      material_code: `${cpse.substring(0, 3).toUpperCase()}-1003`,
      material_description: "BALL VALVE 2\" 600# FLANGED FULL BORE SS316",
      specification: "API 6D CL600",
      unit: "NOS",
      category: "Valves",
      plant: "Gas Terminal",
    },
    {
      cpse_name: cpse,
      material_code: `${cpse.substring(0, 3).toUpperCase()}-1004`,
      material_description: "SEAMLESS PIPE 2 INCH SCH 80 ASTM A106 GR B",
      specification: "ASTM A106 GR B",
      unit: "MTR",
      category: "Piping",
      plant: "Process Plant",
    },
    {
      cpse_name: cpse,
      material_code: `${cpse.substring(0, 3).toUpperCase()}-1005`,
      material_description: "PRESSURE TRANSMITTER 4-20MA 0-100 BAR HART",
      specification: "IP67 / Ex-proof",
      unit: "NOS",
      category: "Instrumentation",
      plant: "Control Room",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Material_Master");

  // Auto-fit column widths
  const maxProps = ["cpse_name", "material_code", "material_description", "specification", "unit", "category", "plant"];
  worksheet["!cols"] = maxProps.map((key) => ({
    wch: Math.max(key.length, ...sampleData.map((r) => String((r as any)[key] || "").length)) + 4,
  }));

  XLSX.writeFile(workbook, `cpse_material_master_template_${cpse.toLowerCase()}.xlsx`);
}
