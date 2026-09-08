"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastDispatch: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(toast: Omit<ToastMessage, "id">) {
  if (toastDispatch) {
    toastDispatch(toast);
  } else if (typeof window !== "undefined") {
    // Dispatch custom browser event as fallback
    window.dispatchEvent(
      new CustomEvent("sih_show_toast", { detail: { ...toast, id: String(Date.now()) } })
    );
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastDispatch = (toast) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration || 4500;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      if (customEvent.detail) {
        const t = customEvent.detail;
        setToasts((prev) => [...prev, t]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((item) => item.id !== t.id));
        }, t.duration || 4500);
      }
    };

    window.addEventListener("sih_show_toast", handleCustomToast);
    return () => {
      toastDispatch = null;
      window.removeEventListener("sih_show_toast", handleCustomToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 flex items-start gap-3 text-xs sm:text-sm animate-in slide-in-from-bottom-3 ${
              isSuccess
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-700/60 shadow-emerald-950/30"
                : isError
                ? "bg-rose-950/90 text-rose-100 border-rose-700/60 shadow-rose-950/30"
                : isWarning
                ? "bg-amber-950/90 text-amber-100 border-amber-700/60 shadow-amber-950/30"
                : "bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-950/30"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {isInfo && <Info className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className="flex-1 space-y-0.5 min-w-0">
              <p className="font-semibold leading-tight text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-xs opacity-85 leading-snug">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
