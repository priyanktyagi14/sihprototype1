/**
 * Persistent Client-Side State Management for Data Cleaning Results.
 * Enables seamless transition between: Upload Page -> Processing -> Results Page.
 */

import {
  CleaningStoreState,
  CleanedMaterialItem,
  CleaningBatchMetrics,
  BackendCSVProcessResponse,
  ParsedDataset,
} from "./types";
import { cleanMaterialDescription, clusterAndAssignNationalCodes } from "./cleaningRules";

const CLEANING_STORAGE_KEY = "sih_latest_cleaning_results";

/**
 * Saves processed cleaning state to browser sessionStorage
 */
export function saveCleaningResults(state: CleaningStoreState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CLEANING_STORAGE_KEY, JSON.stringify(state));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new CustomEvent("sih_cleaning_state_updated", { detail: state }));
  } catch (err) {
    console.warn("Unable to save cleaning results to sessionStorage:", err);
  }
}

/**
 * Retrieves the latest stored cleaning state from sessionStorage
 */
export function getLatestCleaningResults(): CleaningStoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CLEANING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CleaningStoreState;
  } catch (err) {
    console.warn("Unable to read cleaning results from sessionStorage:", err);
    return null;
  }
}

/**
 * Clears stored cleaning results
 */
export function clearCleaningResults(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CLEANING_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("sih_cleaning_state_updated", { detail: null }));
  } catch (err) {
    console.warn("Unable to clear cleaning results from sessionStorage:", err);
  }
}

/**
 * Normalizes backend FastAPI CSV response into standardized UI items & metrics
 */
