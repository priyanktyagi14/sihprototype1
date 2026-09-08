import React from "react";
import { ProcessingStatus } from "@/lib/types";
import { CheckCircle2, Clock, XCircle, AlertCircle, FileCode } from "lucide-react";

interface StatusBadgeProps {
  status: ProcessingStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "", showIcon = true }) => {
  switch (status) {
    case "cleaned":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Cleaned
        </span>
      );
    case "approved":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
          Approved
        </span>
      );
    case "pending_review":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          Pending Review
        </span>
      );
    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          Rejected
        </span>
      );
    case "raw":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {showIcon && <FileCode className="w-3.5 h-3.5 text-slate-500" />}
          Raw
        </span>
      );
  }
};
