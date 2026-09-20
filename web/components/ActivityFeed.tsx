"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Check,
  X,
  Sparkles,
  Trophy,
  Scale,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { ActivityType, ActivityItem, ActivityFeedProps } from "@/types";
import { fetchAndDecodeTransaction, DecodedTxResult } from "@/lib/rpc-decoder";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  getExplorerTxUrl,
} from "@/lib/contracts";

export type { ActivityType, ActivityItem, ActivityFeedProps };

function getChainInfo(chainId?: number) {
  if (chainId === ROBINHOOD_TESTNET_CHAIN_ID) {
    return {
      name: "Robinhood Chain Testnet",
      shortName: "Robinhood Chain",
      chainId: ROBINHOOD_TESTNET_CHAIN_ID,
      currency: "ETH",
      explorerName: "Robinhood Explorer",
    };
  }
  return {
    name: "Ethereum Sepolia",
    shortName: "Ethereum Sepolia",
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    currency: "ETH",
    explorerName: "Etherscan Sepolia",
  };
}

function formatRelativeTime(dateString: string): string {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading = false }) => {
  const [activeModalItem, setActiveModalItem] = useState<ActivityItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [decodedTx, setDecodedTx] = useState<DecodedTxResult | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (activeModalItem) {
      setIsLoadingTx(true);
      setDecodedTx(null);

      fetchAndDecodeTransaction(activeModalItem.txHash, activeModalItem.chainId)
        .then((result) => {
          if (!isCancelled) {
            setDecodedTx(result);
            setIsLoadingTx(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setIsLoadingTx(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [activeModalItem]);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          No recent activity found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => {
        const shortActor = item.actorAddress.length >= 10
          ? `${item.actorAddress.slice(0, 6)}...${item.actorAddress.slice(-4)}`
          : item.actorAddress;
        const shortTx = item.txHash.length >= 10
          ? `${item.txHash.slice(0, 8)}...`
          : item.txHash;
        const displayName = item.actorName ?? shortActor;
        const avatarInitial = (item.actorName ?? item.actorAddress).slice(0, 2).toUpperCase();

        const renderBadge = () => {
          switch (item.type) {
            case "MARKET_CREATED":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MARKET CREATED</span>
                </span>
              );
            case "AGREE":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>AGREE STAKE</span>
                </span>
              );
            case "DISAGREE":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>DISAGREE STAKE</span>
                </span>
              );
            case "CONFIRM_EIP712":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Check className="w-3.5 h-3.5" />
                  <span>EIP-712 SIGNED</span>
                </span>
              );
            case "CLAIM":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>PAYOUT CLAIM</span>
                </span>
              );
            case "RESOLVE":
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Scale className="w-3.5 h-3.5" />
                  <span>RESOLUTION</span>
                </span>
              );
          }
        };

        const renderChainBadge = () => {
          if (item.chainId === ROBINHOOD_TESTNET_CHAIN_ID) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span>Robinhood Chain ({ROBINHOOD_TESTNET_CHAIN_ID})</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Ethereum Sepolia ({ETHEREUM_SEPOLIA_CHAIN_ID})</span>
            </span>
          );
        };

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-emerald-500/30 transition-all hover-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {avatarInitial}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </span>
                  {renderBadge()}
                  {renderChainBadge()}
                  {item.amountEth !== undefined && (
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {item.amountEth} ETH
                    </span>
                  )}
                </div>

                <Link
                  href={`/market/${item.marketId}`}
                  className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1 transition-colors block"
                  aria-label="View Market"
                >
                  {item.marketStatement}
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80">
              <span className="text-xs font-mono text-zinc-400">
                {formatRelativeTime(item.timestamp)}
              </span>

              <button
                type="button"
                onClick={() => setActiveModalItem(item)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="View On-Chain Transaction Receipt"
                aria-label={`View transaction receipt for ${shortTx}`}
              >
                <span>{shortTx}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        );
      })}

      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl p-4 sm:p-6 border shadow-2xl relative max-h-[82vh] sm:max-h-[88vh] overflow-y-auto animate-scale-in bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-emerald-500/20 text-[#0B1F16] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-3 sm:pb-4 border-b border-zinc-200 dark:border-white/10 mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    On-Chain Transaction Receipt
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    <span>{getChainInfo(activeModalItem.chainId).name} (Chain ID: {getChainInfo(activeModalItem.chainId).chainId})</span>
                    <span>•</span>
                    {isLoadingTx ? (
                      <span className="text-zinc-400 font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Querying RPC...
                      </span>
                    ) : decodedTx?.foundOnRpc ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed (On-Chain)
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Confirmed (Database Record)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 font-mono text-xs">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
                    Transaction Hash
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 break-all text-xs sm:text-sm">
                    {activeModalItem.txHash}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeModalItem.txHash)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200/70 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedHash ? "Copied!" : "Copy Hash"}</span>
                </button>
              </div>

              {(activeModalItem.type === "AGREE" || activeModalItem.type === "DISAGREE") && (
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 dark:text-emerald-400">
                      Transaction Position Details
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono text-white ${
                        activeModalItem.type === "AGREE" ? "bg-emerald-600" : "bg-rose-600"
                      }`}
                    >
                      Position: {activeModalItem.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Staked Amount</span>
                      <span className="font-extrabold text-zinc-900 dark:text-white text-xs mt-0.5 block">
                        {activeModalItem.amountEth !== undefined
                          ? `${activeModalItem.amountEth} ETH`
                          : decodedTx?.valueEth
                          ? `${decodedTx.valueEth} ETH`
                          : "-"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Position Side</span>
                      <span
                        className={`font-extrabold text-xs mt-0.5 block ${
                          activeModalItem.type === "AGREE"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {activeModalItem.type}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Block Number</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.blockNumber ? `#${decodedTx.blockNumber} (${decodedTx.confirmations ?? 1} Confs)` : "Indexed Block Record"}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Execution Fee</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.executionFeeEth ? `${Number(decodedTx.executionFeeEth).toFixed(6)} ETH` : "Indexed Estimate"}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Gas Price / Used</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.gasPriceGwei ? `${Number(decodedTx.gasPriceGwei).toFixed(1)} Gwei` : "Network Gas"} • {decodedTx?.gasUsed ? Number(decodedTx.gasUsed).toLocaleString() : "Confirmed"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">From (Trader / Origin)</span>
                  <span className="break-all font-mono text-zinc-800 dark:text-zinc-200">
                    {decodedTx?.from || activeModalItem.actorAddress}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Interacted With (Contract)</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {decodedTx?.toContractName || "OmenMarket (Dual-Chain Pari-Mutuel)"}
                    </span>
                    <span className="break-all text-[11px] text-zinc-600 dark:text-zinc-400">
                      {decodedTx?.to || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {decodedTx?.functionName ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      Decoded EVM Calldata & Event Logs
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Live ABI Decoded</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black/80 font-mono text-[11px] mb-2 text-zinc-900 dark:text-emerald-300 border border-zinc-200 dark:border-white/10 overflow-x-auto">
                    {decodedTx.functionName}
                  </div>
                  {decodedTx.params && decodedTx.params.length > 0 && (
                    <div className="space-y-1.5">
                      {decodedTx.params.map((param, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 text-[11px] p-1.5 rounded bg-white/60 dark:bg-white/[0.03]">
                          <span className="text-zinc-500 dark:text-zinc-400 font-bold shrink-0">[{i}] {param.name} ({param.type}):</span>
                          <span className="text-right text-zinc-900 dark:text-zinc-200 break-all font-semibold">{param.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : decodedTx?.rawInput && decodedTx.rawInput !== "0x" ? (
                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-100/90 dark:bg-black/60 border border-zinc-300 dark:border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      Raw Transaction Calldata
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">EVM Input</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black/80 font-mono text-[10px] text-zinc-900 dark:text-emerald-300 border border-zinc-200 dark:border-white/10 break-all">
                    {decodedTx.rawInput}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 sm:mt-5 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
              <a
                href={getExplorerTxUrl(activeModalItem.chainId, activeModalItem.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View on {getChainInfo(activeModalItem.chainId).explorerName}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
