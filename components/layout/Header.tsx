"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Shield,
  HelpCircle,
  Database,
} from "lucide-react";
import { CPSE_PROFILES } from "@/lib/mockData";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 lg:gap-4 transition-all">
      {/* Left side / Brand title on mobile + Search */}
      <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-2xl pl-10 lg:pl-0">
        {/* Mobile & Tablet platform badge */}
        <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#582C87] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            M
          </div>
          <span className="font-bold text-xs text-[#582C87] tracking-wider uppercase">
            Material Master
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search material code, standard specs, or UNMC..."
            aria-label="Global search across material records"
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50/90 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* CPSE Filter Multi-dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50/90 hover:bg-slate-100/90 p-1.5 rounded-lg border border-slate-200 text-xs transition-colors">
          <Building2 className="w-3.5 h-3.5 text-[#582C87] ml-1 shrink-0" />
          <select
            value={selectedCPSE}
            onChange={(e) => setSelectedCPSE(e.target.value)}
            aria-label="Filter enterprise context"
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1 truncate max-w-[140px] sm:max-w-none"
          >
            <option value="ALL">All Enterprises (7 CPSEs)</option>
            {CPSE_PROFILES.map((cpse) => (
              <option key={cpse.id} value={cpse.id}>
                {cpse.id} — {cpse.name}
              </option>
            ))}
          </select>
        </div>

        {/* System Engine Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px]">Engine: Operational</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#F3E8FF]/60 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7C3AED] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#EDE9FE] p-4 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">System Alerts</span>
                <span className="text-[10px] text-[#7C3AED] font-semibold cursor-pointer hover:underline">
                  Mark read
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100 text-emerald-900">
                  <p className="font-semibold text-xs">Batch ONGC-2026 Ingested</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">1,480 items normalized with 96.2% score.</p>
                </div>
                <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100 text-[#582C87]">
                  <p className="font-semibold text-xs">Cross-CPSE Duplicate Found</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">ONGC & BHEL share 94% cosine spec match.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auditor Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F3E8FF] text-[#582C87] flex items-center justify-center font-bold text-xs border border-[#EDE9FE]">
            MM
          </div>
          <div className="hidden lg:block text-left leading-none">
            <p className="text-xs font-bold text-slate-800">Auditor Profile</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Central Master</p>
          </div>
        </div>
      </div>
    </header>
  );
};

