"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { BeliefPipelineItem } from "@/types";

export type { BeliefPipelineItem };

const MOCK_PIPELINE_ITEMS: BeliefPipelineItem[] = [
  {
    id: "belief-v1-001",
    statement: "ETH will outperform SOL in Q4 2026",
    author: "0x71c...99a1",
    author_handle: "@vitalik_fan",
    status: "OPEN",
    ai_confidence: 94,
    agree_pool: 12500,
    disagree_pool: 7500,
    total_pool: 20000,
    consensus_percentage: 62.5,
    has_eip712_signature: true,
    created_at: "2026-09-18T05:00:00.000Z",
  },
  {
    id: "belief-v1-002",
    statement: "Bitcoin price will breach $100k prior to year-end options expiry",
    author: "0x892...11b2",
    author_handle: "@satoshi_macro",
    status: "CONFIRMED",
    ai_confidence: 88,
    agree_pool: 35000,
    disagree_pool: 15000,
    total_pool: 50000,
    consensus_percentage: 70.0,
    has_eip712_signature: true,
    created_at: "2026-09-18T02:00:00.000Z",
  },
  {
    id: "belief-v1-003",
    statement: "Arbitrum TVL will surpass $15B following Nitro upgrade",
    author: "0x44a...66e8",
    author_handle: "@l2_analyst",
    status: "DETECTED",
    ai_confidence: 82,
    agree_pool: 0,
    disagree_pool: 0,
    total_pool: 0,
    consensus_percentage: 50.0,
    has_eip712_signature: false,
    created_at: "2026-09-17T23:00:00.000Z",
  },
  {
    id: "belief-v1-004",
    statement: "Federal Reserve will reduce interest rate by 50bps in next FOMC",
    author: "0x123...4567",
    author_handle: "@macro_alpha",
    status: "RESOLVED",
    ai_confidence: 91,
    agree_pool: 18000,
    disagree_pool: 22000,
    total_pool: 40000,
    consensus_percentage: 45.0,
    has_eip712_signature: true,
    created_at: "2026-09-17T07:00:00.000Z",
  },
];

function mapBeliefToPipelineItem(b: any): BeliefPipelineItem {
  const market = b.markets?.[0];
  const agree = Number(b.agree_pool ?? market?.agree_pool ?? 0);
  const disagree = Number(b.disagree_pool ?? market?.disagree_pool ?? 0);
  const total = agree + disagree;
  const consensus = total > 0 ? Math.round((agree / total) * 100) : 50;
  const rawConfidence = Number(b.ai_confidence ?? 0);
  const aiConfidence =
    rawConfidence > 0 && rawConfidence <= 1
      ? Math.round(rawConfidence * 100)
      : Math.round(rawConfidence);

  const authorHandle = b.author_handle
    ? b.author_handle
    : b.author?.startsWith("@")
    ? b.author
    : b.author
    ? `@${b.author}`
    : "@anonymous";

  return {
    id: b.id,
    statement: b.statement,
    author: b.author || "Anonymous",
    author_handle: authorHandle,
    status: b.status || "OPEN",
    ai_confidence: aiConfidence,
    agree_pool: agree,
    disagree_pool: disagree,
    total_pool: total,
    consensus_percentage: consensus,
    has_eip712_signature: Boolean(
      b.has_eip712_signature ??
        b.creator_confirmed ??
        (b.status === "CONFIRMED" ||
          b.status === "RESOLVED" ||
          b.status === "SETTLED" ||
          (b.markets && b.markets.length > 0))
    ),
    created_at: b.created_at || new Date().toISOString(),
  };
}

