"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "MATERIAL DATA": true,
    "AI STANDARDIZATION": true,
    "REVIEW CENTER": true,
    "SYSTEM OPERATIONS": true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const isGroupActive = (paths: string[]) => {
    return paths.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p)));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3.5 left-3 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg bg-[#170D2B] text-white shadow-md border border-purple-900/60 hover:bg-[#241443] transition-colors"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#170D2B] text-slate-300 flex flex-col flex-shrink-0 select-none shadow-2xl border-r border-purple-950/50 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Platform Branding & Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-purple-900/30 bg-[#170D2B] shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-950/50 text-white shrink-0 group-hover:scale-105 transition-transform">
              {/* Molecule / Node Graph Network SVG Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
              </svg>
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wider text-white uppercase block leading-none">MATERIAL</span>
              <span className="text-xs font-semibold tracking-widest text-purple-300 block leading-tight mt-0.5">MASTER</span>
            </div>
          </Link>
        </div>

        {/* Navigation List Container */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 sidebar-scroll text-xs">
          {/* Primary Overview Item */}
          <div>
            <Link
              href="/"
              onClick={() => setIsOpenMobile(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all duration-150 ${
                pathname === "/"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg
                className={`w-4 h-4 shrink-0 ${pathname === "/" ? "text-[#582C87]" : "text-purple-400"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <rect height="7" rx="1.5" width="7" x="3" y="3"></rect>
                <rect height="7" rx="1.5" width="7" x="14" y="3"></rect>
                <rect height="7" rx="1.5" width="7" x="14" y="14"></rect>
                <rect height="7" rx="1.5" width="7" x="3" y="14"></rect>
              </svg>
              <span className="text-[13px]">Dashboard Overview</span>
            </Link>
          </div>

          {/* Navigation Section: Material Data */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup("MATERIAL DATA")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/70 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Material Data
              </span>
              <svg
                className={`w-3 h-3 text-purple-400 transition-transform ${expandedGroups["MATERIAL DATA"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>

            {expandedGroups["MATERIAL DATA"] && (
              <div className="pl-2 space-y-0.5 pt-1">
                {/* Upload Data */}
                <Link
                  href="/material-data/upload"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/material-data/upload"
                      ? "bg-[#7C3AED] text-white font-semibold shadow-md shadow-[#7C3AED]/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Upload Data</span>
                </Link>

                {/* Raw Materials */}
                <Link
                  href="/material-data/raw"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/material-data/raw"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Raw Materials</span>
                </Link>

                {/* Cleaned Materials */}
                <Link
                  href="/material-data/cleaned"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/material-data/cleaned"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Cleaned Materials</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Section: AI Standardization */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup("AI STANDARDIZATION")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/70 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                AI Standardization
              </span>
              <svg
                className={`w-3 h-3 text-purple-400 transition-transform ${expandedGroups["AI STANDARDIZATION"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>

            {expandedGroups["AI STANDARDIZATION"] && (
              <div className="pl-2 space-y-0.5 pt-1">
                {/* Data Cleaning */}
                <Link
                  href="/ai-standardization/data-cleaning"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/ai-standardization/data-cleaning"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span className="truncate">Data Cleaning</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shrink-0">
                    Active
                  </span>
                </Link>

                {/* Attribute Extraction */}
                <Link
                  href="/ai-standardization/attribute-extraction"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/ai-standardization/attribute-extraction"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" x2="22" y1="12" y2="12"></line>
                    </svg>
                    <span className="truncate">Attribute Extraction</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 shrink-0">
                    Coming Soon
                  </span>
                </Link>

                {/* AI Material Matching */}
                <Link
                  href="/ai-standardization/material-matching"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/ai-standardization/material-matching"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span className="truncate">AI Material Match...</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 shrink-0">
                    Coming Soon
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Section: Review Center */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup("REVIEW CENTER")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/70 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Review Center
              </span>
              <svg
                className={`w-3 h-3 text-purple-400 transition-transform ${expandedGroups["REVIEW CENTER"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>

            {expandedGroups["REVIEW CENTER"] && (
              <div className="pl-2 space-y-0.5 pt-1">
                {/* Pending Review */}
                <Link
                  href="/review-center/pending"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/review-center/pending"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Pending Review</span>
                </Link>

                {/* Approved Records */}
                <Link
                  href="/review-center/approved"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/review-center/approved"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Approved Records</span>
                </Link>

                {/* Rejected Records */}
                <Link
                  href="/review-center/rejected"
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/review-center/rejected"
                      ? "bg-white/10 text-white font-medium"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" x2="9" y1="9" y2="15"></line>
                    <line x1="9" x2="15" y1="9" y2="15"></line>
                  </svg>
                  <span>Rejected Records</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Section: System Operations */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/70">
              System Operations
            </div>
            <div className="pl-2 space-y-0.5 pt-1">
              <Link
                href="/analytics"
                onClick={() => setIsOpenMobile(false)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/analytics"
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Analytics</span>
              </Link>

              <Link
                href="/audit-logs"
                onClick={() => setIsOpenMobile(false)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/audit-logs"
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Audit Logs</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpenMobile(false)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/settings"
                    ? "bg-white/10 text-white font-medium"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-purple-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Status Widget */}
        <div className="p-3.5 border-t border-purple-900/40 text-[11px] text-purple-300/80 bg-[#120923] flex items-center justify-between shrink-0">
          <span className="truncate font-medium">CPSE Sync Hub v2.4</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        </div>
      </aside>
    </>
  );
};


