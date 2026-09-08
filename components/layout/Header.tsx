"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { CPSE_PROFILES } from "@/lib/mockData";

export const Header: React.FC = () => {
  const [selectedCPSE, setSelectedCPSE] = useState<string>("ALL");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side / Title on mobile / Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl pl-10 lg:pl-0">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material code, standard specs, or UNMC..."
            aria-label="Global search across material records"
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* CPSE Context Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
          <select
            value={selectedCPSE}
            onChange={(e) => setSelectedCPSE(e.target.value)}
            aria-label="Filter enterprise context"
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL">All Enterprises (7 CPSEs)</option>
            {CPSE_PROFILES.map((cpse) => (
              <option key={cpse.id} value={cpse.id}>
                {cpse.id} — {cpse.name}
              </option>
            ))}
          </select>
        </div>

        {/* Engine Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cleaning Engine: Operational</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-900">Recent System Alerts</span>
                <span className="text-[10px] text-indigo-600 font-medium cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-900">
                  <p className="font-medium">Batch ONGC-2026-09 Cleaned</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">1,480 items normalized with 96.2% score.</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-900">
                  <p className="font-medium">12 Items Require Review</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Non-standard thread pitch detected in BHEL data.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
            SIH
          </div>
          <div className="hidden md:block text-left leading-none">
            <p className="text-xs font-semibold text-slate-800">Evaluator / Auditor</p>
            <p className="text-[10px] text-slate-500 mt-0.5">MHI Central Master</p>
          </div>
        </div>
      </div>
    </header>
  );
};
