"use client";

import React, { useState } from "react";

import { PositionSide, PositionPanelProps } from "@/types";

export type { PositionSide, PositionPanelProps };

export const PRESET_AMOUNTS = ["0.01", "0.05", "0.10"];

export const PositionPanel: React.FC<PositionPanelProps> = ({
  marketId,
  agreePool = 0,
  disagreePool = 0,
  userBalance = "1.00",
  isSubmitting = false,
  onConfirmPosition,
}) => {
  const [selectedSide, setSelectedSide] = useState<PositionSide>("AGREE");
  const [amount, setAmount] = useState<string>("0.05");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

  const numAmount = parseFloat(amount) || 0;
  const numBalance = parseFloat(userBalance) || 0;

  const totalPool = agreePool + disagreePool;
  const currentSidePool = selectedSide === "AGREE" ? agreePool : disagreePool;
  const oppositeSidePool = selectedSide === "AGREE" ? disagreePool : agreePool;
  
  const estimatedPoolShare = totalPool + numAmount > 0 
    ? (((currentSidePool + numAmount) / (totalPool + numAmount)) * 100).toFixed(1)
    : "100.0";

  const estimatedPayout = numAmount > 0
    ? numAmount + (oppositeSidePool * (numAmount / (currentSidePool + numAmount || 1))) * 0.99
    : 0;
  
  const profitPercentage = numAmount > 0
    ? Math.max(0, Math.round(((estimatedPayout - numAmount) / numAmount) * 100))
    : 0;

  const handleAmountChange = (val: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (/^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handleAddPreset = (presetVal: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const current = parseFloat(amount) || 0;
    const addition = parseFloat(presetVal) || 0;
    setAmount((current + addition).toFixed(2));
  };

  const handleSetMax = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAmount(userBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numAmount <= 0) {
      setErrorMessage("Please enter an amount greater than 0 ETH.");
      return;
    }

    if (numAmount > numBalance) {
      setErrorMessage(`Insufficient balance. You have ${userBalance} ETH available.`);
      return;
    }

    try {
      setInternalLoading(true);
      if (onConfirmPosition) {
        await onConfirmPosition({
          marketId,
          side: selectedSide,
          amount,
        });
      }
      setSuccessMessage(`Successfully staked ${amount} ETH on ${selectedSide}!`);
    } catch {
      setErrorMessage("Transaction failed or was rejected. Please try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isSubmitting || internalLoading;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center justify-between">
        <span>Take a Position</span>
        <span className="text-xs font-mono font-normal text-zinc-500 dark:text-zinc-400">
          Balance: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{userBalance} ETH</strong>
        </span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Select Your Conviction
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setSelectedSide("AGREE");
                setErrorMessage(null);
              }}
              aria-label="Select AGREE side"
              className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedSide === "AGREE"
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              aria-pressed={selectedSide === "AGREE"}
            >
              <span>AGREE</span>
              <span className="text-xs font-mono opacity-90">({agreePool} ETH)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSide("DISAGREE");
                setErrorMessage(null);
              }}
              aria-label="Select DISAGREE side"
              className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedSide === "DISAGREE"
                  ? "bg-rose-600 dark:bg-rose-500 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              aria-pressed={selectedSide === "DISAGREE"}
            >
              <span>DISAGREE</span>
              <span className="text-xs font-mono opacity-90">({disagreePool} ETH)</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="position-amount-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Position Amount
          </label>
          <div className="relative">
            <input
              id="position-amount-input"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-4 pr-16 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              aria-label="Position Amount in ETH"
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
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
                aria-label={`+${preset}`}
              >
                +{preset}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSetMax}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors ml-auto"
              aria-label="MAX"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span>Estimated Pool Share</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{estimatedPoolShare}%</span>
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

        {successMessage && (
          <div role="status" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
            loading
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              : selectedSide === "AGREE"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98"
              : "bg-rose-600 hover:bg-rose-700 text-white active:scale-98"
          }`}
          aria-label={loading ? "Processing Position..." : `Place Position ${selectedSide}`}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Processing Position...</span>
            </>
          ) : (
            <span>Place Position ({numAmount.toFixed(2)} ETH {selectedSide})</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default PositionPanel;
