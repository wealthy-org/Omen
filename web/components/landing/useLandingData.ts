"use client";

import { useEffect, useState } from "react";

export type LandingMarket = {
  id: string;
  title: string;
  chainId: number;
  contractAddress: string | null;
  agreePool: number;
  disagreePool: number;
  totalPool: number;
  agreePct: number;
  participants: number;
  openTime: string | null;
  closeTime: string | null;
  createdAt: string;
  resolutionType: string | null;
  targetPrice: number | null;
  asset: string | null;
  criteria: string | null;
  author: string | null;
  sourcePlatform: string | null;
  sourceUrl: string | null;
  sourceTimestamp: string | null;
  sourceText: string | null;
};

export type LandingCreator = {
  address: string;
  handle: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  totalBeliefs: number;
  resolved: number;
  correct: number;
};

export type LandingStats = {
  activeMarkets: number;
  totalBeliefs: number;
  creators: number;
  totalPoolEth: string;
};

type Status = "loading" | "ready" | "error";

function toMarket(m: any): LandingMarket {
  const belief = m.belief ?? null;
  const agreePool = Number(m.agree_pool ?? 0);
  const disagreePool = Number(m.disagree_pool ?? 0);
  const totalPool = agreePool + disagreePool;
  const config = (m.resolution_config ?? {}) as Record<string, unknown>;
  return {
    id: m.id,
    title: m.title ?? belief?.statement ?? "",
    chainId: Number(m.chain_id),
    contractAddress: m.contract_address ?? null,
    agreePool,
    disagreePool,
    totalPool,
    agreePct: totalPool > 0 ? Math.round((agreePool / totalPool) * 100) : 50,
    participants: Number(m.participants_count ?? 0),
    openTime: m.open_time ?? null,
    closeTime: m.close_time ?? null,
    createdAt: m.created_at,
    resolutionType: m.resolution_type ?? null,
    targetPrice: typeof config.targetPrice === "number" ? config.targetPrice : null,
    asset: typeof config.asset === "string" ? config.asset : null,
    criteria: typeof config.criteria === "string" ? config.criteria : null,
    author: belief?.author ?? null,
    sourcePlatform: belief?.source_platform ?? null,
    sourceUrl: belief?.source_url ?? null,
    sourceTimestamp: belief?.source_timestamp ?? null,
    sourceText: belief?.sources?.[0]?.raw_text ?? null,
  };
}

function toCreator(c: any): LandingCreator {
  return {
    address: c.wallet_address,
    handle: c.handle ?? null,
    displayName: c.display_name ?? null,
    avatarUrl: c.avatar_url ?? null,
    totalBeliefs: Number(c.total_beliefs_count ?? 0),
    resolved: Number(c.resolved_count ?? 0),
    correct: Number(c.correct_count ?? 0),
  };
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

export function useLandingData() {
  const [status, setStatus] = useState<Status>("loading");
  const [markets, setMarkets] = useState<LandingMarket[]>([]);
  const [creators, setCreators] = useState<LandingCreator[]>([]);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson("/api/markets?status=open&tab=most_volume&limit=12"),
      getJson("/api/creators?limit=8&sort=confirmed_beliefs"),
      getJson("/api/stats/overview"),
    ])
      .then(([m, c, s]) => {
        if (cancelled) return;
        setMarkets((m.markets ?? []).map(toMarket).filter((x: LandingMarket) => x.title));
        setCreators((c.data ?? c.creators ?? []).map(toCreator));
        setStats(
          s?.stats
            ? {
                activeMarkets: Number(s.stats.active_markets ?? 0),
                totalBeliefs: Number(s.stats.total_beliefs ?? 0),
                creators: Number(s.stats.verified_creators ?? 0),
                totalPoolEth: String(s.stats.total_tvl_eth ?? "0"),
              }
            : null
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  };

  return { status, markets, creators, stats, retry };
}

export function handleOf(author: string | null): string {
  if (!author) return "anonymous";
  return author.replace(/^@/, "");
}

export function closesIn(iso: string | null): string {
  if (!iso) return "open";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "closed";
  const days = Math.floor(ms / 86_400_000);
  return days >= 1 ? `${days}d left` : `${Math.max(1, Math.floor(ms / 3_600_000))}h left`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "not recorded";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export const PLATFORM_LABELS: Record<string, string> = {
  farcaster: "Farcaster",
  x: "X",
  twitter: "X",
  manual: "manual submission",
};
