"use client";

import Link from "next/link";
import KolAvatar from "./KolAvatar";
import { closesIn, handleOf, PLATFORM_LABELS, type LandingMarket, type LandingStats } from "./useLandingData";

type HeroSectionProps = {
  status: "loading" | "ready" | "error";
  featured: LandingMarket | null;
  stats: LandingStats | null;
};

function StatFigure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[#4B5D55] dark:text-[#A9B3AD]">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-bold text-[#0B1F16] dark:text-white">{value}</dd>
    </div>
  );
}

function LiveCall({ market }: { market: LandingMarket }) {
  const handle = handleOf(market.author);
  const platform = PLATFORM_LABELS[market.sourcePlatform ?? ""] ?? "social";
  return (
    <Link
      href={`/market/${market.id}`}
      className="group block rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-white dark:bg-[#07100B] p-5 sm:p-6 transition-colors hover:border-emerald-600/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 min-w-0">
          <KolAvatar handle={handle} size={32} />
          <span className="truncate text-sm font-semibold text-[#0B1F16] dark:text-white">@{handle}</span>
          <span className="text-xs text-[#4B5D55] dark:text-[#A9B3AD]">on {platform}</span>
        </span>
        <span className="font-mono text-xs text-[#4B5D55] dark:text-[#A9B3AD]">{closesIn(market.closeTime)}</span>
      </div>
      {market.sourceText && (
        <p className="mt-4 border-l-2 border-emerald-600 pl-3 text-sm leading-relaxed text-[#17241D] dark:text-[#DCE5DF] line-clamp-3">
          {market.sourceText}
        </p>
      )}
      <p className="mt-4 text-lg font-bold leading-snug text-[#0B1F16] dark:text-white">{market.title}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          {market.totalPool > 0 ? (
            <>
              <div className="font-mono text-3xl font-black text-emerald-700 dark:text-emerald-400">{market.agreePct}%</div>
              <div className="text-xs text-[#4B5D55] dark:text-[#A9B3AD]">of the pool agrees</div>
            </>
          ) : (
            <div className="text-sm text-[#4B5D55] dark:text-[#A9B3AD]">No stakes yet. The first position sets the odds.</div>
          )}
        </div>
        <span className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-emerald-800 dark:bg-emerald-500 dark:text-[#03130B] dark:group-hover:bg-emerald-400">
          Take a side
        </span>
      </div>
    </Link>
  );
}

export default function HeroSection({ status, featured, stats }: HeroSectionProps) {
  const figure = (n: number | undefined) => (status === "ready" && n !== undefined ? n.toLocaleString("en-US") : "·");

  return (
    <section id="top" className="grid grid-cols-1 items-center gap-10 pt-6 pb-4 sm:pt-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <h1 className="text-[40px] font-black leading-[1.02] tracking-[-0.035em] text-[#0B1F16] dark:text-white sm:text-6xl lg:text-[72px]">
          Put a price on{" "}
          <br className="hidden sm:block" />
          every <span className="text-emerald-700 dark:text-emerald-400">public call.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">
          Omen reads price calls from crypto voices on Farcaster, turns each one into an agree or disagree market on
          Robinhood Chain, and settles it against a Chainlink price at the deadline. The record of who called it right stays onchain.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#feed"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-emerald-700 px-6 text-[15px] font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-[#03130B] dark:hover:bg-emerald-400"
          >
            Read today&apos;s calls
          </Link>
          <Link
            href="/create"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-emerald-900/15 px-6 text-[15px] font-bold text-[#0B1F16] transition-colors hover:border-emerald-700/50 dark:border-white/15 dark:text-white"
          >
            Submit a call
          </Link>
        </div>
        <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-emerald-900/10 pt-6 dark:border-white/10">
          <StatFigure label="Live markets" value={figure(stats?.activeMarkets)} />
          <StatFigure label="Calls tracked" value={figure(stats?.totalBeliefs)} />
          <StatFigure label="Predictors" value={figure(stats?.creators)} />
        </dl>
      </div>

      <div className="lg:col-span-5">
        {status === "loading" && (
          <div className="h-[340px] animate-pulse rounded-2xl border border-emerald-900/10 bg-emerald-50/60 dark:border-white/10 dark:bg-white/5" aria-label="Loading the live call" />
        )}
        {status === "error" && (
          <div className="rounded-2xl border border-rose-500/30 p-6 text-sm text-[#4B5D55] dark:text-[#A9B3AD]">
            The live call could not load. The feed below has a retry button.
          </div>
        )}
        {status === "ready" && featured && <LiveCall market={featured} />}
        {status === "ready" && !featured && (
          <div className="rounded-2xl border border-dashed border-emerald-900/20 p-8 dark:border-white/15">
            <p className="text-lg font-bold text-[#0B1F16] dark:text-white">No live markets yet.</p>
            <p className="mt-2 text-sm text-[#4B5D55] dark:text-[#A9B3AD]">The first call someone submits becomes the first market here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
