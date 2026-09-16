"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export type ResolutionOutcome = "YES" | "NO" | "CANCEL";

export interface ResolvableMarketItem {
  id: string;
  title: string;
  category: string;
  totalPool: number;
  volume: number;
  yesPercentage: number;
  noPercentage: number;
  endTime: string;
  resolutionSourceUrl: string;
  resolvedOutcome?: ResolutionOutcome;
  status: "PENDING_RESOLUTION" | "RESOLVED" | "CANCELLED";
}

export interface AdminMarketResolutionTableProps {
  initialMarkets?: ResolvableMarketItem[];
  onResolveMarket?: (
    marketId: string,
    outcome: ResolutionOutcome,
    notes?: string
  ) => Promise<void> | void;
  className?: string;
}

const DEFAULT_RESOLVABLE_MARKETS: ResolvableMarketItem[] = [
  {
    id: "market-101",
    title: "Will Ethereum Dencun Upgrade reduce L2 gas fees by >80%?",
    category: "CRYPTO",
    totalPool: 125000,
    volume: 340000,
    yesPercentage: 88,
    noPercentage: 12,
    endTime: "2026-03-10T12:00:00Z",
    resolutionSourceUrl: "https://l2fees.info",
    status: "PENDING_RESOLUTION",
  },
  {
    id: "market-102",
    title: "Will SpaceX Starship complete a full orbital landing test?",
    category: "TECH",
    totalPool: 85000,
    volume: 195000,
    yesPercentage: 45,
    noPercentage: 55,
    endTime: "2026-03-12T18:30:00Z",
    resolutionSourceUrl: "https://spacex.com/launches",
    status: "PENDING_RESOLUTION",
  },
  {
    id: "market-103",
    title: "Will Arbitrum DAO approve the Gaming Catalyst grant proposal?",
    category: "CRYPTO",
    totalPool: 64000,
    volume: 112000,
    yesPercentage: 72,
    noPercentage: 28,
    endTime: "2026-03-14T00:00:00Z",
    resolutionSourceUrl: "https://snapshot.org/#/arbitrumfoundation.eth",
    status: "PENDING_RESOLUTION",
  },
];

