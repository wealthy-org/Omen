"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketDetailPanels, MarketDetailData } from "@/components/MarketDetailPanels";

function mapToMarketDetailData(raw: Record<string, unknown>, idFallback: string): MarketDetailData {
  const agreePool = typeof raw.agreePoolEth === "number"
    ? raw.agreePoolEth
    : Number(raw.agree_pool ?? 0);
  const disagreePool = typeof raw.disagreePoolEth === "number"
    ? raw.disagreePoolEth
    : Number(raw.disagree_pool ?? 0);
  const totalVolume = typeof raw.totalVolumeEth === "number"
    ? raw.totalVolumeEth
    : (agreePool + disagreePool);

  return {
    id: typeof raw.id === "string" ? raw.id : idFallback,
    statement: typeof raw.statement === "string" ? raw.statement : "",
    authorHandle: typeof raw.authorHandle === "string" ? raw.authorHandle : (typeof raw.author === "string" ? raw.author : null),
    creatorAddress: typeof raw.creatorAddress === "string" ? raw.creatorAddress : (typeof raw.creator_wallet === "string" ? raw.creator_wallet : null),
    sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : (typeof raw.source_url === "string" ? raw.source_url : null),
    sourcePlatform: typeof raw.sourcePlatform === "string" ? raw.sourcePlatform : (typeof raw.source_platform === "string" ? raw.source_platform : null),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : (typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString()),
    closesAt: typeof raw.closesAt === "string" ? raw.closesAt : (typeof raw.close_time === "string" ? raw.close_time : new Date().toISOString()),
    isConfirmed: Boolean(raw.isConfirmed),
    status: (raw.status as "OPEN" | "CLOSED" | "RESOLVED" | "SETTLED") ?? "OPEN",
    winningSide: raw.winningSide ? (raw.winningSide as "AGREE" | "DISAGREE") : null,
    agreePoolEth: agreePool,
    disagreePoolEth: disagreePool,
    totalVolumeEth: totalVolume,
    socialConsensusPct: typeof raw.socialConsensusPct === "number" ? raw.socialConsensusPct : 50,
    marketAddress: typeof raw.marketAddress === "string" ? raw.marketAddress : (typeof raw.contract_address === "string" ? raw.contract_address : null),
    chainId: typeof raw.chainId === "number" ? raw.chainId : 11155111,
    oracleFeed: typeof raw.oracleFeed === "string" ? raw.oracleFeed : (typeof raw.resolution_source === "string" ? raw.resolution_source : null),
    targetPrice: typeof raw.targetPrice === "number" ? raw.targetPrice : null,
    resolutionType: typeof raw.resolutionType === "string" ? raw.resolutionType : null,
  };
}

export interface MarketDetailPageProps {
  params?: Promise<{ id: string }> | { id: string };
}

function MarketDetailContent({ params }: MarketDetailPageProps) {
  const routerParams = useParams();
  const resolvedParams = params && typeof (params as { then?: unknown }).then === "function"
    ? React.use(params as Promise<{ id: string }>)
    : (params as { id: string } | undefined);
  const marketId = resolvedParams?.id ?? (typeof routerParams?.id === "string" ? routerParams.id : "");
  const [market, setMarket] = useState<MarketDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarket() {
      if (!marketId) {
        if (isMounted) {
          setError("No market ID provided");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/markets/${marketId}`);
        const data = await res.json().catch(() => null);

        if (!isMounted) return;

        if (res.ok && (data?.market || data?.id)) {
          const rawMarket = (data.market ?? data) as Record<string, unknown>;
          setMarket(mapToMarketDetailData(rawMarket, marketId));
          setError(null);
          setLoading(false);
        } else {
          const errMsg = data?.error ?? `Market "${marketId}" could not be loaded (${res.status})`;
          setError(errMsg);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Network error loading market";
        setError(msg);
        setLoading(false);
      }
    }

    fetchMarket();

    return () => {
      isMounted = false;
    };
  }, [marketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-64 bg-zinc-900 rounded-2xl" />
              <div className="h-32 bg-zinc-900 rounded-2xl" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-80 bg-zinc-900 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Market Not Found</h2>
            <p className="text-sm text-zinc-400 font-mono break-all leading-relaxed">
              {error ?? `Market "${marketId}" does not exist in the protocol database.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/markets"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 text-center"
            >
              Explore All Markets
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-zinc-400 animate-slide-right">
          <Link href="/markets" className="hover:text-emerald-400 transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-mono">{market.id}</span>
        </div>

        <MarketDetailPanels market={market} />
      </div>
    </div>
  );
}

export default function MarketDetailPage(props: MarketDetailPageProps = {}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-zinc-500 font-mono text-sm">Loading market details...</div>
        </div>
      }
    >
      <MarketDetailContent {...props} />
    </Suspense>
  );
}
