"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
}

type TabCategory = "all" | "crypto" | "l2" | "macro";

interface MarketItem {
  id: string;
  category: string;
  categoryType: "crypto" | "l2" | "macro";
  iconSrc: string;
  title: string;
  endsIn: string;
  yesPct: number;
  noPct: number;
  yesMultiplier: string;
  noMultiplier: string;
  totalPool: string;
  yesPool: string;
  noPool: string;
  isFeatured?: boolean;
  isHot?: boolean;
}

const MARKETS: MarketItem[] = [
  {
    id: "eth-4500",
    category: "Featured • Crypto",
    categoryType: "crypto",
    iconSrc: "/icons/eth.webp",
    title: "Will Ethereum trade above $4,500 before the end of Q4 2026?",
    endsIn: "Ends in 14d 8h",
    yesPct: 68,
    noPct: 32,
    yesMultiplier: "1.47x Return",
    noMultiplier: "3.12x Return",
    totalPool: "48.20 ETH",
    yesPool: "32.78 ETH",
    noPool: "15.42 ETH",
    isFeatured: true,
    isHot: true,
  },
  {
    id: "btc-120k",
    category: "Spot • Crypto",
    categoryType: "crypto",
    iconSrc: "/icons/btc.webp",
    title: "Will Bitcoin reach a new all-time high of $120,000 in 2026?",
    endsIn: "Ends in 21d 6h",
    yesPct: 74,
    noPct: 26,
    yesMultiplier: "1.35x Return",
    noMultiplier: "3.84x Return",
    totalPool: "58.40 ETH",
    yesPool: "43.21 ETH",
    noPool: "15.19 ETH",
    isHot: true,
  },
  {
    id: "arb-dau",
    category: "Layer 2",
    categoryType: "l2",
    iconSrc: "/icons/arb.webp",
    title: "Will Arbitrum Daily Active Users exceed 1.5 Million in October?",
    endsIn: "Ends in 6d 12h",
    yesPct: 54,
    noPct: 46,
    yesMultiplier: "1.85x Return",
    noMultiplier: "2.17x Return",
    totalPool: "35.50 ETH",
    yesPool: "19.17 ETH",
    noPool: "16.33 ETH",
    isHot: true,
  },
  {
    id: "crypto-cap",
    category: "Macro",
    categoryType: "macro",
    iconSrc: "/icons/macro.webp",
    title: "Will total Crypto Market Cap surpass $3.5 Trillion this year?",
    endsIn: "Ends in 28d 4h",
    yesPct: 79,
    noPct: 21,
    yesMultiplier: "1.26x Return",
    noMultiplier: "4.76x Return",
    totalPool: "64.80 ETH",
    yesPool: "51.19 ETH",
    noPool: "13.61 ETH",
    isHot: true,
  },
  {
    id: "fed-rate",
    category: "Finance • Macro",
    categoryType: "macro",
    iconSrc: "/icons/macro.webp",
    title: "Will US Federal Reserve cut benchmark interest rates in next FOMC?",
    endsIn: "Ends in 11d 20h",
    yesPct: 85,
    noPct: 15,
    yesMultiplier: "1.17x Return",
    noMultiplier: "6.66x Return",
    totalPool: "31.90 ETH",
    yesPool: "27.11 ETH",
    noPool: "4.79 ETH",
    isHot: true,
  },
  {
    id: "sol-flip",
    category: "DeFi • Crypto",
    categoryType: "crypto",
    iconSrc: "/icons/eth.webp",
    title: "Will Solana flip Ethereum in 24h DEX trading volume this month?",
    endsIn: "Ends in 9d 14h",
    yesPct: 41,
    noPct: 59,
    yesMultiplier: "2.43x Return",
    noMultiplier: "1.69x Return",
    totalPool: "22.80 ETH",
    yesPool: "9.35 ETH",
    noPool: "13.45 ETH",
  },
  {
    id: "btc-dom",
    category: "Dominance • Crypto",
    categoryType: "crypto",
    iconSrc: "/icons/btc.webp",
    title: "Will Bitcoin market dominance surpass 60% before year end?",
    endsIn: "Ends in 35d 10h",
    yesPct: 65,
    noPct: 35,
    yesMultiplier: "1.53x Return",
    noMultiplier: "2.85x Return",
    totalPool: "31.20 ETH",
    yesPool: "20.28 ETH",
    noPool: "10.92 ETH",
  },
];