export default function AdminMarketResolutionTable({
  initialMarkets = DEFAULT_RESOLVABLE_MARKETS,
  onResolveMarket,
  className = "",
}: AdminMarketResolutionTableProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [markets, setMarkets] = useState<ResolvableMarketItem[]>(initialMarkets);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const [activeModal, setActiveModal] = useState<{
    market: ResolvableMarketItem;
    outcome: ResolutionOutcome;
  } | null>(null);

  const [isVerifiedCheck, setIsVerifiedCheck] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenResolutionModal = (
    market: ResolvableMarketItem,
    outcome: ResolutionOutcome
  ) => {
    setActiveModal({ market, outcome });
    setIsVerifiedCheck(false);
    setResolutionNotes("");
    setErrorNotice(null);
  };

  const handleCloseModal = () => {
    if (isResolving) return;
    setActiveModal(null);
    setIsVerifiedCheck(false);
    setResolutionNotes("");
    setErrorNotice(null);
  };

  const handleConfirmResolution = async () => {
    if (!activeModal) return;

    if (!isVerifiedCheck) {
      setErrorNotice("You must check and confirm the oracle verification before executing.");
      return;
    }

    setIsResolving(true);
    setErrorNotice(null);

    try {
      if (onResolveMarket) {
        await onResolveMarket(
          activeModal.market.id,
          activeModal.outcome,
          resolutionNotes.trim() || undefined
        );
      }

      setMarkets((prev) =>
        prev.map((m) =>
          m.id === activeModal.market.id
            ? {
                ...m,
                status: activeModal.outcome === "CANCEL" ? "CANCELLED" : "RESOLVED",
                resolvedOutcome: activeModal.outcome,
              }
            : m
        )
      );

      setSuccessToast(
        `Market "${activeModal.market.title}" successfully resolved as [${activeModal.outcome}]!`
      );
      handleCloseModal();
    } catch {
      setErrorNotice("Failed to execute market resolution on blockchain. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const filteredMarkets = markets.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "ALL" || m.category.toUpperCase() === filterCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(markets.map((m) => m.category)));

  return (
    <div className={`space-y-6 ${className}`}>
      {successToast && (
        <div
          role="status"
          className="p-4 rounded-xl border border-yes-green/30 bg-yes-green-soft dark:bg-yes-green/10 text-yes-green text-sm flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs font-mono font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        className={`rounded-2xl border p-6 sm:p-8 transition-all ${
          isDark
            ? "bg-[#0A0F0C] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.06)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-soft dark:bg-amber-500/15 text-warning-amber flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-accent-navy dark:text-white">
                Expired Markets Pending Resolution
              </h2>
              <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
                Review official oracle sources and execute final outcome resolutions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-amber-500/10 text-warning-amber border border-amber-500/20">
              {markets.filter((m) => m.status === "PENDING_RESOLUTION").length} Pending
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by title, ID, or category..."
              aria-label="Search pending markets"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                isDark
                  ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                  : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="shrink-0">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none cursor-pointer ${
                isDark
                  ? "bg-[#121815] border-white/10 text-white focus:border-emerald-500/50"
                  : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy focus:border-emerald-500"
              }`}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border-subtle dark:border-white/10">
          <table className="w-full text-left border-collapse" aria-label="Resolution Markets Table">
            <thead>
              <tr
                className={`text-[11px] font-mono uppercase tracking-wider border-b ${
                  isDark
                    ? "bg-[#121815] text-[#CBD5E1] border-white/10"
                    : "bg-[#F4FBF7] text-text-muted border-emerald-500/10"
                }`}
              >
                <th className="py-3 px-4 font-bold">Market Details</th>
                <th className="py-3 px-4 font-bold">Ended At</th>
                <th className="py-3 px-4 font-bold">Pool / Odds</th>
                <th className="py-3 px-4 font-bold">Oracle Source</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-center">Resolution Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/10 text-sm">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted dark:text-[#A9B3AD]">
                    No expired markets found pending resolution.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => (
                  <tr
                    key={market.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-white/[0.02]" : "hover:bg-emerald-50/40"
                    }`}
                  >
                    <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {market.category}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted/60 dark:text-white/40">
                          {market.id}
                        </span>
                      </div>
                      <div className="font-bold text-accent-navy dark:text-white leading-snug">
                        {market.title}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-text-muted dark:text-[#A9B3AD]">
                      {new Date(market.endTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-xs text-accent-navy dark:text-white">
                        ${market.totalPool.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5">
                        <span className="text-yes-green font-bold">YES {market.yesPercentage}%</span>
                        <span className="text-text-muted dark:text-white/30">/</span>
                        <span className="text-no-red font-bold">NO {market.noPercentage}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <a
                        href={market.resolutionSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:underline font-mono"
                      >
                        <span>Oracle Proof</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {market.status === "PENDING_RESOLUTION" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-500/10 text-warning-amber border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      ) : market.status === "RESOLVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-yes-green-soft dark:bg-yes-green/15 text-yes-green border border-yes-green/30">
                          Resolved: {market.resolvedOutcome}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-slate-100 dark:bg-white/10 text-text-muted dark:text-[#A9B3AD] border border-border-subtle dark:border-white/10">
                          Cancelled
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      {market.status === "PENDING_RESOLUTION" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenResolutionModal(market, "YES")}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-yes-green-soft dark:bg-yes-green/15 text-yes-green hover:bg-yes-green hover:text-white border border-yes-green/30 transition-all cursor-pointer"
                          >
                            Resolve YES
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenResolutionModal(market, "NO")}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-no-red-soft dark:bg-no-red/15 text-no-red hover:bg-no-red hover:text-white border border-no-red/30 transition-all cursor-pointer"
                          >
                            Resolve NO
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenResolutionModal(market, "CANCEL")}
                            aria-label={`Cancel and refund market ${market.id}`}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-slate-100 dark:bg-white/10 text-text-muted hover:bg-amber-500 hover:text-white border border-border-subtle dark:border-white/10 transition-all cursor-pointer"
                          >
                            Cancel & Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted dark:text-[#A9B3AD] font-mono">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 sm:p-8 transition-all shadow-2xl ${
              isDark
                ? "bg-[#0A0F0C] border-white/10 text-white"
                : "bg-white border-emerald-500/20 text-accent-navy"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle dark:border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activeModal.outcome === "YES"
                      ? "bg-yes-green-soft text-yes-green dark:bg-yes-green/20"
                      : activeModal.outcome === "NO"
                      ? "bg-no-red-soft text-no-red dark:bg-no-red/20"
                      : "bg-amber-500/15 text-warning-amber"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 id="resolution-dialog-title" className="text-lg font-bold leading-tight">
                    Confirm Market Resolution
                  </h3>
                  <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                    Double confirmation required for blockchain settlement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isResolving}
                aria-label="Close dialog"
                className="text-text-muted hover:text-accent-navy dark:hover:text-white p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-[#121815] border-white/10" : "bg-[#F4FBF7] border-emerald-500/10"
                }`}
              >
                <div className="text-xs font-mono uppercase text-text-muted dark:text-[#A9B3AD]">
                  Target Market
                </div>
                <div className="font-bold text-sm mt-1">{activeModal.market.title}</div>
                <div className="flex items-center justify-between text-xs font-mono mt-3 pt-3 border-t border-border-subtle dark:border-white/10">
                  <span>Pool: ${activeModal.market.totalPool.toLocaleString()}</span>
                  <a
                    href={activeModal.market.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-blue hover:underline flex items-center gap-1"
                  >
                    <span>Verify Proof</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Chosen Outcome:
                </span>
                <span
                  className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                    activeModal.outcome === "YES"
                      ? "bg-yes-green-soft text-yes-green dark:bg-yes-green/20"
                      : activeModal.outcome === "NO"
                      ? "bg-no-red-soft text-no-red dark:bg-no-red/20"
                      : "bg-amber-500/15 text-warning-amber"
                  }`}
                >
                  {activeModal.outcome === "CANCEL" ? "CANCEL & REFUND" : activeModal.outcome}
                </span>
              </div>

              <div>
                <label
                  htmlFor="resolution-notes"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
                >
                  Resolution Notes / Oracle Citation (Optional)
                </label>
                <textarea
                  id="resolution-notes"
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g., Verified via Chainlink data feed at timestamp..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none resize-none ${
                    isDark
                      ? "bg-[#121815] border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                      : "bg-[#F4FBF7] border-emerald-500/20 text-accent-navy placeholder:text-accent-navy/40 focus:border-emerald-500"
                  }`}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-warning-amber flex items-start gap-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="leading-relaxed">
                  <strong>Warning:</strong> Resolution triggers smart contract payouts and cannot be reversed once mined.
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isVerifiedCheck}
                  onChange={(e) => setIsVerifiedCheck(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>I confirm that I have verified the oracle proof and approve final settlement.</span>
              </label>

              {errorNotice && (
                <div
                  role="alert"
                  className="p-3 rounded-xl border border-no-red/30 bg-no-red-soft dark:bg-no-red/10 text-no-red text-xs font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorNotice}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border-subtle dark:border-white/10">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isResolving}
                className="px-4 py-2.5 rounded-xl font-bold text-xs border border-border-subtle dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={isResolving}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  activeModal.outcome === "YES"
                    ? "bg-yes-green hover:bg-emerald-600 text-white"
                    : activeModal.outcome === "NO"
                    ? "bg-no-red hover:bg-red-600 text-white"
                    : "bg-warning-amber hover:bg-amber-600 text-white"
                } ${isResolving ? "opacity-60 cursor-not-allowed" : "active:scale-[0.98]"}`}
              >
                {isResolving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Executing Settlement...</span>
                  </>
                ) : (
                  <span>Execute Settlement ({activeModal.outcome})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
