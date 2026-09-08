import React from "react";
import { CPSE } from "@/lib/types";

interface CPSEBadgeProps {
  cpse: CPSE | string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const CPSEBadge: React.FC<CPSEBadgeProps> = ({ cpse, className = "", size = "md" }) => {
  const getCPSEStyles = (org: string) => {
    switch (org.toUpperCase()) {
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

  const sizeStyles =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.2"
      : size === "sm"
      ? "text-xs px-2 py-0.5"
      : size === "lg"
      ? "text-sm px-3 py-1"
      : "text-xs px-2.5 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded font-semibold tracking-wide border ${getCPSEStyles(
        cpse || "ONGC"
      )} ${sizeStyles} ${className}`}
    >
      {cpse}
    </span>
  );
};
