"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useBalance, useChainId, useConnection, useSwitchChain } from "wagmi";
import { PositionPanel } from "./PositionPanel";
import { CreatorConfirmation } from "./CreatorConfirmation";
import ProbabilityChart from "./ProbabilityChart";
import ActorAvatar from "./ActorAvatar";
import { useClaim } from "@/hooks/useClaim";
import { usePosition } from "@/hooks/usePosition";

import { MarketDetailData, MarketDetailPanelsProps, MarketDetailPosition } from "@/types";
import { getExplorerBaseUrl } from "@/lib/contracts";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";
import { formatUserErrorMessage } from "@/lib/format-error";

export type { MarketDetailData, MarketDetailPanelsProps };

type Tab = "prediction" | "activity" | "rules";

const PLATFORM_LABELS: Record<string, string> = {
  farcaster: "Farcaster",
  x: "X",
  twitter: "X",
  manual: "manual submission",
};

function shortAddress(addr: string) {
  return addr.length >= 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function closesIn(iso?: string): string {
  if (!iso) return "Not set";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

function relativeTime(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

function useWalletBalance(address?: string): string | undefined {
  try {
    const { data } = useBalance({ address: address as `0x${string}` | undefined });
    return data ? Number(formatEther(data.value)).toFixed(4) : undefined;
  } catch {
    return undefined;
  }
}

function useChainSwitcher() {
  try {
    return useSwitchChain();
  } catch {
    return null;
  }
}

function OutcomeTile({ side, pct, multiplier }: { side: "AGREE" | "DISAGREE"; pct: number; multiplier: string }) {
  const isAgree = side === "AGREE";
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${
        isAgree
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-rose-500/30 bg-rose-500/5"
      }`}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{side}</span>
      <span className="flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-black ${isAgree ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {pct}%
        </span>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{multiplier}</span>
      </span>
    </div>
  );
}

export function MarketDetailPanels({ market, onPositionUpdated }: MarketDetailPanelsProps) {
  const [activeMarket, setActiveMarket] = useState(market);
  const [tab, setTab] = useState<Tab>("prediction");
  const [copied, setCopied] = useState(false);
  const { claim, isPending: isClaiming, isSuccess: isClaimSuccess, error: claimError } = useClaim();
  const { placePosition } = usePosition();
  const { address } = useConnection();
  const walletChainId = useChainId();
  const switcher = useChainSwitcher();
  const walletBalance = useWalletBalance(address);

  const positions: MarketDetailPosition[] = activeMarket.positions ?? [];
  const agreePool = activeMarket.agreePoolEth ?? 0;
  const disagreePool = activeMarket.disagreePoolEth ?? 0;
  const totalPool = agreePool + disagreePool;
  const agreePct = totalPool > 0 ? Math.round((agreePool / totalPool) * 100) : 50;
  const disagreePct = 100 - agreePct;
  const agreeMultiplier = agreePool > 0 ? `${(totalPool / agreePool).toFixed(2)}×` : "no stakes";
  const disagreeMultiplier = disagreePool > 0 ? `${(totalPool / disagreePool).toFixed(2)}×` : "no stakes";
  const traders = new Set(positions.map((p) => p.wallet_address)).size;

  const explorerBase = getExplorerBaseUrl(activeMarket.chainId);
  const chainName = activeMarket.chainId === ROBINHOOD_TESTNET_CHAIN_ID ? "Robinhood Chain" : "Ethereum Sepolia";
  const isOpen = activeMarket.status === "OPEN" || activeMarket.status === "active";
  const isResolved = activeMarket.status === "RESOLVED" || activeMarket.status === "SETTLED";
  const onWrongChain = Boolean(address) && walletChainId !== activeMarket.chainId;

  const cleanHandle = (activeMarket.authorHandle || "creator").replace(/^@/, "");
  const platformLabel = PLATFORM_LABELS[activeMarket.sourcePlatform ?? ""] ?? activeMarket.sourcePlatform ?? "social";
  const category = activeMarket.category || "market";
  const isManual = activeMarket.resolutionType === "MANUAL";

  const handleConfirmPosition = async ({ side, amount }: { side: "AGREE" | "DISAGREE"; amount: string }) => {
    if (!activeMarket.marketAddress) throw new Error("Market contract address is missing");
    const amountNum = Number(amount);
    await placePosition({ marketAddress: activeMarket.marketAddress, marketId: activeMarket.id, side, amount });
    setActiveMarket((prev) => ({
      ...prev,
      agreePoolEth: (prev.agreePoolEth ?? 0) + (side === "AGREE" ? amountNum : 0),
      disagreePoolEth: (prev.disagreePoolEth ?? 0) + (side === "DISAGREE" ? amountNum : 0),
      positions: [
        ...(prev.positions ?? []),
        {
          id: `local-${Date.now()}`,
          side,
          amount: amountNum,
          wallet_address: address?.toLowerCase() ?? "",
          tx_hash: "",
          created_at: new Date().toISOString(),
        },
      ],
    }));
    onPositionUpdated?.();
  };

  const handleClaim = async () => {
    try {
      if (!activeMarket.marketAddress) throw new Error("Market contract address is missing");
      await claim(activeMarket.marketAddress);
    } catch {
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/markets" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          Markets
        </Link>
        <span aria-hidden="true">›</span>
        <span className="capitalize text-zinc-700 dark:text-zinc-200">{category}</span>
      </nav>

      <header className="flex gap-4">
        <Link
          href={activeMarket.creatorAddress ? `/creator/${activeMarket.creatorAddress}` : `/creator/${encodeURIComponent(activeMarket.authorHandle ?? cleanHandle)}`}
          className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
            {cleanHandle.slice(0, 1).toUpperCase()}
          </div>
          <img
            src={`/api/avatar/${encodeURIComponent(cleanHandle)}`}
            alt={cleanHandle}
            className="relative w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">@{cleanHandle}</span>
            <span className="text-zinc-400">·</span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold uppercase tracking-wider ${
                isOpen
                  ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  : isResolved
                    ? "border-purple-500/40 text-purple-600 dark:text-purple-400"
                    : "border-zinc-400/40 text-zinc-500"
              }`}
            >
              {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              {isOpen ? "Active" : activeMarket.status}
            </span>
            {activeMarket.isConfirmed && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">✓ Creator confirmed</span>
            )}
          </div>
          <h1 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white">
            {activeMarket.statement}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {activeMarket.marketAddress && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified onchain
              </span>
            )}
            <span className="text-zinc-500 dark:text-zinc-400">{chainName}</span>
            {activeMarket.marketAddress && (
              <a
                href={`${explorerBase}/address/${activeMarket.marketAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-white/10 font-mono text-zinc-600 dark:text-zinc-300 hover:border-emerald-500/40 transition-colors"
              >
                market {shortAddress(activeMarket.marketAddress)} ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 py-4 border-y border-zinc-200 dark:border-white/10">
        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          {[
            ["Pool", `${totalPool.toFixed(4)} ETH`],
            ["Traders", traders.toLocaleString("en-US")],
            ["Closes", closesIn(activeMarket.closesAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</dt>
              <dd className="font-mono text-sm font-bold text-zinc-900 dark:text-white mt-1" suppressHydrationWarning>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={handleShare}
          className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/40 transition-colors"
        >
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <ProbabilityChart positions={positions} openedAt={activeMarket.createdAt} />

          <div className="grid grid-cols-2 gap-3">
            <OutcomeTile side="AGREE" pct={agreePct} multiplier={agreeMultiplier} />
            <OutcomeTile side="DISAGREE" pct={disagreePct} multiplier={disagreeMultiplier} />
          </div>

          <div>
            <div role="tablist" aria-label="Market details" className="flex gap-1 border-b border-zinc-200 dark:border-white/10">
              {(["prediction", "activity", "rules"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 -mb-px border-b-2 font-mono text-[12px] font-bold uppercase tracking-widest transition-colors ${
                    tab === t
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {tab === t && <span aria-hidden="true">▸ </span>}
                  {t}
                  {t === "activity" && positions.length > 0 && ` (${positions.length})`}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="pt-5">
              {tab === "prediction" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 p-5">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Prediction source</div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      Prediction by <span className="font-semibold text-zinc-900 dark:text-white">@{cleanHandle}</span> on {platformLabel}
                    </p>
                    {activeMarket.sourceText ? (
                      <blockquote className="mt-3 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100 whitespace-pre-line">
                        &ldquo;{activeMarket.sourceText}&rdquo;
                      </blockquote>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-500">The original post text was not captured for this market.</p>
                    )}
                    {activeMarket.sourceUrl && (
                      <a
                        href={activeMarket.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        View original on {platformLabel} ↗
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This market prices whether the prediction above comes true. The percentage is the share of the pool backing AGREE, and it settles onchain at the deadline
                    {isManual ? " after an admin checks the outcome against the rule in the Rules tab." : " against a Chainlink price."}
                  </p>
                  <CreatorConfirmation
                    beliefId={activeMarket.id}
                    statement={activeMarket.statement || activeMarket.title}
                    authorHandle={activeMarket.authorHandle ?? undefined}
                    creatorAddress={activeMarket.creatorAddress ?? undefined}
                    isConfirmed={activeMarket.isConfirmed}
                    marketAddress={activeMarket.marketAddress ?? undefined}
                    onConfirmed={() => setActiveMarket((prev) => ({ ...prev, isConfirmed: true }))}
                  />
                </div>
              )}

              {tab === "activity" && (
                positions.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6 text-center">No positions yet. Be the first to take a side.</p>
                ) : (
                  <ul className="divide-y divide-zinc-200 dark:divide-white/10">
                    {[...positions].reverse().map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                              p.side === "AGREE" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {p.side}
                          </span>
                          <ActorAvatar address={p.wallet_address} size={24} />
                          <span className="font-mono text-zinc-700 dark:text-zinc-200 truncate">{shortAddress(p.wallet_address)}</span>
                        </span>
                        <span className="flex items-center gap-4 shrink-0 font-mono">
                          <span className="font-bold text-zinc-900 dark:text-white">{p.amount.toFixed(4)} ETH</span>
                          {p.tx_hash ? (
                            <a
                              href={`${explorerBase}/tx/${p.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                              suppressHydrationWarning
                            >
                              {relativeTime(p.created_at)} ↗
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-500">just now</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {tab === "rules" && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    ...(isManual
                      ? [
                          ["Resolution type", "Admin review"],
                          ["Resolves YES when", activeMarket.resolutionCriteria ?? "Stated in the original call"],
                        ]
                      : [
                          ["Resolution type", activeMarket.resolutionType ?? "Price feed"],
                          ["Price target", activeMarket.targetPrice != null ? `$${activeMarket.targetPrice.toLocaleString("en-US")}` : "Not set"],
                        ]),
                    ["Resolves", activeMarket.closesAt ? new Date(activeMarket.closesAt).toUTCString() : "Not set"],
                    ["Oracle", isManual ? "Admin, with evidence recorded at settlement" : activeMarket.oracleFeed ?? "Chainlink price feed"],
                    ["Network", chainName],
                    ["Payout", "Winners split the whole pool pro-rata, minus the protocol fee"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-zinc-200 dark:border-white/10 p-3.5">
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</dt>
                      <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100 break-words" suppressHydrationWarning>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
          {isResolved ? (
            <div className="rounded-2xl border border-purple-500/30 bg-white dark:bg-black/30 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-300">Market settled</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Winner: {activeMarket.winningSide ?? "pending"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming || isClaimSuccess}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isClaiming ? "Claiming payout..." : isClaimSuccess ? "Payout claimed" : "Claim payout"}
              </button>
              {claimError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {formatUserErrorMessage(claimError, "Failed to claim payout. Please try again.")}
                </p>
              )}
            </div>
          ) : isOpen ? (
            <>
              {onWrongChain && (
                <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
                  <span>This market lives on {chainName}. Switch your wallet network to trade.</span>
                  {switcher?.switchChain && (
                    <button
                      type="button"
                      onClick={() => switcher.switchChain({ chainId: activeMarket.chainId as never })}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-amber-500 text-black font-bold"
                    >
                      Switch
                    </button>
                  )}
                </div>
              )}
              <PositionPanel
                marketId={activeMarket.id}
                marketAddress={activeMarket.marketAddress ?? undefined}
                agreePool={agreePool}
                disagreePool={disagreePool}
                userBalance={walletBalance ?? "0"}
                onConfirmPosition={handleConfirmPosition}
              />
              {!address && (
                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">Connect your wallet to take a position.</p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 p-5 text-sm text-zinc-500 dark:text-zinc-400">
              Trading is closed for this market.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default MarketDetailPanels;
