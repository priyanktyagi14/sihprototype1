/**
 * Centralized API Client for SIH Material Standardization FastAPI Backend.
 * Uses NEXT_PUBLIC_API_BASE_URL with fallback to http://localhost:8000.
 */

import {
  BackendHealthResponse,
  BackendMaterialResponse,
  BackendCSVProcessResponse,
  StandardizedUploadRecord,
} from "./types";

function normalizeApiBaseUrl(url?: string): string {
  const target = url && url.trim() ? url.trim() : (process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000");
  let clean = target.replace(/\/+$/, "");

  // If protocol is missing and it's not localhost/127.0.0.1, prepend https://
  if (!/^https?:\/\//i.test(clean)) {
    clean = /^localhost(:\d+)?/i.test(clean) || /^127\.0\.0\.1(:\d+)?/i.test(clean)
      ? `http://${clean}`
      : `https://${clean}`;
  }

  // Remove /docs suffix if copied from Swagger UI
  clean = clean.replace(/\/docs$/, "");
  // If user entered /api at the end, strip it because endpoints are /process/csv etc.
  if (clean.endsWith("/api")) {
    clean = clean.replace(/\/api$/, "");
  }
  return clean;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export class ApiError extends Error {
  status: number;
  isOffline: boolean;
  details?: unknown;

  constructor(message: string, status = 500, isOffline = false, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isOffline = isOffline;
    this.details = details;
  }
}

/**
 * Checks if the FastAPI backend service is reachable and healthy.
 */
export async function checkBackendHealth(timeoutMs = 3000): Promise<BackendHealthResponse> {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);

    if (!res.ok) {
      throw new ApiError(
        `Backend returned error status ${res.status}`,
        res.status,
        false
      );
    }

    const data = await res.json();
    return {
      status: "healthy",
      service: data.service || "SIH Material Standardization Engine",
      version: data.version || "1.0.0",
      timestamp: data.timestamp || new Date().toISOString(),
      latencyMs: latency,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const errName = err && typeof err === "object" && "name" in err ? String((err as any).name) : "";
    const errMsg = err && typeof err === "object" && "message" in err ? String((err as any).message) : "";
    const errStatus = err && typeof err === "object" && "status" in err ? Number((err as any).status) : 0;
    const isNetworkError =
      errName === "AbortError" ||
      errMsg.includes("Failed to fetch") ||
      errMsg.includes("NetworkError") ||
      errMsg.includes("fetch failed");

    throw new ApiError(
      isNetworkError
        ? `Cannot connect to FastAPI backend at ${API_BASE_URL}. Ensure uvicorn is running.`
        : errMsg || "Failed to reach health endpoint.",
      errStatus,
      isNetworkError
    );
  }
}

/**
 * Sends a single material description string to FastAPI 7-step pipeline.
 */
export async function cleanSingleMaterial(
  description: string
): Promise<BackendMaterialResponse> {
  if (!description || !description.trim()) {
    return {
      raw_description: description,
      cleaned_description: "",
      changes: ["Empty description provided"],
      processing_status: "error",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/process/material`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ material_description: description }),
    });

    if (!res.ok) {
      let detailMsg = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        detailMsg = errorData.detail || errorData.message || detailMsg;
      } catch {
        // Ignore parsing errors for non-JSON error bodies
      }
      throw new ApiError(detailMsg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const errMsg = err && typeof err === "object" && "message" in err ? String((err as Record<string, unknown>).message) : "";
    const isOffline =
      errMsg.includes("Failed to fetch") ||
      errMsg.includes("fetch failed");
    throw new ApiError(
      isOffline
        ? `Backend unreachable at ${API_BASE_URL}`
        : errMsg || "Error processing single material",
      0,
      isOffline
    );
  }
}

/**
 * Uploads a CSV File directly to the FastAPI /process/csv endpoint.
 */
export async function cleanCsvFile(
  file: File | Blob,
  fileName = "dataset.csv",
  columnName?: string
): Promise<BackendCSVProcessResponse> {
  const formData = new FormData();
  formData.append("file", file, fileName);

  const url = new URL(`${API_BASE_URL}/process/csv`);
  if (columnName) {
    url.searchParams.set("column_name", columnName);
  }

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let detailMsg = `Batch processing failed (Status ${res.status})`;
      try {
        const errorData = await res.json();
        detailMsg = errorData.detail || errorData.message || detailMsg;
      } catch {
        // Ignore JSON parse error on non-JSON error response
      }

      if (res.status === 404) {
        detailMsg = `Backend endpoint 404 Not Found at ${url.toString()}. Check that NEXT_PUBLIC_API_BASE_URL points to your backend service (not frontend) and re-deploy.`;
      }
      throw new ApiError(detailMsg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const errMsg = err && typeof err === "object" && "message" in err ? String((err as Record<string, unknown>).message) : "";
    const isOffline =
      errMsg.includes("Failed to fetch") ||
      errMsg.includes("fetch failed");
    throw new ApiError(
      isOffline
        ? `Backend is offline at ${API_BASE_URL}. Start the FastAPI server.`
        : errMsg || "Error during CSV batch processing",
      0,
      isOffline
    );
  }
}

/**
 * Helper to serialize standardized upload records into a CSV Blob and post to backend.
 */
export async function cleanDatasetRecords(
  records: StandardizedUploadRecord[],
  fileName = "upload_dataset.csv"
): Promise<BackendCSVProcessResponse> {
  if (!records || records.length === 0) {
    throw new ApiError("No records provided to clean", 400);
  }

  // Generate CSV text
  const headers = ["material_id", "cpse_organization", "material_description", "category", "unit_of_measure"];
  const rows: string[] = [headers.join(",")];

  for (const r of records) {
    const code = escapeCsvValue(r.materialCode || "");
    const cpse = escapeCsvValue(r.cpse || "");
    const desc = escapeCsvValue(r.materialDescription || "");
    const cat = escapeCsvValue(r.specification || "General");
    const unit = escapeCsvValue(r.unit || "");
    rows.push(`${code},${cpse},${desc},${cat},${unit}`);
  }

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  return await cleanCsvFile(blob, fileName, "material_description");
}

function escapeCsvValue(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Fetch the active abbreviations dictionary from FastAPI.
 */
export async function getAbbreviations(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE_URL}/abbreviations`);
  if (!res.ok) throw new ApiError("Failed to fetch abbreviations", res.status);
  const data = await res.json();
  return data.abbreviations || {};
}

/**
 * Fetch standard units mapping dictionary from FastAPI.
 */
export async function getUnits(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE_URL}/units`);
  if (!res.ok) throw new ApiError("Failed to fetch units", res.status);
  const data = await res.json();
  return data.units || {};
}
