"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAdminResolveMarket } from "@/hooks/useAdminResolveMarket";

export type ResolutionOutcome = "YES" | "NO" | "CANCEL";

export type CancellationReasonCategory =
  | "ORACLE_FAILURE"
  | "AMBIGUOUS_CRITERIA"
  | "EVENT_CANCELLED"
  | "EMERGENCY_SAFEGUARD";

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
  resolutionCriteria?: string;
  resolvedOutcome?: ResolutionOutcome;
  resolvedAt?: string;
  cancellationReason?: CancellationReasonCategory;
  resolutionNotes?: string;
  status: "PENDING_RESOLUTION" | "RESOLVED" | "CANCELLED";
}

export interface AdminMarketResolutionTableProps {
  initialMarkets?: ResolvableMarketItem[];
  onResolveMarket?: (
    marketId: string,
    outcome: ResolutionOutcome,
    notes?: string,
    cancellationReason?: CancellationReasonCategory
  ) => Promise<void> | void;
  className?: string;
}

export const CANCELLATION_REASONS: {
  code: CancellationReasonCategory;
  label: string;
  description: string;
}[] = [
  {
    code: "ORACLE_FAILURE",
    label: "Oracle Data Source Unavailable / Disputed",
    description: "The primary oracle feed is offline, corrupted, or returned disputed results.",
  },
  {
    code: "AMBIGUOUS_CRITERIA",
    label: "Ambiguous or Contradictory Market Criteria",
    description: "The initial market resolution conditions were unclear or conflicting.",
  },
  {
    code: "EVENT_CANCELLED",
    label: "Real-World Event Cancelled or Postponed",
    description: "The underlying event was permanently cancelled or delayed past acceptable limits.",
  },
  {
    code: "EMERGENCY_SAFEGUARD",
    label: "Protocol Emergency / Smart Contract Safeguard",
    description: "Administrative emergency intervention to preserve protocol integrity.",
  },
];

