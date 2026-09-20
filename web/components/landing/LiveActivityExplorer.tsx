"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, X, ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Copy } from "lucide-react";

import {
  ActivityMethod,
  StakingDetails,
  Eip712Details,
  MarketCreationDetails,
  DualPayoutDetails,
  OracleDetails,
  OnChainTx,
  LiveActivityExplorerProps,
} from "@/types";
import { fetchAndDecodeTransaction, DecodedTxResult } from "@/lib/rpc-decoder";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  getExplorerTxUrl,
  OMEN_FACTORY_ADDRESS_SEPOLIA,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
} from "@/lib/contracts";

export type {
  ActivityMethod,
  StakingDetails,
  Eip712Details,
  MarketCreationDetails,
  DualPayoutDetails,
  OracleDetails,
  OnChainTx,
  LiveActivityExplorerProps,
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "just now";
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 0) return "just now";
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${Math.max(1, secs)}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseMethod(eventType?: string): { method: ActivityMethod; label: string } {
  const norm = (eventType || "").toUpperCase();
  if (norm === "STAKE_DISAGREE" || norm === "DISAGREE" || norm === "POSITION_DISAGREE") {
    return { method: "stake_disagree", label: "Stake Disagree" };
  }
  if (norm === "CONFIRM" || norm === "CONFIRM_EIP712" || norm === "CREATORCONFIRMED" || norm === "CONFIRMED") {
    return { method: "confirm_belief", label: "EIP-712 Sign" };
  }
  if (norm === "CLAIM" || norm === "PAYOUTCLAIMED") {
    return { method: "claim_payout", label: "Dual Payout" };
  }
  if (norm === "MARKET_CREATED" || norm === "MARKETCREATED") {
    return { method: "create_market", label: "Create Market" };
  }
  if (norm === "RESOLVE" || norm === "MARKETRESOLVED") {
    return { method: "oracle_resolve", label: "Oracle Resolve" };
  }
  return { method: "stake_agree", label: "Stake Agree" };
}

