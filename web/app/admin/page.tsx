"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { AdminMarketCreateForm, AdminMarketFormData } from "../../components/AdminMarketCreateForm";
import AdminQuestManagementForm, { AdminQuestItem } from "../../components/AdminQuestManagementForm";
import AdminMarketResolutionTable, {
  ResolvableMarketItem,
  ResolutionOutcome,
  CancellationReasonCategory,
} from "../../components/AdminMarketResolutionTable";
import AdminLoginForm from "../../components/AdminLoginForm";

export type AdminTab = "create-market" | "manage-quests" | "resolve-markets";

export interface AdminDashboardProps {
  initialConnectedAddress?: string;
  initialTab?: AdminTab;
}

const AUTHORIZED_ADMIN_ADDRESSES = [
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

  const [totalMarketsCreated, setTotalMarketsCreated] = useState<number>(0);
  const [activeQuestsCount, setActiveQuestsCount] = useState<number>(0);
  const [pendingResolutionsCount, setPendingResolutionsCount] = useState<number>(0);
  const [globalNotice, setGlobalNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const [resolvableMarkets, setResolvableMarkets] = useState<ResolvableMarketItem[]>([]);
  const [adminQuests, setAdminQuests] = useState<AdminQuestItem[]>([]);

  const isAuthorized =
    Boolean(connectedAddress) &&
    AUTHORIZED_ADMIN_ADDRESSES.includes(connectedAddress?.toLowerCase() || "");

  useEffect(() => {
    let isMounted = true;
    async function fetchAdminMetrics() {
      try {
        const [marketsRes, questsRes] = await Promise.all([
          fetch("/api/markets"),
          fetch("/api/admin/quests"),
        ]);

        if (marketsRes.ok) {
          const mData = await marketsRes.json();
          if (isMounted && mData.markets && Array.isArray(mData.markets)) {
            setTotalMarketsCreated(mData.markets.length);
            const pending = mData.markets.filter(
              (m: any) => m.status === "active" && m.deadline && new Date(m.deadline) <= new Date()
            );
            setPendingResolutionsCount(pending.length);

            const mappedMarkets: ResolvableMarketItem[] = mData.markets.map((m: any) => {
              const yes = Number(m.yes_pool || 0);
              const no = Number(m.no_pool || 0);
              const total = yes + no;
              const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
              const noPct = 100 - yesPct;
              return {
                id: m.id || `market-${m.contract_market_id}`,
                title: m.title,
                category: (m.category || "CRYPTO").toUpperCase(),
                totalPool: total,
                volume: total,
                yesPercentage: yesPct,
                noPercentage: noPct,
                endTime: m.deadline || new Date().toISOString(),
                resolutionSourceUrl: m.resolution_source || "https://omen.market",
                resolutionCriteria: m.description,
                status:
                  m.status === "active"
                    ? "PENDING_RESOLUTION"
                    : m.status === "cancelled"
                    ? "CANCELLED"
                    : "RESOLVED",
                resolvedOutcome:
                  m.status === "resolved_yes"
                    ? "YES"
                    : m.status === "resolved_no"
                    ? "NO"
                    : undefined,
              };
            });
            setResolvableMarkets(mappedMarkets);
          }
        }

        if (questsRes.ok) {
          const qData = await questsRes.json();
          if (isMounted && qData.quests && Array.isArray(qData.quests)) {
            const active = qData.quests.filter((q: any) => q.is_active).length;
            setActiveQuestsCount(active);

            const mappedQuests: AdminQuestItem[] = qData.quests.map((q: any) => ({
              id: q.id,
              title: q.title,
              description: q.description || "",
              category: (q.category || "ONBOARDING").toUpperCase() as any,
              points: Number(q.points_reward || 100),
              recurrence: (q.recurrence || "ONE_TIME") as any,
              actionUrl: q.action_url,
              isActive: Boolean(q.is_active),
              completionsCount: Number(q.completions_count || 0),
              createdAt: q.created_at,
            }));
            setAdminQuests(mappedQuests);
          }
        }
      } catch {
      }
    }

    if (isAuthorized) {
      fetchAdminMetrics();
    }

    return () => {
      isMounted = false;
    };
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
    setAdminQuests((prev) => [quest, ...prev]);
    setGlobalNotice({
      message: `Quest "${quest.title}" created with +${quest.points} PTS reward.`,
      type: "success",
    });
  };

  const handleQuestToggle = (_id: string, active: boolean) => {
    setActiveQuestsCount((prev) => (active ? prev + 1 : Math.max(0, prev - 1)));
    setAdminQuests((prev) =>
      prev.map((q) => (q.id === _id ? { ...q, isActive: active } : q))
    );
  };

  const handleMarketResolved = (
    marketId: string,
    outcome: ResolutionOutcome,
    _notes?: string,
    _cancellationReason?: CancellationReasonCategory
  ) => {
    setPendingResolutionsCount((prev) => Math.max(0, prev - 1));
    setResolvableMarkets((prev) =>
      prev.map((m) =>
        m.id === marketId
          ? {
              ...m,
              status: outcome === "CANCEL" ? "CANCELLED" : "RESOLVED",
              resolvedOutcome: outcome,
            }
          : m
      )
    );
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border-subtle dark:border-white/10 animate-slide-down">
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
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              isDark ? "bg-white/5 border-white/10 text-text-muted" : "bg-white border-border-subtle text-accent-navy"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yes-green" />
            <span>{connectedAddress ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}` : "0xAdmin"}</span>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            aria-label="Disconnect Admin Session"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? "border-no-red/30 text-no-red hover:bg-no-red/10"
                : "border-no-red/40 text-no-red hover:bg-rose-50"
            }`}
          >
            Disconnect
          </button>
        </div>
      </header>

      {globalNotice && (
        <div
          role="status"
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-slide-down ${
            globalNotice.type === "success"
              ? "bg-yes-green-soft dark:bg-yes-green/10 border-yes-green/30 text-yes-green"
              : "bg-primary-blue-soft dark:bg-primary-blue/10 border-primary-blue/30 text-primary-blue"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span className="font-semibold">{globalNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalNotice(null)}
            className="text-xs font-bold font-mono opacity-80 hover:opacity-100"
          >
            DISMISS
          </button>
        </div>
      )}

      <section
        aria-label="Admin Metrics Overview"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div
          className={`p-5 rounded-2xl border transition-all hover-lift animate-slide-up stagger-1 ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10 shadow-xs"
          }`}
        >
          <div className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
            Total Markets Created
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-accent-navy dark:text-white">
            {totalMarketsCreated}
          </div>
          <div className="text-[11px] text-yes-green mt-1 font-medium">
            Arbitrum Sepolia Non-Custodial Pools
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all hover-lift animate-slide-up stagger-2 ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10 shadow-xs"
          }`}
        >
          <div className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
            Configured Quests
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-primary-blue">
            {activeQuestsCount} Active
          </div>
          <div className="text-[11px] text-text-muted dark:text-[#A9B3AD] mt-1 font-medium">
            Gamification XP distribution rules
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all hover-lift animate-slide-up stagger-3 ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10 shadow-xs"
          }`}
        >
          <div className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
            Pending Resolutions
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-warning-amber">
            {pendingResolutionsCount} Expired
          </div>
          <div className="text-[11px] text-warning-amber mt-1 font-medium">
            Awaiting oracle review & settlement
          </div>
        </div>
      </section>

      <div className="flex border-b border-border-subtle dark:border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1 animate-fade-in">
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

      <main className="pt-2 animate-slide-up">
        {activeTab === "create-market" && (
          <AdminMarketCreateForm onSubmitMarket={handleMarketCreated} />
        )}
        {activeTab === "manage-quests" && (
          <AdminQuestManagementForm
            initialQuests={adminQuests}
            onCreateQuest={handleQuestCreated}
            onToggleQuestStatus={handleQuestToggle}
          />
        )}
        {activeTab === "resolve-markets" && (
          <AdminMarketResolutionTable
            initialMarkets={resolvableMarkets}
            onResolveMarket={handleMarketResolved}
          />
        )}
      </main>
    </div>
  );
}
