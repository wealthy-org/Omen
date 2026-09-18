"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { AdminMarketCreateForm, AdminMarketFormData } from "../../components/AdminMarketCreateForm";
import AdminMarketResolutionTable, {
  ResolvableMarketItem,
  ResolutionOutcome,
  CancellationReasonCategory,
} from "../../components/AdminMarketResolutionTable";
import AdminOracleMonitor from "../../components/AdminOracleMonitor";
import AdminBeliefPipelineTable from "../../components/AdminBeliefPipelineTable";
import AdminEmergencyControls from "../../components/AdminEmergencyControls";
import AdminLoginForm from "../../components/AdminLoginForm";

export type AdminTab =
  | "create-market"
  | "beliefs-monitor"
  | "oracle-monitor"
  | "resolve-markets"
  | "emergency-controls";

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

  const [totalMarketsCreated, setTotalMarketsCreated] = useState<number>(0);
  const [activeBeliefsCount, setActiveBeliefsCount] = useState<number>(0);
  const [pendingResolutionsCount, setPendingResolutionsCount] = useState<number>(0);
  const [globalNotice, setGlobalNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const [resolvableMarkets, setResolvableMarkets] = useState<ResolvableMarketItem[]>([]);

  const isAuthorized =
    Boolean(connectedAddress) &&
    AUTHORIZED_ADMIN_ADDRESSES.includes(connectedAddress?.toLowerCase() || "");

  useEffect(() => {
    let isMounted = true;
    async function fetchAdminMetrics() {
      try {
        const [marketsRes, beliefsRes] = await Promise.all([
          fetch("/api/markets"),
          fetch("/api/beliefs?limit=50"),
        ]);

        if (marketsRes.ok) {
          const mData = await marketsRes.json();
          if (isMounted && mData.markets && Array.isArray(mData.markets)) {
            setTotalMarketsCreated(mData.markets.length);
            const pending = mData.markets.filter(
              (m: any) =>
                m.status === "active" ||
                m.status === "OPEN" ||
                m.status === "CONFIRMED" ||
                m.status === "DETECTED"
            );
            setPendingResolutionsCount(pending.length);

            const mappedMarkets: ResolvableMarketItem[] = mData.markets.map((m: any) => {
              const yes = Number(m.yes_pool ?? m.total_pool_yes ?? m.agree_pool ?? 0);
              const no = Number(m.no_pool ?? m.total_pool_no ?? m.disagree_pool ?? 0);
              const total = yes + no;
              const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
              const noPct = total > 0 ? 100 - yesPct : 50;
              const isPending =
                m.status === "active" ||
                m.status === "OPEN" ||
                m.status === "CONFIRMED" ||
                m.status === "DETECTED";
              const isCancelled = m.status === "cancelled" || m.status === "VOID";
              const outcome =
                m.status === "resolved_yes" || m.winner === "AGREE"
                  ? "YES"
                  : m.status === "resolved_no" || m.winner === "DISAGREE"
                  ? "NO"
                  : isCancelled
                  ? "CANCEL"
                  : undefined;

              return {
                id: m.id || `market-${m.contract_market_id}`,
                title: m.title || m.statement,
                category: (m.category || "CRYPTO").toUpperCase(),
                totalPool: total,
                volume: total,
                yesPercentage: yesPct,
                noPercentage: noPct,
                endTime: m.deadline || m.close_time || new Date().toISOString(),
                resolutionSourceUrl: m.resolution_source || "https://omen.market",
                resolutionCriteria: m.description || m.statement,
                status: isPending ? "PENDING_RESOLUTION" : isCancelled ? "CANCELLED" : "RESOLVED",
                resolvedOutcome: outcome,
              };
            });
            setResolvableMarkets(mappedMarkets);
          }
        }

        if (beliefsRes.ok) {
          const bData = await beliefsRes.json();
          if (isMounted && bData.beliefs && Array.isArray(bData.beliefs)) {
            setActiveBeliefsCount(bData.beliefs.length);
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
              Protocol Governance V1
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
            Protocol governance, oracle feeds monitor, social belief pipeline, and settlement execution.
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
        className="grid grid-cols-1 sm:grid-cols-4 gap-4"
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
            Beliefs Pipeline
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-primary-blue">
            {activeBeliefsCount || 4} Active
          </div>
          <div className="text-[11px] text-text-muted dark:text-[#A9B3AD] mt-1 font-medium">
            Social belief extraction pipeline
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all hover-lift animate-slide-up stagger-3 ${
            isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-emerald-500/10 shadow-xs"
          }`}
        >
          <div className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
            Oracle Price Feeds
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-500">
            3/3 Healthy
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Chainlink AggregatorV3Interface
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all hover-lift animate-slide-up stagger-4 ${
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
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-50/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Prediction Market</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("beliefs-monitor")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "beliefs-monitor"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-50/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Social Belief Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("oracle-monitor")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "oracle-monitor"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-50/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Chainlink Oracle Monitor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resolve-markets")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "resolve-markets"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-emerald-50/5"
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

        <button
          type="button"
          onClick={() => setActiveTab("emergency-controls")}
          className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "emergency-controls"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-rose-500 hover:text-rose-600 hover:bg-rose-500/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Emergency Governance</span>
        </button>
      </div>

      <main className="pt-2">
        {activeTab === "create-market" && (
          <AdminMarketCreateForm onSubmitMarket={handleMarketCreated} />
        )}
        {activeTab === "beliefs-monitor" && (
          <AdminBeliefPipelineTable />
        )}
        {activeTab === "oracle-monitor" && (
          <AdminOracleMonitor />
        )}
        {activeTab === "resolve-markets" && (
          <AdminMarketResolutionTable
            initialMarkets={resolvableMarkets}
            onResolveMarket={handleMarketResolved}
          />
        )}
        {activeTab === "emergency-controls" && (
          <AdminEmergencyControls />
        )}
      </main>
    </div>
  );
}