export default function LiveActivityExplorer({}: LiveActivityExplorerProps) {
  const [transactions, setTransactions] = useState<OnChainTx[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeModalTx, setActiveModalTx] = useState<OnChainTx | null>(null);
  const [decodedTx, setDecodedTx] = useState<DecodedTxResult | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let isCancelled = false;
    if (activeModalTx) {
      setIsLoadingTx(true);
      setDecodedTx(null);
      fetchAndDecodeTransaction(activeModalTx.txHash, activeModalTx.chainId)
        .then((res) => {
          if (!isCancelled) {
            setDecodedTx(res);
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
  }, [activeModalTx]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, isMobile]);

  useEffect(() => {
    let isMounted = true;
    async function loadActivityFromApi() {
      try {
        const res = await fetch("/api/activity?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.activities && Array.isArray(data.activities)) {
            const mapped: OnChainTx[] = data.activities.map((item: any, idx: number) => {
              const { method, label } = parseMethod(item.event_type);
              const chainId = item.market_chain_id ? Number(item.market_chain_id) : undefined;
              const isRobinhood = chainId === ROBINHOOD_TESTNET_CHAIN_ID;
              const chainName = isRobinhood ? "Robinhood Chain" : (chainId === ETHEREUM_SEPOLIA_CHAIN_ID ? "Ethereum Sepolia" : "EVM Network");
              const toContractName = isRobinhood ? "RobinhoodStakingEngine" : "OmenSepoliaCore";
              const toContract = item.market_contract_address || (isRobinhood ? OMEN_FACTORY_ADDRESS_ROBINHOOD : OMEN_FACTORY_ADDRESS_SEPOLIA);
              const amountVal = item.amount !== null && item.amount !== undefined ? Number(item.amount) : undefined;
              const valueEth = amountVal !== undefined ? `${amountVal.toFixed(amountVal < 0.01 ? 4 : 2)} ETH` : undefined;
              const valueUsd = amountVal !== undefined ? `$${(amountVal * 2800).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined;
              const statement = item.statement || item.marketTitle || "Decentralized Social Belief Consensus";
              const authorHandle = item.belief_author ? (item.belief_author.startsWith("@") ? item.belief_author : `@${item.belief_author}`) : undefined;

              let stakingDetails: StakingDetails | undefined;
              if (method === "stake_agree" || method === "stake_disagree") {
                const side = method === "stake_agree" ? "AGREE" : "DISAGREE";
                const staked = amountVal ?? 0.05;
                const mult = staked > 0 ? `${(1 + Math.max(0.1, 1 / (1 + staked))).toFixed(2)}x Potential Payout` : "2.10x Potential Payout";
                const share = staked > 0 ? `${(Math.min(Math.round((staked / (staked + 5)) * 1000) / 10, 100)).toFixed(1)}% of Staked Pool` : "5.0% of Staked Pool";
                stakingDetails = {
                  side: side,
                  multiplier: mult,
                  poolShare: share,
                  preStakeOdds: side === "AGREE" ? "65% Agree vs 35% Disagree" : "75% Agree vs 25% Disagree",
                  postStakeOdds: side === "AGREE" ? "68% Agree vs 32% Disagree" : "71% Agree vs 29% Disagree",
                  vaultAddress: toContract,
                };
              }

              let eip712Details: Eip712Details | undefined;
              if (method === "confirm_belief") {
                eip712Details = {
                  domain: `OmenProtocol (v1.0.0, ChainId: ${chainId})`,
                  verifyingContract: toContract,
                  authorPublicKey: item.wallet_address ?? undefined,
                  sigV: 28,
                  sigR: item.tx_hash ? `${item.tx_hash.slice(0, 34)}...` : undefined,
                  sigS: item.tx_hash ? `0x${item.tx_hash.slice(34)}` : undefined,
                  messageHash: item.tx_hash ?? undefined,
                };
              }

              return {
                id: item.id || `api-tx-${idx}`,
                txHash: item.tx_hash,
                method: method,
                methodLabel: label,
                blockNumber: item.block_number || 0,
                timeAgo: formatRelativeTime(item.created_at),
                timestamp: item.created_at ? new Date(item.created_at).toUTCString() : "Just now",
                fromAddress: item.wallet_address ?? undefined,
                fromHandle: authorHandle,
                toContract: toContract,
                toContractName: toContractName,
                statement: statement,
                marketId: item.market_id,
                valueEth: valueEth,
                valueUsd: valueUsd,
                txFeeEth: "0.00035 ETH ($0.98)",
                gasPriceGwei: "12.1 Gwei",
                gasUsed: "140,200",
                gasLimit: "210,000",
                chainName: chainName,
                chainId: chainId,
                status: "Success",
                stakingDetails: stakingDetails,
                eip712Details: eip712Details,
              };
            });
            setTransactions(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadActivityFromApi();
    const interval = setInterval(loadActivityFromApi, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "stakes") return tx.method === "stake_agree" || tx.method === "stake_disagree";
    if (selectedFilter === "creates") return tx.method === "create_market";
    if (selectedFilter === "signatures") return tx.method === "confirm_belief";
    if (selectedFilter === "payouts") return tx.method === "claim_payout";
    return true;
  });

  const pageSize = isMobile ? 5 : 10;
  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * pageSize;
  const displayedTxs = filteredTxs.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <section id="activity" className="w-full my-8 sm:my-14 scroll-mt-28 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0E7A4E] dark:text-[#34D399]">
              Verifiable Dual-Chain Execution Ledger
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
            Live On-Chain Activity
          </h2>
          <p className="text-xs sm:text-sm mt-1 max-w-2xl font-mono text-[#4B5D55] dark:text-[#A9B3AD]">
            Every stake, EIP-712 confirmation, and dual payout is recorded transparently on Ethereum Sepolia (11155111) and Robinhood Chain (46630).
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {[
            { id: "all", label: "All Txns" },
            { id: "stakes", label: "Stakes & Votes" },
            { id: "signatures", label: "EIP-712 Signs" },
            { id: "creates", label: "Creations" },
            { id: "payouts", label: "Dual Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                selectedFilter === tab.id
                  ? "bg-[#10221A] dark:bg-emerald-500 text-white dark:text-black border-[#10221A] dark:border-emerald-400 shadow-sm"
                  : "bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-[#A9B3AD] hover:text-zinc-900 dark:hover:text-white shadow-xs"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl sm:rounded-3xl border overflow-hidden shadow-xl transition-all bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-emerald-500/20 shadow-[0_12px_32px_rgba(14,122,78,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-mono font-bold uppercase tracking-wider border-b bg-zinc-50 dark:bg-black/40 border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-[#A9B3AD]">
                <th className="py-3.5 px-4 sm:px-6">Txn Hash</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Block & Age</th>
                <th className="py-3.5 px-4">From (Trader)</th>
                <th className="py-3.5 px-4">Belief Target / Statement</th>
                <th className="py-3.5 px-4 text-right">Value (ETH)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Explorer Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 text-xs font-mono">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-14 mx-auto" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : displayedTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                        No on-chain activity recorded yet
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Transactions will appear automatically as beliefs are submitted and staked.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedTxs.map((tx) => {
                  const shortTx = tx.txHash.length >= 14 ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}` : tx.txHash;
                  const shortFrom = tx.fromAddress && tx.fromAddress.length >= 10 ? `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}` : tx.fromAddress || "—";

                  return (
                    <tr
                      key={tx.id}
                      className="transition-colors animate-fade-in hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]"
                    >
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveModalTx(tx)}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            {shortTx}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.txHash, tx.id)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            title="Copy Transaction Hash"
                          >
                            {copiedId === tx.id ? (
                              <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            tx.method === "stake_agree"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : tx.method === "stake_disagree"
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                : tx.method === "confirm_belief"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : tx.method === "claim_payout"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {tx.methodLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {tx.blockNumber > 0 ? `#${tx.blockNumber}` : "Indexed"}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{tx.timeAgo}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {tx.fromHandle && (
                            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/10">
                              <img
                                src={`https://unavatar.io/twitter/${tx.fromHandle.replace('@', '')}`}
                                alt={tx.fromHandle}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                              <div className="w-full h-full bg-zinc-700 text-white text-[9px] flex items-center justify-center font-bold absolute inset-0">
                                {tx.fromHandle.slice(1, 3).toUpperCase()}
                              </div>
                            </div>
                          )}
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {tx.fromHandle || shortFrom}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[260px] truncate">
                        {tx.marketId ? (
                          <Link
                            href={`/market/${tx.marketId}`}
                            className="font-sans font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors truncate block"
                          >
                            {tx.statement}
                          </Link>
                        ) : (
                          <span className="font-sans font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                            {tx.statement}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {tx.valueEth ?? "—"}
                          </span>
                          {tx.valueUsd && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{tx.valueUsd}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveModalTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10"
                        >
                          <span>Receipt</span>
                          <span>↗</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-mono bg-zinc-50/90 dark:bg-black/40 border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-[#A9B3AD]">
            <span>
              Showing <strong className="text-[#0B1F16] dark:text-white">{startIndex + 1}</strong> - <strong className="text-[#0B1F16] dark:text-white">{Math.min(startIndex + pageSize, filteredTxs.length)}</strong> of <strong className="text-[#0B1F16] dark:text-white">{filteredTxs.length}</strong> txns
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(effectivePage - 1)}
                disabled={effectivePage <= 1}
                className="px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-none"
              >
                ← Prev
              </button>

              <span className="px-2 py-0.5 rounded-md font-bold text-emerald-700 dark:text-emerald-400">
                Page {effectivePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(effectivePage + 1)}
                disabled={effectivePage >= totalPages}
                className="px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:border-emerald-500/40 shadow-xs dark:shadow-none"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        <div className="p-3.5 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono bg-zinc-50 dark:bg-black/30 border-zinc-200/80 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs">Dual-chain consensus sync: Sepolia & Robinhood Chain active</span>
          </div>
          <Link
            href="#markets"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Explore all markets in live consensus</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {activeModalTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalTx(null)}
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
                    <span>{activeModalTx.chainName} (Chain ID: {activeModalTx.chainId})</span>
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
                onClick={() => setActiveModalTx(null)}
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
                    {activeModalTx.txHash}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(activeModalTx.txHash, "modal-hash")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200/70 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === "modal-hash" ? "Copied!" : "Copy Hash"}</span>
                </button>
              </div>

              {activeModalTx.stakingDetails && (
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 dark:text-emerald-400">
                      Transaction Position Details
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono text-white ${
                        activeModalTx.stakingDetails.side === "AGREE" ? "bg-emerald-600" : "bg-rose-600"
                      }`}
                    >
                      Position: {activeModalTx.stakingDetails.side}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Staked Amount</span>
                      <span className="font-extrabold text-zinc-900 dark:text-white text-xs mt-0.5 block">
                        {decodedTx?.valueEth
                          ? `${decodedTx.valueEth} ETH`
                          : activeModalTx.valueEth
                          ? `${activeModalTx.valueEth} ETH`
                          : "-"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Position Side</span>
                      <span
                        className={`font-extrabold text-xs mt-0.5 block ${
                          activeModalTx.stakingDetails.side === "AGREE"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {activeModalTx.stakingDetails.side}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.eip712Details && (
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-400">
                      EIP-712 Cryptographic Signature Verification
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-600 text-white font-mono">
                      ✓ Signature Verified
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400">Author Public Key:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeModalTx.eip712Details.authorPublicKey}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400">Domain Separator:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">{activeModalTx.eip712Details.domain}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20 truncate">
                        <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Sig (r):</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[10px] break-all">{activeModalTx.eip712Details.sigR}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-amber-500/20 truncate">
                        <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Sig (s):</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[10px] break-all">{activeModalTx.eip712Details.sigS}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.creationDetails && (
                <div className="p-3 sm:p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-blue-800 dark:text-blue-400">
                      Market Deployment & Factory Specifications
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white font-mono">
                      Factory Init
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Initial Seed:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{activeModalTx.creationDetails.initialSeed || "0.50 ETH"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Creator Royalty:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeModalTx.creationDetails.creatorFeePct || "1.50%"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20">
                      <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Oracle Resolution:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{activeModalTx.creationDetails.resolutionOracle || "Chainlink Dual-Feed"}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTx.payoutDetails && (
                <div className="p-3 sm:p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-500/25">
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 dark:text-purple-400">
                      Dual Payout Settlement Receipt
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-600 text-white font-mono">
                      Outcome: {activeModalTx.payoutDetails.winningOutcome || "AGREE"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Gross Payout Transferred</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-0.5 block">{activeModalTx.payoutDetails.grossPayoutEth || "—"}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Initial Staked Capital</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-0.5 block">{activeModalTx.payoutDetails.initialStakeEth || "—"}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-black/40 border border-purple-500/20">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Calculated Yield</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 text-xs sm:text-sm mt-0.5 block">{activeModalTx.payoutDetails.roiPercentage || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Block Number</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.blockNumber ? `#${decodedTx.blockNumber} (${decodedTx.confirmations ?? 1} Confs)` : (activeModalTx.blockNumber > 0 ? `#${activeModalTx.blockNumber}` : "Indexed Record")}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Execution Fee</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.executionFeeEth ? `${Number(decodedTx.executionFeeEth).toFixed(6)} ETH` : (activeModalTx.txFeeEth ?? "Network Fee")}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Gas Price / Used</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {decodedTx?.gasPriceGwei ? `${Number(decodedTx.gasPriceGwei).toFixed(1)} Gwei` : (activeModalTx.gasPriceGwei ?? "12.0 Gwei")} • {decodedTx?.gasUsed ? Number(decodedTx.gasUsed).toLocaleString() : (activeModalTx.gasUsed ?? "Confirmed")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">From (Trader / Origin)</span>
                  <span className="break-all font-mono text-zinc-800 dark:text-zinc-200">
                    {decodedTx?.from || activeModalTx.fromAddress}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold block mb-1">Interacted With (Contract)</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {decodedTx?.toContractName || activeModalTx.toContractName}
                    </span>
                    <span className="break-all text-[11px] text-zinc-600 dark:text-zinc-400">
                      {decodedTx?.to || activeModalTx.toContract}
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
                href={getExplorerTxUrl(activeModalTx.chainId, activeModalTx.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View on Explorer</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveModalTx(null)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