export default function TrendingMarketsTeaser({ theme: propTheme }: TrendingMarketsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const [activeTab, setActiveTab] = useState<TabCategory>("all");

  const filteredMarkets =
    activeTab === "all"
      ? MARKETS.filter((m) => m.isHot)
      : MARKETS.filter((m) => m.categoryType === activeTab);

  const counts = {
    all: MARKETS.filter((m) => m.isHot).length,
    crypto: MARKETS.filter((m) => m.categoryType === "crypto").length,
    l2: MARKETS.filter((m) => m.categoryType === "l2").length,
    macro: MARKETS.filter((m) => m.categoryType === "macro").length,
  };

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-yes-green animate-ping" />
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
              Live Binary Betting
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
            Trending Prediction Markets
          </h2>
        </div>
        <Link
          href="/predictions"
          className={`text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border ${
            isDark
              ? "bg-white/5 border-emerald-500/20 text-[#34D399] hover:bg-emerald-500/10 hover:border-emerald-400/40"
              : "bg-white border-emerald-500/20 text-[#0E7A4E] hover:bg-emerald-50 shadow-xs"
          }`}
        >
          <span>View All 24 Markets</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div
        className={`w-full rounded-2xl border overflow-hidden transition-colors duration-300 ${
          isDark
            ? "bg-[#070D09]/95 border-emerald-500/20 shadow-2xl"
            : "bg-white/95 border-emerald-500/15 light-card-shine shadow-[0_8px_32px_rgba(14,122,78,0.06),_inset_0_1px_0_#ffffff]"
        }`}
      >
        <div className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-6 pt-4 border-b overflow-x-auto ${isDark ? "border-emerald-500/15 bg-black/20" : "border-emerald-500/10 bg-emerald-50/30"}`}>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? isDark
                  ? "text-[#34D399] border-b-2 border-[#34D399]"
                  : "text-[#0E7A4E] border-b-2 border-[#0E7A4E]"
                : isDark
                ? "text-[#A9B3AD] hover:text-white"
                : "text-[#4B5D55] hover:text-[#0B1F16]"
            }`}
          >
            <Image src="/icons/hot.webp" alt="Hot Markets" width={16} height={16} priority className="w-4 h-4 object-contain" />
            <span>Hot Markets</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "all"
                ? isDark ? "bg-[#34D399]/20 text-[#34D399]" : "bg-emerald-200 text-[#0E7A4E]"
                : isDark ? "bg-white/10 text-[#A9B3AD]" : "bg-emerald-100 text-[#4B5D55]"
            }`}>
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crypto")}
            className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "crypto"
                ? isDark
                  ? "text-[#34D399] border-b-2 border-[#34D399]"
                  : "text-[#0E7A4E] border-b-2 border-[#0E7A4E]"
                : isDark
                ? "text-[#A9B3AD] hover:text-white"
                : "text-[#4B5D55] hover:text-[#0B1F16]"
            }`}
          >
            <Image src="/icons/btc.webp" alt="Crypto" width={16} height={16} priority className="w-4 h-4 object-contain" />
            <span>Crypto</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "crypto"
                ? isDark ? "bg-[#34D399]/20 text-[#34D399]" : "bg-emerald-200 text-[#0E7A4E]"
                : isDark ? "bg-white/10 text-[#A9B3AD]" : "bg-emerald-100 text-[#4B5D55]"
            }`}>
              {counts.crypto}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("l2")}
            className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "l2"
                ? isDark
                  ? "text-[#34D399] border-b-2 border-[#34D399]"
                  : "text-[#0E7A4E] border-b-2 border-[#0E7A4E]"
                : isDark
                ? "text-[#A9B3AD] hover:text-white"
                : "text-[#4B5D55] hover:text-[#0B1F16]"
            }`}
          >
            <Image src="/icons/arb.webp" alt="Layer 2" width={16} height={16} priority className="w-4 h-4 object-contain" />
            <span>Layer 2</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "l2"
                ? isDark ? "bg-[#34D399]/20 text-[#34D399]" : "bg-emerald-200 text-[#0E7A4E]"
                : isDark ? "bg-white/10 text-[#A9B3AD]" : "bg-emerald-100 text-[#4B5D55]"
            }`}>
              {counts.l2}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("macro")}
            className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold font-mono transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "macro"
                ? isDark
                  ? "text-[#34D399] border-b-2 border-[#34D399]"
                  : "text-[#0E7A4E] border-b-2 border-[#0E7A4E]"
                : isDark
                ? "text-[#A9B3AD] hover:text-white"
                : "text-[#4B5D55] hover:text-[#0B1F16]"
            }`}
          >
            <Image src="/icons/macro.webp" alt="Macro" width={16} height={16} priority className="w-4 h-4 object-contain" />
            <span>Macro</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "macro"
                ? isDark ? "bg-[#34D399]/20 text-[#34D399]" : "bg-emerald-200 text-[#0E7A4E]"
                : isDark ? "bg-white/10 text-[#A9B3AD]" : "bg-emerald-100 text-[#4B5D55]"
            }`}>
              {counts.macro}
            </span>
          </button>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11px] font-mono font-bold uppercase tracking-wider border-b border-emerald-500/10 text-[#A9B3AD]">
          <div className="col-span-5">Prediction Market</div>
          <div className="col-span-3">Live Probability & Odds</div>
          <div className="col-span-2">Pool Liquidity</div>
          <div className="col-span-2 text-right">Quick Bet</div>
        </div>

        <div className="h-[460px] overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div className="divide-y divide-emerald-500/10">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className={`p-4 sm:p-6 transition-colors duration-150 group ${
                  isDark ? "hover:bg-emerald-500/[0.04]" : "hover:bg-emerald-50/50"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
                          market.isFeatured
                            ? isDark
                              ? "bg-emerald-950/80 border-emerald-500/40 text-[#34D399]"
                              : "bg-emerald-100 border-emerald-300 text-[#0E7A4E]"
                            : isDark
                            ? "bg-white/5 border-white/10 text-[#A9B3AD]"
                            : "bg-emerald-50 border-emerald-500/20 text-[#4B5D55]"
                        }`}
                      >
                        <Image src={market.iconSrc} alt={market.category} width={14} height={14} priority className="w-3.5 h-3.5 object-contain" />
                        <span>{market.category}</span>
                      </span>
                      <span className="text-[11px] font-mono text-warning-amber flex items-center gap-1 font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {market.endsIn}
                      </span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug ${isDark ? "text-white group-hover:text-[#34D399]" : "text-[#0B1F16] group-hover:text-[#0E7A4E]"} transition-colors`}>
                      {market.title}
                    </h3>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                      <span className="text-yes-green">YES {market.yesPct}% {market.isFeatured ? `(${market.yesMultiplier})` : ""}</span>
                      <span className="text-no-red">NO {market.noPct}% {market.isFeatured ? `(${market.noMultiplier})` : ""}</span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full overflow-hidden flex ${isDark ? "bg-white/10" : "bg-emerald-950/10"}`}>
                      <div className="h-full bg-yes-green transition-[width] duration-300" style={{ width: `${market.yesPct}%` }} />
                      <div className="h-full bg-no-red transition-[width] duration-300" style={{ width: `${market.noPct}%` }} />
                    </div>
                    <div className={`flex items-center justify-between text-[11px] font-mono mt-1.5 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                      <span>Yes: {market.yesPool}</span>
                      <span>No: {market.noPool}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className={`text-sm sm:text-base font-black font-mono ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                      {market.totalPool}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-500 font-semibold">
                      Arbitrum Escrow
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href="/predictions"
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-yes-green/15 text-yes-green border border-yes-green/30 hover:bg-yes-green hover:text-slate-950 text-xs font-mono font-bold text-center transition-all active:scale-[0.98]"
                    >
                      Bet YES {market.isFeatured ? `(${market.yesPct}%)` : ""}
                    </Link>
                    <Link
                      href="/predictions"
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-no-red/15 text-no-red border border-no-red/30 hover:bg-no-red hover:text-white text-xs font-mono font-bold text-center transition-all active:scale-[0.98]"
                    >
                      Bet NO {market.isFeatured ? `(${market.noPct}%)` : ""}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMarkets.length <= 2 && (
            <div className={`m-4 p-5 rounded-xl border border-dashed text-center flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark
                ? "border-emerald-500/20 bg-emerald-950/20 text-[#A9B3AD]"
                : "border-emerald-500/25 bg-emerald-50/50 text-[#4B5D55]"
            }`}>
              <div className="flex items-center gap-2.5 text-xs font-mono text-left">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>More {activeTab === "l2" ? "Layer 2" : "Macro"} prediction markets are scheduled to deploy on Arbitrum Sepolia.</span>
              </div>
              <Link
                href="/predictions"
                className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                  isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-[#34D399] hover:bg-emerald-500/20"
                    : "bg-white border-emerald-300 text-[#0E7A4E] hover:bg-emerald-100 shadow-xs"
                }`}
              >
                Propose New Market +
              </Link>
            </div>
          )}
        </div>

        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${isDark ? "border-emerald-500/15 bg-black/20 text-[#A9B3AD]" : "border-emerald-500/10 bg-emerald-50/20 text-[#4B5D55]"}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yes-green" />
            <span>Showing {filteredMarkets.length} active {filteredMarkets.length === 1 ? "market" : "markets"} in this category. Real-time odds computed dynamically.</span>
          </div>
          <Link href="/predictions" className="text-yes-green font-bold hover:underline">
            Explore All 24 Markets →
          </Link>
        </div>
      </div>
    </section>
  );
}
