"use client";

import Link from "next/link";
import { getExplorerBaseUrl } from "@/lib/contracts";
import { ROBINHOOD_TESTNET_CHAIN_ID } from "@/lib/constants";
import { formatDate, handleOf, PLATFORM_LABELS, type LandingMarket } from "./useLandingData";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function MarketJourney({ market }: { market: LandingMarket | null }) {
  if (!market) return null;

  const handle = handleOf(market.author);
  const platform = PLATFORM_LABELS[market.sourcePlatform ?? ""] ?? "social";
  const explorer = getExplorerBaseUrl(market.chainId);
  const chainName = market.chainId === ROBINHOOD_TESTNET_CHAIN_ID ? "Robinhood Chain testnet" : "Ethereum Sepolia";
  const direction = market.resolutionType === "PRICE_BELOW" ? "at or below" : "at or above";
  const isManual = market.resolutionType === "MANUAL";

  const steps = [
    {
      when: formatDate(market.sourceTimestamp),
      title: `@${handle} posts on ${platform}`,
      body: market.sourceText ? `“${market.sourceText.slice(0, 180)}${market.sourceText.length > 180 ? "…" : ""}”` : "The original post text was not captured.",
      link: market.sourceUrl ? { href: market.sourceUrl, label: "Open the post", external: true } : null,
    },
    {
      when: formatDate(market.createdAt),
      title: "The call becomes a yes-or-no claim",
      body: isManual && market.criteria
        ? `${market.title} It counts as YES only if: ${market.criteria}`
        : market.asset && market.targetPrice !== null
          ? `${market.asset} must trade ${direction} $${market.targetPrice.toLocaleString("en-US")} before ${formatDate(market.closeTime)}. Vague wording is dropped; only a price, a direction, and a date survive.`
          : market.title,
      link: null,
    },
    {
      when: formatDate(market.openTime ?? market.createdAt),
      title: `A market contract goes live on ${chainName}`,
      body: market.contractAddress
        ? `Anyone can put test ETH on agree or disagree. The pool lives in contract ${shortAddress(market.contractAddress)}, not in a database row.`
        : "The contract address will appear here once deployed.",
      link: market.contractAddress ? { href: `${explorer}/address/${market.contractAddress}`, label: "View the contract", external: true } : null,
    },
    {
      when: formatDate(market.closeTime),
      title: "The deadline settles it",
      body: isManual
        ? "An admin checks the outcome against that rule and records the evidence. Winners split the pool, and the result is added to the predictor's record."
        : "A Chainlink price decides the outcome. Winners split the pool, and the result is added to the predictor's record.",
      link: { href: `/market/${market.id}`, label: "Follow this market", external: false },
    },
  ];

  return (
    <section aria-labelledby="journey-title" className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 id="journey-title" className="text-3xl font-black tracking-tight text-[#0B1F16] dark:text-white sm:text-4xl">
          One call, start to finish
        </h2>
        <p className="mt-3 text-[#4B5D55] dark:text-[#A9B3AD]">
          A post is just talk until it has a price and a deadline. This is the path a live market on Omen actually took.
        </p>
      </div>

      <ol className="relative lg:col-span-8">
        {steps.map((step, i) => (
          <li key={step.title} className="relative grid grid-cols-[88px_1fr] gap-4 pb-9 last:pb-0 sm:grid-cols-[120px_1fr]">
            <span className="pt-0.5 font-mono text-xs text-[#4B5D55] dark:text-[#A9B3AD]">{step.when}</span>
            <div className="relative border-l border-emerald-900/15 pl-6 dark:border-white/15">
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  i === steps.length - 1 ? "border-2 border-emerald-700 bg-white dark:border-emerald-400 dark:bg-[#030906]" : "bg-emerald-700 dark:bg-emerald-400"
                }`}
                aria-hidden="true"
              />
              <h3 className="font-bold text-[#0B1F16] dark:text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">{step.body}</p>
              {step.link &&
                (step.link.external ? (
                  <a href={step.link.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                    {step.link.label}
                  </a>
                ) : (
                  <Link href={step.link.href} className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                    {step.link.label}
                  </Link>
                ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
