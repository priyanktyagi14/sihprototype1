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
  icon: any;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Material Data": true,
    "AI Standardization": true,
    "Review Center": true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: "Material Data",
      icon: Database,
      items: [
        { name: "Upload Data", href: "/material-data/upload", icon: UploadCloud },
        { name: "Raw Materials", href: "/material-data/raw", icon: FileText },
        { name: "Cleaned Materials", href: "/material-data/cleaned", icon: CheckCircle },
      ],
    },
    {
      groupTitle: "AI Standardization",
      icon: Sparkles,
      items: [
        { name: "Data Cleaning", href: "/ai-standardization/data-cleaning", icon: Sparkles, badge: "Active", badgeType: "active" },
        { name: "Attribute Extraction", href: "/ai-standardization/attribute-extraction", icon: Cpu, badge: "Coming Soon", badgeType: "coming_soon" },
        { name: "AI Material Matching", href: "/ai-standardization/material-matching", icon: Layers, badge: "Coming Soon", badgeType: "coming_soon" },
      ],
    },
    {
      groupTitle: "Review Center",
      icon: FileCheck2,
      items: [
        { name: "Pending Review", href: "/review-center/pending", icon: Clock },
        { name: "Approved Records", href: "/review-center/approved", icon: CheckCheck },
        { name: "Rejected Records", href: "/review-center/rejected", icon: XCircle },
      ],
    },
  ];

  const singleLinks = [
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Audit Logs", href: "/audit-logs", icon: ScrollText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-sm text-white tracking-tight leading-none truncate flex items-center gap-1.5">
              <span>UNMC Platform</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SIH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-1">CPSE Material Master</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Main Dashboard Link */}
          <div>
            <Link
              href="/"
              onClick={() => setIsOpenMobile(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </Link>
          </div>

          {/* Grouped Links */}
          {navGroups.map((group) => {
            const isExpanded = expandedGroups[group.groupTitle];
            return (
              <div key={group.groupTitle} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.groupTitle)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 tracking-wider uppercase"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{group.groupTitle}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 pl-2 pt-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpenMobile(false)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-600/90 text-white font-semibold"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <item.icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium tracking-tight whitespace-nowrap ${
                                item.badgeType === "active"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
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

          {/* Standalone Links */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              System Operations
            </span>
            {singleLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600/90 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Government / SIH Badge */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-300">CPSE AI Harmonizer</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Standardization Platform for Public Sector Enterprises
          </p>
        </div>
      </aside>
    </>
  );
};