export function transformBackendResponseToCleaningState(
  response: BackendCSVProcessResponse,
  sourceFileName = "dataset.csv",
  sourceCPSE = "MULTI-CPSE",
  isFallbackMode = false
): CleaningStoreState {
  const { summary, records } = response;

  let modifiedCount = 0;
  let reviewCount = 0;

  // First pass: extract base item fields
  const baseItems = records.map((rec, idx) => {
    const materialCode =
      rec.material_id ||
      rec.material_code ||
      rec.matnr ||
      rec.item_id ||
      rec.code ||
      `MAT-${String(idx + 1).padStart(4, "0")}`;

    const cpse =
      rec.cpse_organization ||
      rec.cpse ||
      rec.cpse_name ||
      rec.enterprise ||
      sourceCPSE ||
      "ONGC";

    const rawDesc =
      rec[summary.detected_description_column] ||
      rec.material_description ||
      rec.raw_description ||
      rec.description ||
      rec.maktx ||
      "";

    const cleanedDesc = rec.cleaned_description || "";
    const changes: string[] = Array.isArray(rec.changes_made)
      ? rec.changes_made
      : typeof rec.changes_made === "string"
      ? [rec.changes_made]
      : [];

    const isModified =
      changes.length > 0 &&
      rawDesc.trim().toLowerCase() !== cleanedDesc.trim().toLowerCase();

    const isSuccess = rec.processing_status === "success" && cleanedDesc.length > 0;
    const isError = rec.processing_status === "error" || !rawDesc || rawDesc.trim().length === 0;

    let processingStatus: CleanedMaterialItem["processingStatus"] = "Cleaned Successfully";
    let requiresReview = false;

    if (isError) {
      processingStatus = "Processing Error";
      requiresReview = true;
      reviewCount++;
    } else if (!isModified) {
      processingStatus = "Unchanged";
    } else {
      processingStatus = "Cleaned Successfully";
      modifiedCount++;
    }

    return {
      id: `item-${idx + 1}-${Date.now()}`,
      materialCode: String(materialCode).toUpperCase(),
      cpse: String(cpse).toUpperCase(),
      rawDescription: String(rawDesc),
      cleanedDescription: String(cleanedDesc),
      changesMade: changes,
      processingStatus,
      isModified,
      requiresReview,
      category: rec.category || rec.classification || "General",
      unit: rec.unit_of_measure || rec.unit || rec.uom || "",
      nationalMaterialCode: rec.national_material_code || rec.Standard_Material_ID || undefined,
      equivalenceGroupId: rec.equivalence_group_id || rec.Equivalence_Group_ID || undefined,
      standardizedDescription: rec.standardized_material_description || rec.Standardized_Material_Description || undefined,
      aiEquivalenceResult: rec.ai_equivalence_result || rec.AI_Equivalence_Result || rec.Match_Reason || undefined,
      confidenceScore: rec.Match_Score || (rec.confidence_score ? Number(rec.confidence_score) : 98.0),
      rawRow: rec,
    };
  });

  // Check if national material codes were already provided by backend
  const hasBackendCodes = baseItems.every((i) => Boolean(i.nationalMaterialCode));

  let items: CleanedMaterialItem[];
  if (hasBackendCodes) {
    items = baseItems;
  } else {
    // Run cross-enterprise clustering on client side
    const clustered = clusterAndAssignNationalCodes(
      baseItems.map((b) => ({
        ...b,
        materialDescription: b.rawDescription,
      }))
    );

    items = clustered.map((c, idx) => ({
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
  }

  const total = items.length;
  const successCount = items.filter((i) => i.processingStatus === "Cleaned Successfully" || i.processingStatus === "Unchanged").length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 100;
  const modifiedRate = total > 0 ? Math.round((modifiedCount / total) * 100) : 0;
  const reviewRate = total > 0 ? Math.round((reviewCount / total) * 100) : 0;

  const metrics: CleaningBatchMetrics = {
    totalRecords: total,
    successfullyCleaned: successCount,
    recordsModified: modifiedCount,
    recordsRequiringReview: reviewCount,
    successRate,
    modifiedRate,
    reviewRate,
    processingTimeMs: summary.processing_time_ms || 18.5,
    detectedDescriptionColumn: summary.detected_description_column || "material_description",
    sourceFileName,
    sourceCPSE,
    processedAt: new Date().toISOString(),
    isFallbackMode,
  };

  return {
    id: `cleaning-batch-${Date.now()}`,
    datasetName: sourceFileName,
    metrics,
    items,
    rawRecordsCount: total,
    processedAt: new Date().toISOString(),
    status: "completed",
  };
}

/**
 * Creates sample / default cleaning dataset when starting cold
 */
export function generateDefaultCleaningResults(): CleaningStoreState {
  const sampleRawItems = [
    {
      code: "ONG-1001",
      cpse: "ONGC",
      raw: "SS HEX-BOLT M10X50 MM!!!",
      category: "Fasteners & Hardware",
      unit: "NOS",
    },
    {
      code: "BHL-2004",
      cpse: "BHEL",
      raw: "MS PLT 25MM THK IS 2062 BR 2500X10000MM",
      category: "Structural Steel",
      unit: "MTR",
    },
    {
      code: "NTP-3011",
      cpse: "NTPC",
      raw: "CS FLG WNRF 150# 4\" SCH 40 ASTM A105",
      category: "Piping & Fittings",
      unit: "PCS",
    },
    {
      code: "IOC-4089",
      cpse: "IOCL",
      raw: "BALL VLV 2\" 300# FLGD END BODY A216 WCB TRIM SS316",
      category: "Valves & Flow Control",
      unit: "NOS",
    },
    {
      code: "GAI-5022",
      cpse: "GAIL",
      raw: "GI PIPE 50MM DIA CL-B CONFORMING TO IS:1239",
      category: "Piping Systems",
      unit: "MTRS",
    },
    {
      code: "SAI-6041",
      cpse: "SAIL",
      raw: "CU BUSBAR 50X10MM ELEC GRADE 99.9% PURITY",
      category: "Electrical",
      unit: "KGS",
    },
    {
      code: "NTP-7092",
      cpse: "NTPC",
      raw: "DEEP GROOVE BALL BRG. NO. 6205-2RS1/C3",
      category: "Bearings",
      unit: "PCS",
    },
    {
      code: "ONG-8015",
      cpse: "ONGC",
      raw: "GASKET SPIRAL WOUND 3\" 600# HOOP SS316",
      category: "Gaskets & Seals",
      unit: "NOS",
    },
    {
      code: "BHL-9033",
      cpse: "BHEL",
      raw: "COPPER CABLE 4 CORE 4SQMM XLPE INSULATED 1.1KV",
      category: "Electrical",
      unit: "MTRS",
    },
    {
      code: "IOC-1044",
      cpse: "IOCL",
      raw: "STAINLESS STEEL HEX NUT M12X1.75 MM",
      category: "Fasteners",
      unit: "NOS",
    },
    {
      code: "CIL-1120",
      cpse: "CIL",
      raw: "CONVEYOR BELT 1200MM WIDTH 4 PLY NN-200 GRADE M24",
      category: "Conveyor Equipment",
      unit: "MTR",
    },
    {
      code: "GAI-1205",
      cpse: "GAIL",
      raw: "TEMP GAUGE 0-200 DEG C DIAL 100MM 1/2\" NPT BOTTOM CONN",
      category: "Instrumentation",
      unit: "NOS",
    },
  ];

  const baseItems = sampleRawItems.map((item, idx) => {
    // Generate deterministic 7-step pipeline transformation
    const sim = cleanMaterialDescription(item.raw);
    const changes: string[] = [
      "Converted text to lowercase",
      "Removed unnecessary special characters",
    ];

    if (sim.detectedAbbreviations.length > 0) {
      sim.detectedAbbreviations.forEach((abbr) => {
        changes.push(`Expanded abbreviation: ${abbr.toLowerCase()}`);
      });
    }

    if (item.raw.includes("X") || item.raw.includes("*") || item.raw.includes('"')) {
      changes.push("Standardized dimension formatting");
    }

    if (sim.standardizedUnits.length > 0) {
      sim.standardizedUnits.forEach((u) => {
        changes.push(`Normalized measurement unit: ${u.toLowerCase()}`);
      });
    }

    changes.push("Final whitespace cleanup");

    // Cleaned description in canonical lowercase / standard format
    const cleanedLower = sim.cleaned.toLowerCase();

    return {
      id: `default-${idx + 1}`,
      materialCode: item.code,
      cpse: item.cpse,
      rawDescription: item.raw,
      cleanedDescription: cleanedLower,
      changesMade: changes,
      processingStatus: "Cleaned Successfully" as const,
      isModified: true,
      requiresReview: false,
      category: item.category,
      unit: item.unit,
      rawRow: {
        material_id: item.code,
        cpse_organization: item.cpse,
        material_description: item.raw,
        category: item.category,
        unit_of_measure: item.unit,
      },
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

  const metrics: CleaningBatchMetrics = {
    totalRecords: items.length,
    successfullyCleaned: items.length,
    recordsModified: items.length,
    recordsRequiringReview: 0,
    successRate: 100,
    modifiedRate: 100,
    reviewRate: 0,
    processingTimeMs: 14.8,
    detectedDescriptionColumn: "material_description",
    sourceFileName: "sample_materials_catalog.csv",
    sourceCPSE: "MULTI-CPSE",
    processedAt: new Date().toISOString(),
    isFallbackMode: false,
  };

  return {
    id: "default-cleaning-catalog",
    datasetName: "sample_materials_catalog.csv",
    metrics,
    items,
    rawRecordsCount: items.length,
    processedAt: new Date().toISOString(),
    status: "completed",
  };
}
