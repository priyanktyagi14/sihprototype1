"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  UploadCloud,
  FileText,
  CheckCircle,
  Sparkles,
  Cpu,
  Layers,
  FileCheck2,
  Clock,
  CheckCheck,
  XCircle,
  BarChart3,
  ScrollText,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  Menu,
  X,
  Sparkle,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeType?: "coming_soon" | "active" | "count";
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Data Pipeline": true,
    "Standardization Engines": true,
    "Review Center": true,
    "System": true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: "Data Pipeline",
      items: [
        { name: "Ingestion / Upload", href: "/material-data/upload", icon: UploadCloud },
        { name: "Raw Master", href: "/material-data/raw", icon: FileText },
        { name: "Harmonized Catalog", href: "/material-data/cleaned", icon: CheckCircle },
      ],
    },
    {
      groupTitle: "Standardization Engines",
      items: [
        { name: "Data Cleaning", href: "/ai-standardization/data-cleaning", icon: Sparkles, badge: "Active", badgeType: "active" },
        { name: "Attribute Extraction", href: "/ai-standardization/attribute-extraction", icon: Cpu, badge: "Coming Soon", badgeType: "coming_soon" },
        { name: "Vector Matching", href: "/ai-standardization/material-matching", icon: Layers, badge: "Coming Soon", badgeType: "coming_soon" },
      ],
    },
    {
      groupTitle: "Review Center",
      items: [
        { name: "Pending Review", href: "/review-center/pending", icon: Clock },
        { name: "Approved Records", href: "/review-center/approved", icon: CheckCheck },
        { name: "Rejected", href: "/review-center/rejected", icon: XCircle },
      ],
    },
    {
      groupTitle: "System",
      items: [
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Audit Trail", href: "/audit-logs", icon: ScrollText },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl bg-white shadow-sm border border-[#EDE9FE] text-[#582C87] hover:bg-[#F3E8FF]/50 transition-colors"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white text-slate-700 flex flex-col border-r border-[#EDE9FE] shadow-[1px_0_10px_rgba(88,44,135,0.03)] transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#EDE9FE] bg-white shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#582C87] flex items-center justify-center text-white shadow-xs group-hover:bg-[#7C3AED] transition-colors shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs tracking-wider text-[#0F172A] uppercase flex items-center gap-1.5">
                <span>MATERIAL MASTER</span>
              </div>
              <span className="text-[10px] font-semibold text-[#7C3AED] bg-[#F3E8FF] px-1.5 py-0.2 rounded-full inline-block mt-0.5 border border-[#EDE9FE]">
                SIH Edition
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Main Dashboard Link */}
          <div>
            <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Main
            </div>
            <Link
              href="/"
              onClick={() => setIsOpenMobile(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/"
                  ? "bg-[#F3E8FF] text-[#582C87] shadow-xs border border-[#EDE9FE]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 ${
                  pathname === "/" ? "text-[#582C87]" : "text-slate-400"
                }`}
              />
              <span>Dashboard Overview</span>
            </Link>
          </div>

          {/* Grouped Sections */}
          {navGroups.map((group) => {
            const isExpanded = expandedGroups[group.groupTitle];
            return (
              <div key={group.groupTitle} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.groupTitle)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 tracking-wider uppercase"
                >
                  <span>{group.groupTitle}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpenMobile(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-[#F3E8FF] text-[#582C87] font-semibold border border-[#EDE9FE]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <item.icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-[#582C87]" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold tracking-tight whitespace-nowrap ${
                                item.badgeType === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Government / CPSE AI Badge */}
        <div className="p-3.5 mx-3 mb-3 rounded-xl bg-[#FAF5FF] border border-[#EDE9FE] text-xs text-slate-600 space-y-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <span className="text-xs font-bold text-[#582C87]">CPSE AI Master</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Harmonizing ONGC, BHEL, IOCL, NTPC, GAIL, SAIL & CIL catalogs.
          </p>
        </div>
      </aside>
    </>
  );
};

