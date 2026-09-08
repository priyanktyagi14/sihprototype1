import React from "react";
import { CPSE } from "@/lib/types";

interface CPSEBadgeProps {
  cpse: CPSE;
  className?: string;
}

export const CPSEBadge: React.FC<CPSEBadgeProps> = ({ cpse, className = "" }) => {
  const getCPSEStyles = (org: CPSE) => {
    switch (org) {
      case "ONGC":
        return "bg-amber-50 text-amber-900 border-amber-300";
      case "BHEL":
        return "bg-blue-50 text-blue-900 border-blue-300";
      case "NTPC":
        return "bg-emerald-50 text-emerald-900 border-emerald-300";
      case "IOCL":
        return "bg-orange-50 text-orange-900 border-orange-300";
      case "SAIL":
        return "bg-indigo-50 text-indigo-900 border-indigo-300";
      case "GAIL":
        return "bg-cyan-50 text-cyan-900 border-cyan-300";
      case "CIL":
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${getCPSEStyles(
        cpse
      )} ${className}`}
    >
      {cpse}
    </span>
  );
};
