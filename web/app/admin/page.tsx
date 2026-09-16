"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";
import { AdminMarketCreateForm } from "../../components/AdminMarketCreateForm";
import AdminQuestManagementForm from "../../components/AdminQuestManagementForm";
import AdminMarketResolutionTable from "../../components/AdminMarketResolutionTable";

export type AdminTab = "create-market" | "manage-quests" | "resolve-markets";

export interface AdminDashboardProps {
  initialConnectedAddress?: string;
  initialTab?: AdminTab;
}

const AUTHORIZED_ADMIN_ADDRESSES = [
  "0x1234567890abcdef1234567890abcdef12345678".toLowerCase(),
  "0xAdmin99999999999999999999999999999999999".toLowerCase(),
  (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase(),
].filter(Boolean);

export default function AdminDashboardPage({
  initialConnectedAddress = "0x1234567890abcdef1234567890abcdef12345678",
  initialTab = "create-market",
}: AdminDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [connectedAddress, setConnectedAddress] = useState<string | null>(
    initialConnectedAddress
  );
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const isAuthorized =
    Boolean(connectedAddress) &&
    AUTHORIZED_ADMIN_ADDRESSES.includes(connectedAddress?.toLowerCase() || "");

  const handleSimulateAdminLogin = () => {
    setConnectedAddress("0x1234567890abcdef1234567890abcdef12345678");
  };

  const handleDisconnect = () => {
    setConnectedAddress(null);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-center">
        <div
          role="alert"
          aria-label="Access Denied Screen"
          className={`w-full rounded-3xl border p-8 sm:p-12 text-center transition-all ${
            isDark
              ? "bg-[#0A0F0C] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
              : "bg-white border-emerald-500/10 shadow-[0_4px_30px_rgba(14,122,78,0.08)]"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-no-red-soft dark:bg-no-red/15 text-no-red mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-accent-navy dark:text-white tracking-tight">
            Access Denied
          </h1>

          <p className="text-sm sm:text-base text-text-muted dark:text-[#A9B3AD] mt-3 max-w-md mx-auto leading-relaxed">
            Administrator wallet authorization is required to access protocol controls, market creation, and resolution tools.
          </p>

          <div
            className={`mt-6 p-4 rounded-xl border text-xs font-mono max-w-md mx-auto ${
              isDark ? "bg-[#121815] border-white/10 text-[#A9B3AD]" : "bg-[#F4FBF7] border-emerald-500/10 text-accent-navy"
            }`}
          >
            {connectedAddress ? (
              <div>
                <span className="text-text-muted block mb-1">Current Connected Wallet (Unauthorized):</span>
                <span className="font-bold text-no-red break-all">{connectedAddress}</span>
              </div>
            ) : (
              <span className="text-warning-amber">No Web3 wallet currently connected.</span>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSimulateAdminLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Connect Admin Wallet
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm border border-border-subtle dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border-subtle dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Protocol Governance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-yes-green-soft dark:bg-yes-green/15 text-yes-green border border-yes-green/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yes-green animate-pulse" />
              Admin Authorized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-accent-navy dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD] mt-1">
            Create prediction markets, curate gamification quests, and resolve expired event outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono ${
              isDark ? "bg-[#121815] border-white/10" : "bg-[#F4FBF7] border-emerald-500/10"
            }`}
          >
            <div className="text-[10px] text-text-muted uppercase">Admin Account</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[140px] sm:max-w-[180px]">
              {connectedAddress}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            aria-label="Disconnect admin session"
            className="p-2.5 rounded-xl border border-border-subtle dark:border-white/10 text-text-muted hover:text-no-red hover:border-no-red/30 transition-all cursor-pointer"
            title="Disconnect Admin"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <section
        aria-label="Admin Metrics Overview"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10"
          }`}
        >
          <div className="text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD]">
            Total Markets Created
          </div>
          <div className="text-2xl font-mono font-black text-accent-navy dark:text-white mt-2">
            18
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            +3 new markets this week
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10"
          }`}
        >
          <div className="text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD]">
            Configured Quests
          </div>
          <div className="text-2xl font-mono font-black text-primary-blue mt-2">
            6 Active
          </div>
          <div className="text-[11px] text-text-muted dark:text-[#A9B3AD] mt-1">
            2,450 total completions
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10"
          }`}
        >
          <div className="text-xs font-mono font-bold uppercase text-text-muted dark:text-[#A9B3AD]">
            Pending Resolutions
          </div>
          <div className="text-2xl font-mono font-black text-warning-amber mt-2">
            3 Expired
          </div>
          <div className="text-[11px] text-warning-amber mt-1 font-medium">
            Awaiting oracle confirmation
          </div>
        </div>
      </section>

      <div className="flex border-b border-border-subtle dark:border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("create-market")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "create-market"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-500/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Prediction Market</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manage-quests")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "manage-quests"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-500/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>Manage Quests</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resolve-markets")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "resolve-markets"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-500/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Resolve Expired Markets</span>
        </button>
      </div>

      <main className="pt-2">
        {activeTab === "create-market" && <AdminMarketCreateForm />}
        {activeTab === "manage-quests" && <AdminQuestManagementForm />}
        {activeTab === "resolve-markets" && <AdminMarketResolutionTable />}
      </main>
    </div>
  );
}
