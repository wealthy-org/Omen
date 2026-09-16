"use client";

import React, { useState, useMemo } from "react";
import { MarketCard, MarketData } from "./MarketCard";

export interface AdminMarketFormData {
  title: string;
  category: string;
  endTime: string;
  resolutionSourceUrl: string;
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
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("CRYPTO");
  const [endTime, setEndTime] = useState<string>("");
  const [resolutionSourceUrl, setResolutionSourceUrl] = useState<string>("");
  const [initialLiquidity, setInitialLiquidity] = useState<string>("0.50");
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSubmitting = isLoading || internalLoading;

  const previewMarketData: MarketData = useMemo(() => {
    return {
      id: "preview-market",
      title: title.trim() || "Will ETH reach $5,000 before Q4 2026?",
      category: category || "CRYPTO",
      status: "active",
      endTime: endTime ? `Ends ${new Date(endTime).toLocaleDateString()}` : "Ends in 7d 12h",
      totalPool: initialLiquidity || "0.50",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0.00",
    };
  }, [title, category, endTime, initialLiquidity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage("Market title question must be at least 5 characters long.");
      return;
    }

    if (!endTime) {
      setErrorMessage("Please select a valid market deadline date and time.");
      return;
    }

    const selectedTimestamp = new Date(endTime).getTime();
    if (selectedTimestamp <= Date.now()) {
      setErrorMessage("Market deadline must be set in the future (at least 1 hour ahead).");
      return;
    }

    const numLiquidity = parseFloat(initialLiquidity);
    if (isNaN(numLiquidity) || numLiquidity <= 0) {
      setErrorMessage("Initial liquidity must be greater than 0 ETH.");
      return;
    }

    try {
      setInternalLoading(true);
      if (onSubmitMarket) {
        await onSubmitMarket({
          title: title.trim(),
          category,
          endTime,
          resolutionSourceUrl: resolutionSourceUrl.trim(),
          initialLiquidity,
        });
      }
      setSuccessMessage(`Market "${title.trim()}" published successfully to testnet!`);
      setTitle("");
      setEndTime("");
      setResolutionSourceUrl("");
      setInitialLiquidity("0.50");
    } catch {
      setErrorMessage("Failed to publish market. Please check parameters and try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Create Prediction Market
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Deploy a new binary outcome prediction market to Arbitrum Sepolia contracts.
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div role="status" className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="market-title-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Market Question / Title *
            </label>
            <input
              id="market-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Will ETH reach $5,000 before Q4 2026?"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="market-category-select" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Category *
              </label>
              <select
                id="market-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {MARKET_CATEGORIES_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="market-end-time-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Deadline Date & Time *
              </label>
              <input
                id="market-end-time-input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="market-liquidity-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Initial Liquidity Seed (ETH) *
              </label>
              <input
                id="market-liquidity-input"
                type="number"
                step="0.01"
                min="0.01"
                value={initialLiquidity}
                onChange={(e) => setInitialLiquidity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="market-oracle-url-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Resolution Oracle / Source URL
              </label>
              <input
                id="market-oracle-url-input"
                type="url"
                value={resolutionSourceUrl}
                onChange={(e) => setResolutionSourceUrl(e.target.value)}
                placeholder="https://coingecko.com/..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Publishing Market to Blockchain...</span>
                </>
              ) : (
                <span>Publish Market to Blockchain</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-3 sticky top-24">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Live Card Preview
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Interactive
          </span>
        </div>
        <div data-testid="live-market-preview">
          <MarketCard market={previewMarketData} />
        </div>
      </div>
    </div>
  );
};
