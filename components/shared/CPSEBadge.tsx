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
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "BHEL":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "NTPC":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "IOCL":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "SAIL":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "GAIL":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "CIL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
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
      : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded font-bold tracking-wide border ${getCPSEStyles(
        cpse || "ONGC"
      )} ${sizeStyles} ${className}`}
    >
      {cpse}
    </span>
  );
};

