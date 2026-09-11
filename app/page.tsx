import React from "react";
import Link from "next/link";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { MOCK_MATERIALS } from "@/lib/mockData";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* BEGIN: HeroBannerCard */}
      <section
        className="bg-gradient-to-r from-purple-50/70 via-white to-purple-50/40 rounded-2xl border border-purple-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        data-purpose="hero-system-banner"
      >
        {/* Decorative Ambient Vector in Background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-2 relative z-10">
          {/* SIH Prototype Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100/80 border border-purple-200 text-[#582C87] text-[11px] font-semibold">
            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span>Smart India Hackathon (SIH) Prototype</span>
          </div>

          {/* Banner Title */}
          <h1 className="text-2xl lg:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
            AI-Driven Standardization &amp; Harmonization of Material Codes Across CPSEs
          </h1>

          {/* Banner Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Harmonizing inconsistent legacy material descriptions across ONGC, BHEL, NTPC, IOCL, SAIL, GAIL, and CIL into a unified National Material Master catalog.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
          <Link
            href="/ai-standardization/data-cleaning"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E0E38] hover:bg-[#2C1752] text-white text-xs font-semibold rounded-lg shadow-xs border border-purple-900/60 transition-colors"
          >
            <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>Test Cleaning Workbench</span>
          </Link>

          <Link
            href="/material-data/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#170B2C] hover:bg-[#251246] text-white text-xs font-semibold rounded-lg shadow-xs border border-purple-950 transition-colors"
          >
            <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>Ingest Dataset</span>
          </Link>
        </div>
      </section>
      {/* END: HeroBannerCard */}

      {/* BEGIN: MetricCardsGrid */}
      <StatsOverview />
      {/* END: MetricCardsGrid */}

      {/* BEGIN: MasterDataTableContainer */}
      <RecentActivityTable records={MOCK_MATERIALS} />
      {/* END: MasterDataTableContainer */}
    </div>
  );
}

