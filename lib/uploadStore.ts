import { ParsedDataset } from "./types";

const STORAGE_KEY = "sih_latest_uploaded_dataset";

/**
 * Saves parsed dataset into browser session storage for seamless module handoff
 */
export function saveUploadedDatasetToStorage(dataset: ParsedDataset): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  } catch (err) {
    console.warn("Unable to save dataset to sessionStorage:", err);
  }
}

/**
 * Retrieves the latest uploaded dataset from browser storage
 */
export function getLatestUploadedDataset(): ParsedDataset | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ParsedDataset;
  } catch (err) {
    console.warn("Unable to read dataset from sessionStorage:", err);
    return null;
  }
}

/**
 * Clears stored upload dataset
 */
export function clearStoredUploadedDataset(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Unable to clear sessionStorage:", err);
  }
}

/**
 * Placeholder for future FastAPI integration:
 * POST /api/v1/materials/upload
 */
export async function uploadDatasetToBackendAPI(
  file: File,
  metadata?: { cpse: string; erpSystem: string }
): Promise<{ success: boolean; datasetId?: string; message: string }> {
  // When FastAPI backend is connected:
  // const formData = new FormData();
  // formData.append("file", file);
  // formData.append("cpse", metadata?.cpse || "");
  // const res = await fetch("/api/v1/materials/upload", { method: "POST", body: formData });
  // return await res.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        datasetId: `ds-api-${Date.now()}`,
        message: `Successfully sent ${file.name} to ingestion pipeline.`,
      });
    }, 600);
  });
}
