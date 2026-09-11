"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Building2,
  ChevronDown,
} from "lucide-react";
import { CPSE_PROFILES } from "@/lib/mockData";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCPSEMenu, setShowCPSEMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCPSESelect = (cpseId: string) => {
    setSelectedCPSE(cpseId);
    setShowCPSEMenu(false);
    // Dispatch global event for pages listening to enterprise filter
    window.dispatchEvent(
      new CustomEvent("sih_cpse_filter_changed", { detail: cpseId })
    );
  };

  const getSelectedLabel = () => {
    if (selectedCPSE === "ALL") return "All Enterprises (7 CPSEs)";
    const found = CPSE_PROFILES.find((c) => c.id === selectedCPSE);
    return found ? `${found.id} — ${found.name.split(" ")[0]}` : selectedCPSE;
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Center-Left: Global Material Search */}
      <div className="flex-1 max-w-xl pl-9 lg:pl-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material code, standard specs, or UNMC..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#582C87] focus:border-transparent transition-all placeholder:text-slate-400 text-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Right Header Actions & Status Profile */}
      <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
        {/* Enterprise Multi-select Dropdown Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCPSEMenu(!showCPSEMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
            </svg>
            <span className="truncate max-w-[130px] sm:max-w-none">{getSelectedLabel()}</span>
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>

          {showCPSEMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Enterprise Context
              </div>
              <button
                type="button"
                onClick={() => handleCPSESelect("ALL")}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F3E8FF] transition-colors ${
                  selectedCPSE === "ALL" ? "bg-[#F3E8FF] font-bold text-[#582C87]" : "text-slate-700"
                }`}
              >
                <span>All Enterprises (7 CPSEs)</span>
                {selectedCPSE === "ALL" && <span className="text-[#7C3AED]">✓</span>}
              </button>
              {CPSE_PROFILES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCPSESelect(c.id)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F3E8FF] transition-colors ${
                    selectedCPSE === c.id ? "bg-[#F3E8FF] font-bold text-[#582C87]" : "text-slate-700"
                  }`}
                >
                  <span className="truncate">
                    <strong>{c.id}</strong> — {c.name}
                  </span>
                  {selectedCPSE === c.id && <span className="text-[#7C3AED]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Engine Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-[11px]">Cleaning Engine: Operational</span>
        </div>

        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#7C3AED] rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#EDE9FE] p-4 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">System Notifications</span>
                <span
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-[#7C3AED] font-semibold cursor-pointer hover:underline"
                >
                  Mark read
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100 text-emerald-900">
                  <p className="font-semibold text-xs">Batch NTPC-4402 Ingested</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">5,200 material lines normalized with 96% match.</p>
                </div>
                <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100 text-[#582C87]">
                  <p className="font-semibold text-xs">Cross-Enterprise Duplicate Detected</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">ONGC & IOCL share 98% cosine spec similarity on spiral gaskets.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-[#582C87] flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
            SIH
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">Evaluator / Auditor</span>
            <span className="text-[10px] text-slate-400 block leading-tight">Ministry Reviewer</span>
          </div>
        </div>
      </div>
    </header>
  );
};


