"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MarketData, MarketOutcome } from "./MarketCard";
import { usePlaceBet } from "@/hooks/usePlaceBet";

export interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: MarketData | null;
  initialOutcome?: MarketOutcome;
  userBalance?: string;
  onConfirmBet?: (params: {
    marketId: string | number;
    outcome: MarketOutcome;
    amount: string;
  }) => Promise<void> | void;
}

export const PRESET_AMOUNTS = ["0.01", "0.05", "0.10"];

export const BettingModal: React.FC<BettingModalProps> = ({
  isOpen,
  onClose,
  market,
  initialOutcome = "YES",
  userBalance = "1.50",
  onConfirmBet,
}) => {
  const { placeBet, isPending: isWeb3Pending } = usePlaceBet();
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome>(initialOutcome);
  const [amount, setAmount] = useState<string>("0.05");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [prevInitialOutcome, setPrevInitialOutcome] = useState(initialOutcome);

  if (initialOutcome !== prevInitialOutcome) {
    setPrevInitialOutcome(initialOutcome);
    if (initialOutcome) {
      setSelectedOutcome(initialOutcome);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !market || !mounted) return null;

  const odds = selectedOutcome === "YES" ? market.yesPercentage : market.noPercentage;
  const numAmount = parseFloat(amount) || 0;
  const numBalance = parseFloat(userBalance) || 0;

  const impliedProbability = Math.max(odds, 1);
  const estimatedPayout = numAmount > 0 ? (numAmount / (impliedProbability / 100)) * 0.99 : 0;
  const profitPercentage = numAmount > 0 ? Math.round(((estimatedPayout - numAmount) / numAmount) * 100) : 0;

  const handleAmountChange = (val: string) => {
    setErrorMessage(null);
    if (/^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handleAddPreset = (presetVal: string) => {
    setErrorMessage(null);
    const current = parseFloat(amount) || 0;
    const addition = parseFloat(presetVal) || 0;
    setAmount((current + addition).toFixed(2));
  };

  const handleSetMax = () => {
    setErrorMessage(null);
    setAmount(userBalance);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numAmount <= 0) {
      setErrorMessage("Please enter an amount greater than 0 ETH.");
      return;
    }

    if (numAmount > numBalance) {
      setErrorMessage(`Insufficient balance. You have ${userBalance} ETH available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (onConfirmBet) {
        await onConfirmBet({
          marketId: market.id,
          outcome: selectedOutcome,
          amount,
        });
      } else {
        await placeBet({
          marketId: market.id,
          outcome: selectedOutcome,
          amount,
        });
      }
      onClose();
    } catch {
      setErrorMessage("Transaction failed or was rejected. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      data-testid="betting-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="betting-modal-title"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl relative text-zinc-900 dark:text-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-3 shrink-0">
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {market.category}
              </span>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {market.endTime}
              </span>
            </div>
            <h2 id="betting-modal-title" className="text-base sm:text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-100">
              {market.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close betting modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Select Position Outcome
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setSelectedOutcome("YES")}
                  aria-label="Select YES outcome"
                  className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                    selectedOutcome === "YES"
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  aria-pressed={selectedOutcome === "YES"}
                >
                  <span>YES</span>
                  <span className="text-xs font-mono opacity-90">{market.yesPercentage}%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutcome("NO")}
                  aria-label="Select NO outcome"
                  className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                    selectedOutcome === "NO"
                      ? "bg-rose-600 dark:bg-rose-500 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  aria-pressed={selectedOutcome === "NO"}
                >
                  <span>NO</span>
                  <span className="text-xs font-mono opacity-90">{market.noPercentage}%</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="bet-amount-input" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Amount to Bet
                </label>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Balance: <span className="font-bold text-zinc-900 dark:text-zinc-100">{userBalance} ETH</span>
                </span>
              </div>

              <div className="relative">
                <input
                  id="bet-amount-input"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-4 pr-16 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  aria-label="Bet amount in ETH"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-mono font-bold text-zinc-400 pointer-events-none">
                  ETH
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors ml-auto cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Current Implied Odds</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{odds}%</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Protocol Fee (1%)</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{(numAmount * 0.01).toFixed(4)} ETH</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Potential Payout</span>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {estimatedPayout.toFixed(4)} ETH
                  </span>
                  {numAmount > 0 && (
                    <span className="block text-[11px] font-mono text-emerald-500">
                      +{profitPercentage}% ROI
                    </span>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              type="submit"
              disabled={isSubmitting || isWeb3Pending || numAmount <= 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || isWeb3Pending || numAmount <= 0
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98"
              }`}
            >
              {isSubmitting || isWeb3Pending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Bet...</span>
                </>
              ) : (
                <span>Confirm Bet ({numAmount.toFixed(2)} ETH)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
