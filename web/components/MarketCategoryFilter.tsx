"use client";

import React from "react";
import { Globe, Flame, Zap, Sparkles, Clock, CheckCircle2 } from "lucide-react";

import { CategoryItem, MarketCategoryFilterProps } from "@/types";

export type { CategoryItem, MarketCategoryFilterProps };

export const MARKET_CATEGORIES: CategoryItem[] = [
  { id: "all", label: "All Markets", icon: <Globe className="w-4 h-4" /> },
  { id: "trending", label: "Trending", icon: <Flame className="w-4 h-4" /> },
  { id: "crypto", label: "Crypto Narratives", icon: <Zap className="w-4 h-4" /> },
  { id: "meme", label: "Meme Tokens", icon: <Sparkles className="w-4 h-4" /> },
  { id: "closing-soon", label: "Closing Soon", icon: <Clock className="w-4 h-4" /> },
  { id: "resolved", label: "Resolved", icon: <CheckCircle2 className="w-4 h-4" /> },
];

export const MARKET_SORT_OPTIONS = [
  { id: "highest-pool", label: "Highest Pool" },
  { id: "ending-soon", label: "Ending Soonest" },
  { id: "newest", label: "Newest" },
];

export const MarketCategoryFilter: React.FC<MarketCategoryFilterProps> = ({
  selectedCategory = "all",
  onSelectCategory = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  sortBy = "highest-pool",
  onSortChange = () => {},
  marketCounts = {},
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="market-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prediction markets..."
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            aria-label="Search prediction markets"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <label
            htmlFor="market-sort-select"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
          >
            Sort by:
          </label>
          <div className="relative">
            <select
              id="market-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium py-2.5 pl-3.5 pr-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer transition-all shadow-xs"
              aria-label="Sort prediction markets"
            >
              {MARKET_SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
        {MARKET_CATEGORIES.map((cat) => {
          const isActive =
            selectedCategory === cat.id ||
            selectedCategory.toLowerCase() === cat.label.toLowerCase();
          const count = marketCounts ? marketCounts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 font-semibold shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-medium"
              }`}
              aria-pressed={isActive}
            >
              {cat.icon && <span className="inline-flex items-center shrink-0">{cat.icon}</span>}
              <span>{cat.label}</span>
              {typeof count === "number" && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950 font-bold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
