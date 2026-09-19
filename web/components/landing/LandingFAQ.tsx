"use client";

import React, { useState } from "react";
import { useTheme } from "../ThemeProvider";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is an Omen Social Belief Market?",
    answer: "OMEN transforms high-conviction social takes from X and Warpcast into decentralized AGREE / DISAGREE binary prediction pools. Rather than endlessly debating opinions online, participants back their conviction with test ETH and build a verifiable track record.",
  },
  {
    question: "How does the EIP-712 Creator Signature & Fee Share work?",
    answer: "When a public opinion is extracted by our AI pipeline, the original author can connect their wallet and cryptographically sign the claim using EIP-712 typed data. Confirming a belief stakes the creator's reputation on-chain and entitles them to a 1.5% creator fee share from the market's total volume.",
  },
  {
    question: "How are markets resolved without central discretionary control?",
    answer: "Markets are automatically resolved using decentralized Chainlink AggregatorV3 price feeds or deterministic on-chain data snapshots at the scheduled deadline. No central operator or administrator can arbitrarily determine market outcomes.",
  },
  {
    question: "How does the Pari-Mutuel payout calculation work?",
    answer: "In a pari-mutuel model, there are no fixed bookmaker spreads. Stakers on the winning outcome share the total accumulated pool proportionally to their stake size, minus the protocol and creator fee shares.",
  },
  {
    question: "Why does Omen operate on Ethereum Sepolia and Robinhood Chain?",
    answer: "Omen utilizes a dual-testnet architecture to maximize accessibility and scalability. Ethereum Sepolia provides a robust, decentralized settlement layer, while Robinhood Chain Testnet (Chain ID 46630) offers ultra-fast execution speeds and near-zero gas costs.",
  },
  {
    question: "Is test ETH real money?",
    answer: "No. Omen is currently deployed as a demonstration and research protocol on public testnets. Positions utilize test ETH with zero real-world monetary value, ensuring safe exploration and stress-testing of on-chain reputation mechanics.",
  },
];

export interface LandingFAQProps {
  theme?: "dark" | "light";
}

export default function LandingFAQ({ theme: propTheme }: LandingFAQProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="w-full my-8 sm:my-14 scroll-mt-24">
      <div className="flex flex-col mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
            }`}
          >
            Protocol Insights & Verification
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
        >
          Frequently Asked Questions
        </h2>
        <p
          className={`text-sm sm:text-base mt-1.5 ${
            isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
          }`}
        >
          Everything you need to know about social conviction markets, oracle resolution, and creator reputation.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={item.question}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark
                  ? isOpen
                    ? "bg-[#0A0F0C] border-emerald-500/40 shadow-lg"
                    : "bg-[#070D09]/90 border-white/10 hover:border-white/20"
                  : isOpen
                    ? "bg-white border-emerald-500/35 shadow-sm"
                    : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span
                  className={`text-sm sm:text-base font-bold tracking-tight ${
                    isDark
                      ? isOpen ? "text-[#34D399]" : "text-white"
                      : isOpen ? "text-[#0E7A4E]" : "text-[#0B1F16]"
                  }`}
                >
                  {item.question}
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-emerald-500/20 text-emerald-500" : "bg-zinc-200/50 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div
                  className={`px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                    isDark ? "border-white/5 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
                  } animate-fade-in`}
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
