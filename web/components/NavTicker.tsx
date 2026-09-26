"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPublicClient, http, formatGwei } from "viem";
import { sepolia } from "viem/chains";
import { useChainId } from "wagmi";
import { robinhoodTestnet } from "@/lib/wagmi";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";

const POLL_INTERVAL_MS = 12_000;
const TICKER_MARKET_LIMIT = 12;

type TickerMarket = {
  id: string;
  title: string;
  yesPct: number;
};

type ChainStats = {
  blockNumber: bigint;
  gasGwei: string;
};

function useChainStats(chainId: number) {
  const [stats, setStats] = useState<ChainStats | null>(null);

  useEffect(() => {
    const chain = chainId === ROBINHOOD_TESTNET_CHAIN_ID ? robinhoodTestnet : sepolia;
    const client = createPublicClient({ chain, transport: http() });
    let cancelled = false;

    const load = async () => {
      try {
        const [blockNumber, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);
        if (!cancelled) {
          setStats({ blockNumber, gasGwei: Number(formatGwei(gasPrice)).toFixed(gasPrice < 10n ** 9n ? 3 : 1) });
        }
      } catch {
        if (!cancelled) setStats(null);
      }
    };

    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [chainId]);

  return stats;
}

function useTickerMarkets() {
  const [markets, setMarkets] = useState<TickerMarket[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/markets?status=open&limit=${TICKER_MARKET_LIMIT}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.markets) return;
        setMarkets(
          data.markets
            .filter((m: { title?: string | null }) => m.title)
            .map((m: { id: string; title: string; total_pool?: number; capital_consensus?: number }) => ({
              id: m.id,
              title: m.title,
              yesPct: Number(m.total_pool) > 0 ? Number(m.capital_consensus ?? 50) : 50,
            }))
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return markets;
}

export default function NavTicker() {
  const chainId = useChainId();
  const stats = useChainStats(chainId);
  const markets = useTickerMarkets();
  const chainName = chainId === ROBINHOOD_TESTNET_CHAIN_ID ? "Robinhood Chain" : "Ethereum Sepolia";
  const loop = markets.length > 0 ? [...markets, ...markets] : [];

  return (
    <div className="border-t border-emerald-500/10 dark:border-white/10 bg-white/70 dark:bg-[#0A0F0C]/80">
      <div className="max-w-[1400px] mx-auto h-9 px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-[12px]">
        <div className="flex items-center gap-2 shrink-0 font-mono" data-testid="chain-status">
          <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.757-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="font-sans font-semibold text-[#0B1F16] dark:text-white">{chainName}</span>
          <span className={`inline-flex items-center gap-1 ${stats ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stats ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {stats ? "live" : "connecting"}
          </span>
          {stats && (
            <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
              block <span className="text-[#17241D] dark:text-zinc-200">#{stats.blockNumber.toLocaleString("en-US")}</span>
              <span className="ml-3">gas {stats.gasGwei} gwei</span>
            </span>
          )}
        </div>

        {loop.length > 0 && (
          <div className="relative flex-1 overflow-hidden border-l border-emerald-500/10 dark:border-white/10 pl-4 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
            <div className="animate-marquee flex items-center gap-8 w-max">
              {loop.map((m, idx) => (
                <Link
                  key={`${m.id}-${idx}`}
                  href={`/market/${m.id}`}
                  className="flex items-center gap-2 whitespace-nowrap hover:underline"
                >
                  <span className="max-w-[220px] truncate text-[#17241D] dark:text-zinc-300">{m.title}</span>
                  <span className="font-mono font-bold text-[#0B1F16] dark:text-white">{m.yesPct.toFixed(1)}%</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">YES</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
