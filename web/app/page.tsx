"use client";

import Link from "next/link";
import HeroSection from "@/components/landing/HeroSection";
import CallFeed from "@/components/landing/CallFeed";
import MarketJourney from "@/components/landing/MarketJourney";
import PredictorList from "@/components/landing/PredictorList";
import Reveal from "@/components/landing/Reveal";
import { useLandingData } from "@/components/landing/useLandingData";

export default function HomePage() {
  const { status, markets, creators, stats, retry } = useLandingData();
  const featured = markets.find((m) => m.sourceText) ?? markets[0] ?? null;

  return (
    <div className="flex w-full flex-col gap-24 sm:gap-32 pb-16">
      <HeroSection status={status} featured={featured} stats={stats} />
      <Reveal>
        <CallFeed status={status} markets={markets} onRetry={retry} />
      </Reveal>
      {status === "ready" && featured && (
        <Reveal>
          <MarketJourney market={featured} />
        </Reveal>
      )}
      <Reveal>
        <PredictorList status={status} creators={creators} />
      </Reveal>
      <Reveal>
        <section className="border-t border-emerald-900/10 pt-14 dark:border-white/10">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight text-[#0B1F16] dark:text-white sm:text-5xl">
            Saw a call worth testing? Turn it into a market.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-emerald-700 px-6 text-[15px] font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-[#03130B] dark:hover:bg-emerald-400"
            >
              Submit a call
            </Link>
            <Link
              href="/markets"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-emerald-900/15 px-6 text-[15px] font-bold text-[#0B1F16] hover:border-emerald-700/50 dark:border-white/15 dark:text-white"
            >
              Browse every market
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
