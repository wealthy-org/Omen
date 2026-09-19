"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

export type DiscoveryTab = "trending" | "newest" | "ending_soon" | "volume" | "confirmed";
export type MarketCategoryFilter = "all" | "eth" | "btc" | "arb" | "macro";

export interface DiscoveryFilterProps {
  activeTab: DiscoveryTab;
  onTabChange: (tab: DiscoveryTab) => void;
  activeCategory: MarketCategoryFilter;
  onCategoryChange: (category: MarketCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme?: "dark" | "light";
}

export const SORT_TABS: { id: DiscoveryTab; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "ending_soon", label: "Ending Soon" },
  { id: "volume", label: "Most Volume" },
  { id: "confirmed", label: "Confirmed" },
];

export const CATEGORY_FILTERS: { id: MarketCategoryFilter; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "/icons/hot.webp" },
  { id: "eth", label: "ETH", icon: "/icons/eth.webp" },
  { id: "btc", label: "BTC", icon: "/icons/btc.webp" },
  { id: "arb", label: "ARB", icon: "/icons/arb.webp" },
  { id: "macro", label: "Macro", icon: "/icons/macro.webp" },
];

export const DiscoveryFilter: React.FC<DiscoveryFilterProps> = ({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  theme: propTheme,
}) => {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === tab.id
                  ? isDark
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-md"
                    : "bg-[#10221A] text-white border-[#10221A] shadow-md"
                  : isDark
                    ? "bg-[#0A0F0C] border-white/10 text-[#A9B3AD] hover:text-white hover:border-white/20"
                    : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-xs"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px] sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search markets by statement, creator, or topic..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 border ${
              isDark
                ? "bg-[#0A0F0C] border-white/10 text-white placeholder-zinc-500"
                : "bg-white border-zinc-200 text-[#0B1F16] placeholder-zinc-400 shadow-xs"
            }`}
            aria-label="Search markets by statement, creator, or topic..."
          />
          <svg
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
              activeCategory === cat.id
                ? isDark
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-emerald-50 text-[#0E7A4E] border-emerald-500/25"
                : isDark
                  ? "bg-white/5 border-transparent text-[#A9B3AD] hover:text-white hover:bg-white/10"
                  : "bg-zinc-100/80 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
            }`}
          >
            <Image
              src={cat.icon}
              alt={`${cat.label} icon`}
              width={16}
              height={16}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0"
            />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryFilter;