export default function AdminBeliefPipelineTable({
  initialItems = MOCK_PIPELINE_ITEMS,
}: {
  initialItems?: BeliefPipelineItem[];
} = {}) {
  const [items, setItems] = useState<BeliefPipelineItem[]>(initialItems);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchBeliefs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/beliefs?limit=50");
      if (res.ok) {
        const json = await res.json();
        if (json.beliefs && Array.isArray(json.beliefs) && json.beliefs.length > 0) {
          setItems(json.beliefs.map(mapBeliefToPipelineItem));
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadPipeline() {
      try {
        const res = await fetch("/api/beliefs?limit=50");
        if (!ignore && res.ok) {
          const json = await res.json();
          if (json.beliefs && Array.isArray(json.beliefs) && json.beliefs.length > 0) {
            setItems(json.beliefs.map(mapBeliefToPipelineItem));
          }
        }
      } catch {
      }
    }
    loadPipeline();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesStatus =
      filterStatus === "ALL" ||
      item.status?.toUpperCase() === filterStatus.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      item.statement.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      (item.author_handle && item.author_handle.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return "bg-white/10 text-text-muted border-white/20";
    }
    const upper = status.toUpperCase();
    switch (upper) {
      case "OPEN":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "CONFIRMED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "DETECTED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "RESOLVED":
      case "SETTLED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CLOSED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-white/10 text-text-muted border-white/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Social Belief Pipeline
            </span>
            <span className="text-xs text-text-muted dark:text-[#A9B3AD] font-mono">
              {filteredItems.length} Total Monitored
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-accent-navy dark:text-white">
            Belief Markets Lifecycle Monitor
          </h2>
          <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
            Track social predictions from AI detection, EIP-712 creator verification, to open capital consensus & settlement.
          </p>
        </div>

        <button
          type="button"
          aria-label="Sync Pipeline"
          onClick={fetchBeliefs}
          className="px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 border bg-white hover:bg-emerald-50/50 dark:bg-white/5 dark:hover:bg-white/10 border-emerald-500/20 dark:border-white/10 text-accent-navy dark:text-white shadow-xs dark:shadow-none"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isLoading ? "Syncing..." : "Sync Pipeline"}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            aria-label="Filter Beliefs Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search belief statement, author address, or handle..."
            className="w-full px-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-[#0A0F0C] border-emerald-500/20 dark:border-white/10 text-accent-navy dark:text-white placeholder:text-text-muted dark:placeholder:text-[#A9B3AD]/60 shadow-xs dark:shadow-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["ALL", "OPEN", "CONFIRMED", "DETECTED", "RESOLVED"].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setFilterStatus(stage)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                filterStatus === stage
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-white/5 border-border-subtle dark:border-white/10 text-accent-navy dark:text-text-muted hover:bg-emerald-50/50 dark:hover:text-white"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white dark:bg-[#0A0F0C] border-emerald-500/15 dark:border-white/10 shadow-xs dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD] bg-black/5 dark:bg-white/5">
                <th className="py-3 px-4">Statement & Author</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Consensus / Pool</th>
                <th className="py-3 px-4">EIP-712 Auth</th>
                <th className="py-3 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted dark:text-[#A9B3AD]">
                    No belief pipeline records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-accent-navy dark:text-white text-xs line-clamp-2">
                        {item.statement}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          href={`/creator/${item.author}`}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {item.author_handle || `${item.author.slice(0, 8)}...`}
                        </Link>
                        <span className="text-[10px] text-text-muted opacity-60">
                          {item.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-accent-navy dark:text-white">
                        <span>{item.ai_confidence || 85}%</span>
                        <span className="text-[10px] text-text-muted">score</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.consensus_percentage}% Agree
                      </div>
                      <div className="text-[10px] text-text-muted dark:text-[#A9B3AD] mt-0.5">
                        ${(item.total_pool || 0).toLocaleString()} Total Pool
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.has_eip712_signature ? (
                        <span className="inline-flex items-center gap-1 text-yes-green text-[11px] font-bold">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="text-text-muted dark:text-[#A9B3AD] text-[11px]">
                          Unsigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-text-muted dark:text-[#A9B3AD]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