export default function AdminMarketResolutionTable({
  initialMarkets = [],
  onResolveMarket,
  className = "",
}: AdminMarketResolutionTableProps) {
  const { resolveMarket } = useAdminResolveMarket();

  const [markets, setMarkets] = useState<ResolvableMarketItem[]>(initialMarkets);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED" | "CANCELLED">("ALL");

  const [activeModal, setActiveModal] = useState<{
    market: ResolvableMarketItem;
    outcome: ResolutionOutcome;
  } | null>(null);

  const [detailsModalMarket, setDetailsModalMarket] = useState<ResolvableMarketItem | null>(null);

  const [isVerifiedCheck, setIsVerifiedCheck] = useState(false);
  const [isIrreversibleCheck, setIsIrreversibleCheck] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState<CancellationReasonCategory>("ORACLE_FAILURE");
  const [isResolving, setIsResolving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeModal || detailsModalMarket) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeModal, detailsModalMarket]);

  const handleOpenResolutionModal = (
    market: ResolvableMarketItem,
    outcome: ResolutionOutcome
  ) => {
    setActiveModal({ market, outcome });
    setIsVerifiedCheck(false);
    setIsIrreversibleCheck(false);
    setResolutionNotes("");
    setCancellationReason("ORACLE_FAILURE");
    setErrorNotice(null);
  };

  const handleCloseModal = () => {
    if (isResolving) return;
    setActiveModal(null);
    setIsVerifiedCheck(false);
    setIsIrreversibleCheck(false);
    setResolutionNotes("");
    setErrorNotice(null);
  };

  const handleConfirmResolution = async () => {
    if (!activeModal) return;

    if (activeModal.outcome === "CANCEL") {
      if (!resolutionNotes.trim() || resolutionNotes.trim().length < 10) {
        setErrorNotice("Detailed cancellation justification is required (minimum 10 characters).");
        return;
      }
      if (!isVerifiedCheck || !isIrreversibleCheck) {
        setErrorNotice("Please confirm both safety checks before executing market cancellation.");
        return;
      }
    } else {
      if (!isVerifiedCheck) {
        setErrorNotice("You must check and confirm the oracle verification before executing settlement.");
        return;
      }
    }

    setIsResolving(true);
    setErrorNotice(null);

    try {
      const resolvedTimestamp = new Date().toISOString();

      try {
        await resolveMarket({
          marketId: activeModal.market.id,
          outcome: activeModal.outcome,
          notes: resolutionNotes.trim() || undefined,
          cancellationReason: activeModal.outcome === "CANCEL" ? cancellationReason : undefined,
        });
      } catch (err: any) {
        if (!onResolveMarket || err?.message?.includes("rejected") || err?.name === "UserRejectedRequestError") {
          throw err;
        }
      }

      if (onResolveMarket) {
        await onResolveMarket(
          activeModal.market.id,
          activeModal.outcome,
          resolutionNotes.trim() || undefined,
          activeModal.outcome === "CANCEL" ? cancellationReason : undefined
        );
      }

      setMarkets((prev) =>
        prev.map((m) =>
          m.id === activeModal.market.id
            ? {
                ...m,
                status: activeModal.outcome === "CANCEL" ? "CANCELLED" : "RESOLVED",
                resolvedOutcome: activeModal.outcome,
                resolvedAt: resolvedTimestamp,
                cancellationReason: activeModal.outcome === "CANCEL" ? cancellationReason : undefined,
                resolutionNotes: resolutionNotes.trim() || undefined,
              }
            : m
        )
      );

      const actionText =
        activeModal.outcome === "CANCEL"
          ? `Market "${activeModal.market.title}" successfully cancelled & refunded 100% to bettors!`
          : `Market "${activeModal.market.title}" successfully resolved as [${activeModal.outcome}]!`;

      setSuccessToast(actionText);
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

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && m.status === "PENDING_RESOLUTION") ||
      (statusFilter === "RESOLVED" && m.status === "RESOLVED") ||
      (statusFilter === "CANCELLED" && m.status === "CANCELLED");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(markets.map((m) => m.category)));
  const pendingCount = markets.filter((m) => m.status === "PENDING_RESOLUTION").length;
  const resolvedCount = markets.filter((m) => m.status === "RESOLVED").length;
  const cancelledCount = markets.filter((m) => m.status === "CANCELLED").length;

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

      <div className="rounded-2xl border p-6 sm:p-8 transition-all bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-warning-amber flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-accent-navy dark:text-white">
                Expired Markets Pending Resolution
              </h2>
              <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
                Review official oracle sources and execute final outcome settlements or 100% capital refunds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-amber-500/10 text-warning-amber border border-amber-500/20">
              {pendingCount} Pending Resolution
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by title, ID, or category..."
              aria-label="Search pending markets"
              className="w-full sm:max-w-md px-4 py-2.5 rounded-xl border text-sm transition-all outline-none bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:border-emerald-500"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              className="px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none cursor-pointer bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-xl p-1 bg-zinc-100 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
              }`}
            >
              All ({markets.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("RESOLVED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "RESOLVED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("CANCELLED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === "CANCELLED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white"
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
          <table className="w-full text-left border-collapse" aria-label="Resolution Markets Table">
            <thead>
              <tr className="text-[11px] font-mono uppercase tracking-wider border-b bg-zinc-50 dark:bg-[#121815] text-zinc-600 dark:text-[#CBD5E1] border-zinc-200 dark:border-white/10">
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
                    No expired markets found matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((market) => (
                  <tr
                    key={market.id}
                    className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-white/[0.02]"
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
                          Resolved: {market.resolvedOutcome || "SETTLED"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-500/10 text-warning-amber border border-amber-500/30">
                          Cancelled & Refunded
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
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono bg-amber-500/10 text-warning-amber hover:bg-warning-amber hover:text-white border border-amber-500/30 transition-all cursor-pointer"
                          >
                            Cancel & Refund
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDetailsModalMarket(market)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono border border-border-subtle dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && activeModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm overflow-hidden"
        >
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${
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
                  <h3 id="resolution-dialog-title" className="text-base sm:text-lg font-bold leading-tight">
                    {activeModal.outcome === "CANCEL"
                      ? "Market Invalidation & Full Capital Refund"
                      : `Confirm Market Resolution (${activeModal.outcome})`}
                  </h3>
                  <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                    {activeModal.outcome === "CANCEL"
                      ? "Proportionally refund 100% of all user bets without protocol fee deduction"
                      : "Trigger smart contract payout distribution to winning share holders"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isResolving}
                aria-label="Close dialog"
                className="text-text-muted hover:text-accent-navy dark:hover:text-white p-1 cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
              <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10">
                <div className="text-[10px] font-mono uppercase font-bold text-text-muted dark:text-[#A9B3AD]">
                  Target Market
                </div>
                <div className="font-bold text-sm mt-1">{activeModal.market.title}</div>
                {activeModal.market.resolutionCriteria && (
                  <div className="text-xs text-text-muted dark:text-zinc-300 mt-2 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 font-sans">
                    <strong className="font-mono text-[10px] uppercase block mb-0.5 text-text-muted">Criteria:</strong>
                    {activeModal.market.resolutionCriteria}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono mt-3 pt-3 border-t border-zinc-200 dark:border-white/10 gap-2">
                  <span>Total Collateral: <strong>${activeModal.market.totalPool.toLocaleString()}</strong></span>
                  <a
                    href={activeModal.market.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-blue hover:underline flex items-center gap-1 truncate max-w-full sm:max-w-[240px]"
                  >
                    <span>Oracle Proof URL</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {activeModal.outcome === "YES" && (
                <div className="p-4 rounded-xl bg-yes-green-soft dark:bg-yes-green/10 border border-yes-green/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-yes-green">
                    <span>Winning Outcome: YES</span>
                    <span>YES Pool Share: {activeModal.market.yesPercentage}%</span>
                  </div>
                  <p className="text-xs text-accent-navy dark:text-zinc-200 leading-relaxed font-sans">
                    All YES share token holders will be eligible to claim 100% of the collateral pool. NO share tokens become expired and non-redeemable ($0.00).
                  </p>
                </div>
              )}

              {activeModal.outcome === "NO" && (
                <div className="p-4 rounded-xl bg-no-red-soft dark:bg-no-red/10 border border-no-red/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-no-red">
                    <span>Winning Outcome: NO</span>
                    <span>NO Pool Share: {activeModal.market.noPercentage}%</span>
                  </div>
                  <p className="text-xs text-accent-navy dark:text-zinc-200 leading-relaxed font-sans">
                    All NO share token holders will be eligible to claim 100% of the collateral pool. YES share tokens become expired and non-redeemable ($0.00).
                  </p>
                </div>
              )}

              {activeModal.outcome === "CANCEL" && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-warning-amber space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 uppercase font-mono text-[11px]">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>100% Capital Refund Policy</span>
                    </div>
                    <p className="leading-relaxed text-accent-navy dark:text-zinc-200 font-sans">
                      All deposited capital will be returned to all YES and NO bettors in full. <strong>Zero protocol fees</strong> will be deducted from user refunds.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="cancellation-reason-select"
                      className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
                    >
                      Cancellation Reason Category <span className="text-no-red">*</span>
                    </label>
                    <select
                      id="cancellation-reason-select"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value as CancellationReasonCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none cursor-pointer bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500"
                    >
                      {CANCELLATION_REASONS.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="resolution-notes"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
                >
                  {activeModal.outcome === "CANCEL"
                    ? "Detailed Invalidation Justification *"
                    : "Resolution Oracle Citation & Transaction Notes"}
                </label>
                <textarea
                  id="resolution-notes"
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={
                    activeModal.outcome === "CANCEL"
                      ? "Explain why this market outcome cannot be resolved unambiguously..."
                      : "e.g., Verified via Chainlink data feed at block #19823412..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none resize-none bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerifiedCheck}
                    onChange={(e) => setIsVerifiedCheck(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>
                    {activeModal.outcome === "CANCEL"
                      ? "I confirm that all market participants will be refunded 100% without protocol fees."
                      : "I confirm that I have verified the external oracle proof and approve final outcome distribution."}
                  </span>
                </label>

                {activeModal.outcome === "CANCEL" && (
                  <label className="flex items-start gap-2.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIrreversibleCheck}
                      onChange={(e) => setIsIrreversibleCheck(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      I understand that market cancellation is irreversible once executed on the blockchain.
                    </span>
                  </label>
                )}
              </div>

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

            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0 bg-zinc-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isResolving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs border border-zinc-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-accent-navy dark:text-white transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={isResolving}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
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
                    <span>Executing On-Chain...</span>
                  </>
                ) : activeModal.outcome === "CANCEL" ? (
                  <span>Execute Market Invalidation & Refund</span>
                ) : (
                  <span>Execute Settlement ({activeModal.outcome})</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && detailsModalMarket && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm overflow-hidden"
        >
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 id="details-dialog-title" className="text-base sm:text-lg font-bold">
                  Resolution Record & Details
                </h3>
                <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                  Historical settlement record for market {detailsModalMarket.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalMarket(null)}
                aria-label="Close dialog"
                className="text-text-muted hover:text-accent-navy dark:hover:text-white p-1 cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10">
                <div className="text-[10px] uppercase font-bold text-text-muted">Market Title</div>
                <div className="font-bold text-sm text-accent-navy dark:text-white font-sans mt-0.5">
                  {detailsModalMarket.title}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {detailsModalMarket.status === "CANCELLED" ? "CANCELLED & REFUNDED" : `RESOLVED [${detailsModalMarket.resolvedOutcome}]`}
                  </span>
                </div>
                {detailsModalMarket.cancellationReason && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Reason:</span>
                    <span className="font-bold text-warning-amber">{detailsModalMarket.cancellationReason}</span>
                  </div>
                )}
                {detailsModalMarket.resolvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Settled At:</span>
                    <span>{new Date(detailsModalMarket.resolvedAt).toUTCString()}</span>
                  </div>
                )}
              </div>

              {detailsModalMarket.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10">
                  <div className="text-[10px] uppercase font-bold text-text-muted mb-1">Admin Resolution Notes:</div>
                  <p className="font-sans text-xs text-text-muted dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {detailsModalMarket.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-white/10 flex justify-end shrink-0 bg-zinc-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setDetailsModalMarket(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-accent-navy dark:text-white transition-all cursor-pointer text-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
