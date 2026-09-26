"use client";

import Link from "next/link";
import KolAvatar from "./KolAvatar";
import { closesIn, handleOf, PLATFORM_LABELS, type LandingMarket } from "./useLandingData";

const FEED_SIZE = 4;

function CallCard({ market }: { market: LandingMarket }) {
  const handle = handleOf(market.author);
  const platform = PLATFORM_LABELS[market.sourcePlatform ?? ""] ?? "social";
  return (
    <article className="border-b border-emerald-900/10 py-7 first:pt-0 last:border-0 dark:border-white/10">
      <header className="flex items-center gap-3">
        <KolAvatar handle={handle} />
        <div className="min-w-0">
          <Link href={`/creator/${encodeURIComponent(market.author ?? handle)}`} className="block truncate font-semibold text-[#0B1F16] hover:underline dark:text-white">
            @{handle}
          </Link>
          <p className="text-xs text-[#4B5D55] dark:text-[#A9B3AD]">
            posted on {platform}
            {market.sourceUrl && (
              <>
                {" · "}
                <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-400">
                  original post
                </a>
              </>
            )}
          </p>
        </div>
      </header>

      {market.sourceText && (
        <blockquote className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#17241D] dark:text-[#DCE5DF] line-clamp-5">
          {market.sourceText}
        </blockquote>
      )}

      <Link
        href={`/market/${market.id}`}
        className="mt-4 flex flex-col gap-4 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-4 transition-colors hover:border-emerald-700/40 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="min-w-0">
          <span className="block text-xs text-[#4B5D55] dark:text-[#A9B3AD]">Market</span>
          <span className="mt-0.5 block font-semibold leading-snug text-[#0B1F16] dark:text-white">{market.title}</span>
          <span className="mt-1 block font-mono text-xs text-[#4B5D55] dark:text-[#A9B3AD]">
            {market.totalPool.toFixed(3)} ETH pool · {closesIn(market.closeTime)}
          </span>
        </span>
        {market.totalPool > 0 ? (
          <span className="flex shrink-0 items-center gap-2 font-mono text-sm font-bold">
            <span className="rounded-md bg-emerald-700 px-3 py-2 text-white dark:bg-emerald-500 dark:text-[#03130B]">Agree {market.agreePct}%</span>
            <span className="rounded-md border border-rose-600/40 px-3 py-2 text-rose-700 dark:text-rose-400">Disagree {100 - market.agreePct}%</span>
          </span>
        ) : (
          <span className="shrink-0 rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white dark:bg-emerald-500 dark:text-[#03130B]">
            Be the first to take a side
          </span>
        )}
      </Link>
    </article>
  );
}

export default function CallFeed({
  status,
  markets,
  onRetry,
}: {
  status: "loading" | "ready" | "error";
  markets: LandingMarket[];
  onRetry: () => void;
}) {
  const feed = markets.filter((m) => m.sourceText).slice(0, FEED_SIZE);

  return (
    <section id="feed" aria-labelledby="feed-title" className="scroll-mt-28">
      <div className="max-w-2xl">
        <h2 id="feed-title" className="text-3xl font-black tracking-tight text-[#0B1F16] dark:text-white sm:text-4xl">
          The calls, and what they&apos;re worth
        </h2>
        <p className="mt-3 text-[#4B5D55] dark:text-[#A9B3AD]">
          Each post below was made in public. Next to it sits the market it became, with the share of the pool that thinks it lands.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {status === "loading" && (
            <div className="space-y-6" aria-label="Loading calls">
              {[0, 1].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-emerald-50/70 dark:bg-white/5" />
              ))}
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-rose-500/30 p-6">
              <p className="font-semibold text-[#0B1F16] dark:text-white">The feed didn&apos;t load.</p>
              <button type="button" onClick={onRetry} className="mt-3 min-h-[44px] rounded-lg border border-emerald-900/15 px-4 text-sm font-bold text-[#0B1F16] hover:border-emerald-700/50 dark:border-white/15 dark:text-white">
                Try again
              </button>
            </div>
          )}
          {status === "ready" && feed.length === 0 && (
            <p className="rounded-xl border border-dashed border-emerald-900/20 p-8 text-[#4B5D55] dark:border-white/15 dark:text-[#A9B3AD]">
              No calls have been scanned into markets yet.
            </p>
          )}
          {status === "ready" && feed.map((m) => <CallCard key={m.id} market={m} />)}
        </div>

        <aside className="lg:col-span-4" aria-labelledby="board-title">
          <div className="lg:sticky lg:top-28 rounded-xl border border-emerald-900/10 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-emerald-900/10 px-4 py-3 dark:border-white/10">
              <h3 id="board-title" className="text-sm font-bold text-[#0B1F16] dark:text-white">Market board</h3>
              <Link href="/markets" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                All markets
              </Link>
            </div>
            {status === "ready" && markets.length > 0 ? (
              <ol>
                {markets.slice(0, 8).map((m) => (
                  <li key={m.id} className="border-b border-emerald-900/5 last:border-0 dark:border-white/5">
                    <Link href={`/market/${m.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-50/60 dark:hover:bg-white/[0.03]">
                      <span className="line-clamp-2 text-sm text-[#17241D] dark:text-[#DCE5DF]">{m.title}</span>
                      <span className="shrink-0 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {m.totalPool > 0 ? `${m.agreePct}%` : <span className="font-sans text-xs font-normal text-[#4B5D55] dark:text-[#A9B3AD]">open</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-4 py-6 text-sm text-[#4B5D55] dark:text-[#A9B3AD]">
                {status === "loading" ? "Loading markets…" : status === "error" ? "Markets unavailable right now." : "No open markets."}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
