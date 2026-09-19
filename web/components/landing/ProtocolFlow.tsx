"use client";

import { ProtocolStep, ProtocolFlowProps } from "@/types";

export type { ProtocolStep, ProtocolFlowProps };

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

export default function ProtocolFlow({}: ProtocolFlowProps) {
  return (
    <section id="how-it-works" className="w-full my-8 sm:my-12 scroll-mt-24">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0E7A4E] dark:text-[#34D399]">
            Deterministic Lifecycle
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
          From a Take to a Track Record
        </h2>
        <p className="text-sm sm:text-base mt-1.5 max-w-2xl text-[#4B5D55] dark:text-[#A9B3AD]">
          Five cryptographic stages, each verified by independent protocol layers. No admin custody, no discretionary resolution.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {PROTOCOL_STEPS.map((step, idx) => (
          <div
            key={step.number}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover-lift flex flex-col justify-between bg-white/95 dark:bg-[#070D09]/90 border-emerald-500/15 dark:border-white/10 hover:border-emerald-500/35 dark:hover:border-emerald-500/40 text-[#0B1F16] dark:text-white shadow-xs dark:shadow-none ${
              idx === 4 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-mono font-black text-sm flex items-center justify-center mb-3 sm:mb-4">
                {step.number}
              </div>
              <h3 className="text-sm sm:text-base font-bold mb-1.5 sm:mb-2 tracking-tight">{step.title}</h3>
              <p className="text-xs leading-relaxed mb-3 sm:mb-4 text-[#4B5D55] dark:text-[#A9B3AD]">
                {step.description}
              </p>
            </div>
            <div className="pt-2.5 sm:pt-3 border-t border-emerald-500/10 flex items-center">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/20 text-[#0E7A4E] dark:text-[#34D399]">
                {step.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
