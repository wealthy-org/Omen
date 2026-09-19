"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";

export interface ProtocolStep {
  number: string;
  title: string;
  description: string;
  tag: string;
}

export const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    number: "1",
    title: "A belief appears",
    description: "AI reads a high-conviction social take and structures it into an objective, dated on-chain claim.",
    tag: "AI Extractor",
  },
  {
    number: "2",
    title: "The market opens",
    description: "Anyone stakes test ETH on AGREE or DISAGREE into a decentralized pari-mutuel pool.",
    tag: "Smart Contract",
  },
  {
    number: "3",
    title: "The author confirms",
    description: "The creator signs via EIP-712 to stake their reputation and unlock creator fee shares.",
    tag: "Wallet Signature",
  },
  {
    number: "4",
    title: "Oracle resolves",
    description: "Verifiable Chainlink price feeds settle the outcome automatically at the deadline.",
    tag: "Chainlink Oracle",
  },
  {
    number: "5",
    title: "Record remembered",
    description: "Settled results permanently update the author's public accuracy and track record score.",
    tag: "On-Chain Record",
  },
];

export interface ProtocolFlowProps {
  theme?: "dark" | "light";
}

export default function ProtocolFlow({ theme: propTheme }: ProtocolFlowProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <section id="how-it-works" className="w-full my-8 sm:my-12 scroll-mt-24">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
              }`}
          >
            Deterministic Lifecycle
          </span>
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"
            }`}
        >
          From a Take to a Track Record
        </h2>
        <p
          className={`text-sm sm:text-base mt-1.5 max-w-2xl ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
        >
          Five cryptographic stages, each verified by independent protocol layers. No admin custody, no discretionary resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {PROTOCOL_STEPS.map((step) => (
          <div
            key={step.number}
            className={`p-5 rounded-2xl border transition-all duration-200 hover-lift flex flex-col justify-between ${isDark
                ? "bg-[#070D09]/90 border-white/10 hover:border-emerald-500/40 text-white"
                : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 text-[#0B1F16] shadow-xs"
              }`}
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-mono font-black text-sm flex items-center justify-center mb-4">
                {step.number}
              </div>
              <h3 className="text-base font-bold mb-2 tracking-tight">{step.title}</h3>
              <p
                className={`text-xs leading-relaxed mb-4 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
              >
                {step.description}
              </p>
            </div>
            <div className="pt-3 border-t border-emerald-500/10 flex items-center">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isDark
                    ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]"
                    : "bg-emerald-50 border-emerald-500/20 text-[#0E7A4E]"
                  }`}
              >
                {step.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
