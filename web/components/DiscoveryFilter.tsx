"use client";

import React from "react";

import { DiscoveryTab, MarketCategoryFilter, DiscoveryFilterProps } from "@/types";

export type { DiscoveryTab, MarketCategoryFilter, DiscoveryFilterProps };

export const SORT_TABS: { id: DiscoveryTab; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "newest", label: "Newest" },
  { id: "ending_soon", label: "Ending Soon" },
  { id: "volume", label: "Most Volume" },
  { id: "confirmed", label: "Confirmed" },
];

export const CATEGORY_FILTERS: { id: MarketCategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "eth", label: "ETH" },
  { id: "btc", label: "BTC" },
  { id: "arb", label: "ARB" },
  { id: "macro", label: "Macro" },
];

export const DiscoveryFilter: React.FC<DiscoveryFilterProps> = ({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) => {
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
                  ? "bg-[#10221A] text-white border-[#10221A] shadow-md dark:bg-emerald-500 dark:text-black dark:border-emerald-400"
                  : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-xs dark:bg-[#0A0F0C] dark:border-white/10 dark:text-[#A9B3AD] dark:hover:text-white dark:hover:border-white/20"
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 border bg-white border-zinc-200 text-[#0B1F16] placeholder-zinc-400 shadow-xs dark:bg-[#0A0F0C] dark:border-white/10 dark:text-white dark:placeholder-zinc-500"
            aria-label="Search markets by statement, creator, or topic..."
          />
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
              activeCategory === cat.id
                ? "bg-emerald-50 text-[#0E7A4E] border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                : "bg-zinc-100/80 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 dark:bg-white/5 dark:text-[#A9B3AD] dark:hover:text-white dark:hover:bg-white/10"
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryFilter;
