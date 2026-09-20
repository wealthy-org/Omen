"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { NetworkSwitcherModalProps } from "@/types";
import { ETHEREUM_SEPOLIA_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";

export type { NetworkSwitcherModalProps };

export default function NetworkSwitcherModal({
  isOpen,
  currentChainId = 1,
  currentNetworkName = "Ethereum Mainnet",
  targetChainId = ETHEREUM_SEPOLIA_CHAIN_ID,
  targetNetworkName = "Ethereum Sepolia",
  onSwitchNetwork,
  onClose,
}: NetworkSwitcherModalProps) {
  const [selectedChainId, setSelectedChainId] = useState<number>(targetChainId);
  const [isSwitching, setIsSwitching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const supportedNetworks = [
    { id: ETHEREUM_SEPOLIA_CHAIN_ID, name: "Ethereum Sepolia" },
    { id: ROBINHOOD_TESTNET_CHAIN_ID, name: "Robinhood Chain Testnet" },
  ];

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      if (onSwitchNetwork) {
        await onSwitchNetwork(selectedChainId);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const currentSelectedNetwork =
    supportedNetworks.find((n) => n.id === selectedChainId) || {
      id: targetChainId,
      name: targetNetworkName,
    };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="network-modal-title"
      aria-describedby="network-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col p-5 sm:p-6 rounded-2xl border shadow-2xl overflow-y-auto text-center bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 text-[#0B1F16] dark:text-white shadow-[0_16px_40px_rgba(14,122,78,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.8)]">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-lg border transition-colors border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD] hover:text-[#0B1F16] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="w-14 h-14 rounded-full bg-warning-soft dark:bg-amber-500/15 text-warning-amber flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-xs">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 id="network-modal-title" className="text-xl font-bold tracking-tight mb-2">
          Wrong Network Detected
        </h2>

        <p
          id="network-modal-desc"
          className="text-sm leading-relaxed mb-6 text-[#4B5D55] dark:text-[#A9B3AD]"
        >
          Omen operates on Ethereum Sepolia and Robinhood Chain Testnet. Please switch your wallet network to continue.
        </p>

        <div className="p-3.5 rounded-xl border mb-4 text-left space-y-2.5 bg-emerald-50/50 dark:bg-white/5 border-emerald-500/15 dark:border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4B5D55] dark:text-[#A9B3AD]">Current Network:</span>
            <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-no-red bg-no-red-soft dark:bg-no-red/10 px-2 py-0.5 rounded border border-no-red/20">
              <span className="w-1.5 h-1.5 rounded-full bg-no-red" />
              {currentNetworkName} ({currentChainId})
            </span>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <div className="text-xs font-semibold mb-2 text-muted">Select Target Network:</div>
            <div className="grid grid-cols-1 gap-2">
              {supportedNetworks.map((net) => (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setSelectedChainId(net.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedChainId === net.id
                      ? "border-primary-blue bg-primary-blue/10 text-primary-blue font-semibold"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedChainId === net.id ? "bg-yes-green animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    {net.name}
                  </span>
                  <span className="font-mono text-[11px] opacity-75">ID: {net.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwitch}
          disabled={isSwitching}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
            isSwitching
              ? "bg-primary-blue/70 text-white cursor-not-allowed"
              : "bg-primary-blue text-white hover:bg-primary-blue-hover cursor-pointer"
          }`}
        >
          {isSwitching ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Switching to {currentSelectedNetwork.name}...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>Switch to {currentSelectedNetwork.name}</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-[#4B5D55] dark:text-[#A9B3AD] hover:text-[#0B1F16] dark:hover:text-white"
          >
            Dismiss for now
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
