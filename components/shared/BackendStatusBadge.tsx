"use client";

import React, { useState, useEffect } from "react";
import { checkBackendHealth, API_BASE_URL } from "@/lib/apiClient";
import { BackendHealthResponse } from "@/lib/types";
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Server } from "lucide-react";

interface BackendStatusBadgeProps {
  onStatusChange?: (isOnline: boolean) => void;
  showDetails?: boolean;
}

export const BackendStatusBadge: React.FC<BackendStatusBadgeProps> = ({
  onStatusChange,
  showDetails = false,
}) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await checkBackendHealth(2500);
      setHealth(res);
      setIsOnline(true);
      if (onStatusChange) onStatusChange(true);
    } catch (err: any) {
      setHealth(null);
      setIsOnline(false);
      if (onStatusChange) onStatusChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          isOnline === true
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isOnline === false
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-slate-50 text-slate-600 border-slate-200"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isOnline === true && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline === true
                ? "bg-emerald-500"
                : isOnline === false
                ? "bg-rose-500"
                : "bg-slate-400"
            }`}
          />
        </span>

        <span className="font-medium flex items-center gap-1">
          {isOnline === true ? (
            <>
              <span>FastAPI Online</span>
              {health?.latencyMs !== undefined && (
                <span className="text-[10px] opacity-75 font-mono">({health.latencyMs}ms)</span>
              )}
            </>
          ) : isOnline === false ? (
            <span>FastAPI Offline</span>
          ) : (
            <span>Connecting...</span>
          )}
        </span>

        <button
          type="button"
          onClick={checkStatus}
          disabled={isChecking}
          title={`Ping ${API_BASE_URL}`}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 ml-0.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      {showDetails && isOnline === false && (
        <span className="text-[11px] text-rose-600 hidden sm:inline">
          (Run <code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[10px]">uvicorn app.main:app --reload</code> in backend/)
        </span>
      )}
    </div>
  );
};
