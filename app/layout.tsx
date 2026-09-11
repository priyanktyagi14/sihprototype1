import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ToastContainer } from "@/components/shared/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Material Master — Enterprise AI Harmonization Platform",
  description:
    "Enterprise AI Harmonization & Standardization Platform for CPSEs (ONGC, BHEL, IOCL, NTPC, GAIL, SAIL, CIL).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#F8FAFC]">
      <body className={`${inter.className} h-full text-slate-900 antialiased bg-[#F8FAFC]`}>
        <div className="min-h-full flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            {/* Header */}
            <Header />

            {/* Content Body */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Global Floating Toast Notifications */}
        <ToastContainer />
      </body>
    </html>
  );
}

