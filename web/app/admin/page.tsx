"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { AdminMarketCreateForm, AdminMarketFormData } from "../../components/AdminMarketCreateForm";
import AdminQuestManagementForm, { AdminQuestItem } from "../../components/AdminQuestManagementForm";
import AdminMarketResolutionTable, { ResolutionOutcome, CancellationReasonCategory } from "../../components/AdminMarketResolutionTable";
import AdminLoginForm from "../../components/AdminLoginForm";

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
  initialConnectedAddress = "",
  initialTab = "create-market",
}: AdminDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [connectedAddress, setConnectedAddress] = useState<string | null>(
    initialConnectedAddress || null
  );
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const [totalMarketsCreated, setTotalMarketsCreated] = useState<number>(18);
  const [activeQuestsCount, setActiveQuestsCount] = useState<number>(4);
  const [pendingResolutionsCount, setPendingResolutionsCount] = useState<number>(3);
  const [globalNotice, setGlobalNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const isAuthorized =
    Boolean(connectedAddress) &&
    AUTHORIZED_ADMIN_ADDRESSES.includes(connectedAddress?.toLowerCase() || "");

  useEffect(() => {
    async function fetchAdminMetrics() {
      try {
        const [marketsRes, questsRes] = await Promise.all([
          fetch("/api/markets"),
          fetch("/api/admin/quests"),
        ]);
        if (marketsRes.ok) {
          const mData = await marketsRes.json();
          if (mData.markets && Array.isArray(mData.markets) && mData.markets.length > 0) {
            setTotalMarketsCreated(mData.markets.length);
            const pending = mData.markets.filter(
              (m: any) => m.status === "active" && m.deadline && new Date(m.deadline) <= new Date()
            ).length;
            if (pending > 0) setPendingResolutionsCount(pending);
          }
        }
        if (questsRes.ok) {
          const qData = await questsRes.json();
          if (qData.quests && Array.isArray(qData.quests) && qData.quests.length > 0) {
            const active = qData.quests.filter((q: any) => q.is_active).length;
            setActiveQuestsCount(active);
          }
        }
      } catch {
      }
    }

    if (isAuthorized) {
      fetchAdminMetrics();
    }
  }, [isAuthorized]);

  const handleDisconnect = () => {
    setConnectedAddress(null);
    setGlobalNotice(null);
  };

  const handleMarketCreated = (marketData: AdminMarketFormData) => {
    setTotalMarketsCreated((prev) => prev + 1);
    setGlobalNotice({
      message: `Prediction market "${marketData.title}" initialized on Arbitrum Sepolia.`,
      type: "success",
    });
  };

  const handleQuestCreated = (quest: AdminQuestItem) => {
    if (quest.isActive) {
      setActiveQuestsCount((prev) => prev + 1);
    }
    setGlobalNotice({
      message: `Quest "${quest.title}" created with +${quest.points} PTS reward.`,
      type: "success",
    });
  };

  const handleQuestToggle = (_id: string, active: boolean) => {
    setActiveQuestsCount((prev) => (active ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleMarketResolved = (
    marketId: string,
    outcome: ResolutionOutcome,
    _notes?: string,
    _cancellationReason?: CancellationReasonCategory
  ) => {
    setPendingResolutionsCount((prev) => Math.max(0, prev - 1));
    setGlobalNotice({
      message: `Market ${marketId} settled as [${outcome}]. Collateral and payouts updated.`,
      type: "success",
    });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center w-full">
        <AdminLoginForm
          onLoginSuccess={(address) => setConnectedAddress(address)}
          authorizedAddresses={AUTHORIZED_ADMIN_ADDRESSES}
        />
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
            Deploy prediction markets, manage gamification rewards, and execute resolution settlements.
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

      {globalNotice && (
        <div
          role="status"
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{globalNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalNotice(null)}
            className="text-xs font-mono font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

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
            {totalMarketsCreated}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Active on Arbitrum Sepolia
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
            {activeQuestsCount} Active
          </div>
          <div className="text-[11px] text-text-muted dark:text-[#A9B3AD] mt-1">
            Live gamification tasks
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
            {pendingResolutionsCount} Expired
          </div>
          <div className="text-[11px] text-warning-amber mt-1 font-medium">
            Awaiting oracle review & settlement
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
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
            {activeQuestsCount}
          </span>
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
          {pendingResolutionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-warning-amber font-bold">
              {pendingResolutionsCount}
            </span>
          )}
        </button>
      </div>

      <main className="pt-2">
        {activeTab === "create-market" && (
          <AdminMarketCreateForm onSubmitMarket={handleMarketCreated} />
        )}
        {activeTab === "manage-quests" && (
          <AdminQuestManagementForm
            onCreateQuest={handleQuestCreated}
            onToggleQuestStatus={handleQuestToggle}
          />
        )}
        {activeTab === "resolve-markets" && (
          <AdminMarketResolutionTable onResolveMarket={handleMarketResolved} />
        )}
      </main>
    </div>
  );
}
