"use client";

import React, { useState, useMemo } from "react";
import { MarketCard, MarketData } from "./MarketCard";
import { useAdminCreateMarket } from "@/hooks/useAdminCreateMarket";

export interface AdminMarketFormData {
  title: string;
  category: string;
  endTime: string;
  resolutionSourceUrl: string;
  resolutionCriteria: string;
  initialLiquidity: string;
}

export interface AdminMarketCreateFormProps {
  onSubmitMarket?: (data: AdminMarketFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export const MARKET_CATEGORIES_OPTIONS = [
  "CRYPTO",
  "MEME",
  "TRENDING",
  "L2",
  "MACRO",
];

export const AdminMarketCreateForm: React.FC<AdminMarketCreateFormProps> = ({
  onSubmitMarket,
  isLoading = false,
}) => {
  const { createMarket, isPending: isTxPending, isConfirming, isSyncing } = useAdminCreateMarket();
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("CRYPTO");
  const [endTime, setEndTime] = useState<string>("");
  const [resolutionSourceUrl, setResolutionSourceUrl] = useState<string>("");
  const [resolutionCriteria, setResolutionCriteria] = useState<string>("");
  const [initialLiquidity, setInitialLiquidity] = useState<string>("0.50");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const isSubmitting = isLoading || internalLoading || isTxPending || isConfirming || isSyncing;

  const minDateTimeString = useMemo(() => {
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
    return oneHourLater.toISOString().slice(0, 16);
  }, []);

  const liquidityBreakdown = useMemo(() => {
    const parsed = parseFloat(initialLiquidity);
    const valid = !isNaN(parsed) && parsed > 0;
    const amount = valid ? parsed : 0;
    const yesPool = (amount * 0.5).toFixed(4);
    const noPool = (amount * 0.5).toFixed(4);
    const sharesMinted = (amount * 1000).toLocaleString();
    return {
      valid,
      amount,
      yesPool,
      noPool,
      sharesMinted,
      feeTier: "1.0%",
    };
  }, [initialLiquidity]);

  const previewMarketData: MarketData = useMemo(() => {
    return {
      id: "preview-market",
      title: title.trim() || "Will ETH reach $5,000 before Q4 2026?",
      category: category || "CRYPTO",
      status: "active",
      endTime: endTime
        ? `Ends ${new Date(endTime).toLocaleDateString()}`
        : "Ends in 7d 12h",
      totalPool: initialLiquidity || "0.50",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0.00",
    };
  }, [title, category, endTime, initialLiquidity]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Market question/title is required.";
    } else if (title.trim().length < 10) {
      errors.title = "Market question must be at least 10 characters long.";
    }

    if (!endTime) {
      errors.endTime = "Please select a market deadline date and time.";
    } else {
      const selectedTimestamp = new Date(endTime).getTime();
      const minimumTimestamp = Date.now() + 50 * 60 * 1000;
      if (selectedTimestamp <= minimumTimestamp) {
        errors.endTime = "Market deadline must be set at least 1 hour into the future.";
      }
    }

    const numLiquidity = parseFloat(initialLiquidity);
    if (isNaN(numLiquidity) || numLiquidity < 0.01) {
      errors.initialLiquidity = "Initial liquidity seed must be at least 0.01 ETH.";
    } else if (numLiquidity > 1000) {
      errors.initialLiquidity = "Initial liquidity seed cannot exceed 1,000 ETH.";
    }

    if (!resolutionCriteria.trim()) {
      errors.resolutionCriteria = "Detailed resolution criteria and rules are required.";
    } else if (resolutionCriteria.trim().length < 20) {
      errors.resolutionCriteria = "Resolution criteria must be at least 20 characters explaining outcome conditions.";
    }

    if (resolutionSourceUrl.trim()) {
      try {
        const parsedUrl = new URL(resolutionSourceUrl.trim());
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          errors.resolutionSourceUrl = "Oracle URL must start with http:// or https://";
        }
      } catch {
        errors.resolutionSourceUrl = "Please provide a valid web URL for the resolution oracle.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreflightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (validateForm()) {
      setShowReviewModal(true);
    }
  };

  const handleConfirmDeploy = async () => {
    try {
      setInternalLoading(true);
      setErrorMessage(null);

      await createMarket({
        title: title.trim(),
        category,
        endTime,
        resolutionSourceUrl: resolutionSourceUrl.trim(),
        resolutionCriteria: resolutionCriteria.trim(),
        initialLiquidity,
      });

      if (onSubmitMarket) {
        await onSubmitMarket({
          title: title.trim(),
          category,
          endTime,
          resolutionSourceUrl: resolutionSourceUrl.trim(),
          resolutionCriteria: resolutionCriteria.trim(),
          initialLiquidity,
        });
      }

      setSuccessMessage(`Market "${title.trim()}" successfully deployed and initialized on-chain!`);
      setShowReviewModal(false);
      setTitle("");
      setEndTime("");
      setResolutionSourceUrl("");
      setResolutionCriteria("");
      setInitialLiquidity("0.50");
      setFieldErrors({});
    } catch {
      setErrorMessage("Failed to deploy market contract to blockchain. Please check network and wallet balance.");
    } finally {
      setInternalLoading(false);
    }
  };

  const handleResetForm = () => {
    setTitle("");
    setCategory("CRYPTO");
    setEndTime("");
    setResolutionSourceUrl("");
    setResolutionCriteria("");
    setInitialLiquidity("0.50");
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-border-subtle dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-accent-navy dark:text-white">
              Create Prediction Market
            </h2>
            <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-1">
              Configure parameters, resolution rules, and seed liquidity for new Arbitrum Sepolia prediction markets.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="text-xs font-mono font-semibold text-text-muted hover:text-accent-navy dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Form
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form noValidate onSubmit={handlePreflightSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="market-title-input"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
            >
              Market Question / Title <span className="text-no-red">*</span>
            </label>
            <input
              id="market-title-input"
              type="text"
              value={title}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "market-title-error" : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: "" }));
                }
              }}
              placeholder="e.g. Will ETH reach $5,000 before Q4 2026?"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all outline-none ${
                fieldErrors.title
                  ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                  : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500/60"
              }`}
            />
            {fieldErrors.title && (
              <p id="market-title-error" className="mt-1.5 text-xs text-no-red font-medium">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="market-category-select"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Category <span className="text-no-red">*</span>
              </label>
              <select
                id="market-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-medium text-accent-navy dark:text-white focus:outline-none focus:border-emerald-500/60 transition-all cursor-pointer"
              >
                {MARKET_CATEGORIES_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="market-end-time-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Deadline Date & Time <span className="text-no-red">*</span>
              </label>
              <input
                id="market-end-time-input"
                type="datetime-local"
                min={minDateTimeString}
                value={endTime}
                aria-invalid={Boolean(fieldErrors.endTime)}
                aria-describedby={fieldErrors.endTime ? "market-end-time-error" : undefined}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (fieldErrors.endTime) {
                    setFieldErrors((prev) => ({ ...prev, endTime: "" }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all outline-none ${
                  fieldErrors.endTime
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500/60"
                }`}
              />
              {fieldErrors.endTime && (
                <p id="market-end-time-error" className="mt-1.5 text-xs text-no-red font-medium">
                  {fieldErrors.endTime}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="market-liquidity-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Initial Liquidity Seed (ETH) <span className="text-no-red">*</span>
              </label>
              <input
                id="market-liquidity-input"
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                value={initialLiquidity}
                aria-invalid={Boolean(fieldErrors.initialLiquidity)}
                aria-describedby={fieldErrors.initialLiquidity ? "market-liquidity-error" : undefined}
                onChange={(e) => {
                  setInitialLiquidity(e.target.value);
                  if (fieldErrors.initialLiquidity) {
                    setFieldErrors((prev) => ({ ...prev, initialLiquidity: "" }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-medium border transition-all outline-none ${
                  fieldErrors.initialLiquidity
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500/60"
                }`}
              />
              {fieldErrors.initialLiquidity && (
                <p id="market-liquidity-error" className="mt-1.5 text-xs text-no-red font-medium">
                  {fieldErrors.initialLiquidity}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="market-oracle-url-input"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
              >
                Resolution Oracle / Proof URL
              </label>
              <input
                id="market-oracle-url-input"
                type="url"
                value={resolutionSourceUrl}
                aria-invalid={Boolean(fieldErrors.resolutionSourceUrl)}
                aria-describedby={fieldErrors.resolutionSourceUrl ? "market-oracle-error" : undefined}
                onChange={(e) => {
                  setResolutionSourceUrl(e.target.value);
                  if (fieldErrors.resolutionSourceUrl) {
                    setFieldErrors((prev) => ({ ...prev, resolutionSourceUrl: "" }));
                  }
                }}
                placeholder="https://coingecko.com/en/coins/ethereum"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all outline-none ${
                  fieldErrors.resolutionSourceUrl
                    ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                    : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500/60"
                }`}
              />
              {fieldErrors.resolutionSourceUrl && (
                <p id="market-oracle-error" className="mt-1.5 text-xs text-no-red font-medium">
                  {fieldErrors.resolutionSourceUrl}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="market-criteria-input"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-navy dark:text-[#CBD5E1] mb-1.5"
            >
              Resolution Rules & Criteria <span className="text-no-red">*</span>
            </label>
            <textarea
              id="market-criteria-input"
              rows={3}
              value={resolutionCriteria}
              aria-invalid={Boolean(fieldErrors.resolutionCriteria)}
              aria-describedby={fieldErrors.resolutionCriteria ? "market-criteria-error" : undefined}
              onChange={(e) => {
                setResolutionCriteria(e.target.value);
                if (fieldErrors.resolutionCriteria) {
                  setFieldErrors((prev) => ({ ...prev, resolutionCriteria: "" }));
                }
              }}
              placeholder="e.g. Resolves to YES if CoinGecko 24h close price is >= $5,000 before Dec 31, 2026 UTC. If postponed past Jan 15, 2027, resolves to NO. In case of ambiguous data, protocol multisig ruling is final."
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all outline-none resize-none ${
                fieldErrors.resolutionCriteria
                  ? "border-no-red bg-rose-50/50 dark:bg-rose-950/20 text-accent-navy dark:text-white"
                  : "bg-zinc-50 dark:bg-[#121815] border-zinc-200 dark:border-white/10 text-accent-navy dark:text-white focus:border-emerald-500/60"
              }`}
            />
            {fieldErrors.resolutionCriteria && (
              <p id="market-criteria-error" className="mt-1.5 text-xs text-no-red font-medium">
                {fieldErrors.resolutionCriteria}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase font-bold text-text-muted dark:text-[#A9B3AD] flex items-center justify-between">
              <span>Automated Market Maker (AMM) Seed Calculation</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">50 / 50 Odds</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/5">
                <div className="text-[10px] text-text-muted">YES Collateral</div>
                <div className="font-bold text-yes-green mt-0.5">{liquidityBreakdown.yesPool} ETH</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/5">
                <div className="text-[10px] text-text-muted">NO Collateral</div>
                <div className="font-bold text-no-red mt-0.5">{liquidityBreakdown.noPool} ETH</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/5">
                <div className="text-[10px] text-text-muted">LP Minted</div>
                <div className="font-bold text-accent-navy dark:text-white mt-0.5">{liquidityBreakdown.sharesMinted}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/5">
                <div className="text-[10px] text-text-muted">Protocol Fee</div>
                <div className="font-bold text-primary-blue mt-0.5">{liquidityBreakdown.feeTier}</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Review & Deploy Market</span>
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-4 sticky top-24">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted dark:text-[#A9B3AD]">
            Live Card Preview
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Interactive
          </span>
        </div>
        <div data-testid="live-market-preview">
          <MarketCard market={previewMarketData} />
        </div>

        {resolutionCriteria && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0F0C] border border-zinc-200 dark:border-white/10 text-xs">
            <div className="font-mono font-bold uppercase text-[10px] text-text-muted dark:text-[#A9B3AD] mb-1">
              Resolution Criteria Preview
            </div>
            <p className="text-accent-navy dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
              {resolutionCriteria}
            </p>
          </div>
        )}
      </div>

      {showReviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl rounded-2xl border bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 p-6 sm:p-8 text-accent-navy dark:text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 id="review-dialog-title" className="text-lg font-bold">
                    Confirm Prediction Market Deployment
                  </h3>
                  <p className="text-xs text-text-muted dark:text-[#A9B3AD]">
                    Verify smart contract parameters before broadcasting to Arbitrum Sepolia
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={isSubmitting}
                className="text-text-muted hover:text-accent-navy dark:hover:text-white p-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 space-y-2">
                <div className="text-[10px] uppercase font-bold text-text-muted">Market Title</div>
                <div className="font-bold text-sm text-accent-navy dark:text-white font-sans">{title}</div>
                <div className="flex flex-wrap gap-3 pt-2 text-[11px] border-t border-border-subtle dark:border-white/10">
                  <span>Category: <strong className="text-emerald-600 dark:text-emerald-400">{category}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong>{new Date(endTime).toUTCString()}</strong></span>
                  <span>•</span>
                  <span>Seed Liquidity: <strong>{initialLiquidity} ETH</strong></span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 space-y-1">
                <div className="text-[10px] uppercase font-bold text-text-muted">Resolution Rules</div>
                <p className="font-sans text-xs text-text-muted dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {resolutionCriteria}
                </p>
              </div>

              {resolutionSourceUrl && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#121815] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Oracle Reference:</span>
                  <span className="truncate max-w-[280px] text-primary-blue underline">{resolutionSourceUrl}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl font-bold text-xs border border-border-subtle dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmDeploy}
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : "active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deploying to Arbitrum...</span>
                  </>
                ) : (
                  <span>Confirm & Deploy On-Chain</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
