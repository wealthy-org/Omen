"use client";

import Link from "next/link";
import KolAvatar from "./KolAvatar";
import type { LandingCreator } from "./useLandingData";

function record(c: LandingCreator): string {
  if (c.resolved === 0) return "No calls settled yet";
  return `${c.correct} of ${c.resolved} settled calls right`;
}

export default function PredictorList({ status, creators }: { status: "loading" | "ready" | "error"; creators: LandingCreator[] }) {
  return (
    <section aria-labelledby="predictors-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="predictors-title" className="text-3xl font-black tracking-tight text-[#0B1F16] dark:text-white sm:text-4xl">
            Who&apos;s making the calls
          </h2>
          <p className="mt-3 text-[#4B5D55] dark:text-[#A9B3AD]">
            Every predictor keeps a record. It only counts calls that have settled, so a loud week can&apos;t fake a good one.
          </p>
        </div>
        <Link href="/creators" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
          All predictors
        </Link>
      </div>

      {status === "loading" && <div className="mt-8 h-40 animate-pulse rounded-xl bg-emerald-50/70 dark:bg-white/5" aria-label="Loading predictors" />}
      {status === "error" && <p className="mt-8 text-sm text-[#4B5D55] dark:text-[#A9B3AD]">Predictors couldn&apos;t load right now.</p>}
      {status === "ready" && creators.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-emerald-900/20 p-8 text-[#4B5D55] dark:border-white/15 dark:text-[#A9B3AD]">
          No predictors are being tracked yet.
        </p>
      )}
      {status === "ready" && creators.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 border-t border-emerald-900/10 dark:border-white/10 sm:grid-cols-2">
          {creators.map((c) => {
            const handle = (c.handle ?? c.address).replace(/^@/, "");
            return (
              <li key={c.address} className="border-b border-emerald-900/10 dark:border-white/10 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                <Link href={`/creator/${c.address}`} className="flex items-center gap-4 py-4 hover:bg-emerald-50/50 dark:hover:bg-white/[0.03]">
                  <KolAvatar handle={handle} src={c.avatarUrl} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[#0B1F16] dark:text-white">{c.displayName ?? handle}</span>
                    <span className="block truncate text-sm text-[#4B5D55] dark:text-[#A9B3AD]">@{handle}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-bold text-[#0B1F16] dark:text-white">
                      {c.totalBeliefs} {c.totalBeliefs === 1 ? "call" : "calls"}
                    </span>
                    <span className="block text-xs text-[#4B5D55] dark:text-[#A9B3AD]">{record(c)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
