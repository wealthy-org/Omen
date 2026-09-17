"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { MarketDetailPanels, MarketDetailData } from "@/components/MarketDetailPanels";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

function MarketDetailContent({ params }: PageProps) {
  const [marketId, setMarketId] = useState<string>("");
  const [market, setMarket] = useState<MarketDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve(params).then((resolvedParams) => {
      if (isMounted) {
        setMarketId(resolvedParams.id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!marketId) return;

    let isMounted = true;

    async function fetchMarket() {
      try {
        const res = await fetch(`/api/markets/${marketId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.market) {
            setMarket(data.market);
            setLoading(false);
            return;
          }
        }
      } catch {
      }

      if (isMounted) {
        setMarket({
          id: marketId,
          statement: "Ethereum will cross $4,500 before Q4 2026",
          authorHandle: "vitalik",
          creatorAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          sourceUrl: "https://x.com/vitalik/status/1880000000000",
          sourcePlatform: "Twitter / X",
          createdAt: "2026-03-01T10:00:00Z",
          closesAt: "2026-09-30T23:59:59Z",
          isConfirmed: false,
          status: "OPEN",
          agreePoolEth: 28.5,
          disagreePoolEth: 14.2,
          totalVolumeEth: 42.7,
          socialConsensusPct: 78,
          marketAddress: "0x3333333333333333333333333333333333333333",
          chainId: 11155111,
          oracleFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
          targetPrice: 4500,
          resolutionType: "PRICE_ABOVE",
        });
        setLoading(false);
      }
    }

    fetchMarket();

    return () => {
      isMounted = false;
    };
  }, [marketId]);

  if (loading || !market) {
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

export default function MarketDetailPage(props: PageProps) {
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
