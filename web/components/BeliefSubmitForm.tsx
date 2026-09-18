"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export interface ExtractedBeliefData {
  statement: string;
  subject: string;
  direction: string;
  targetPrice?: number;
  targetTime?: string;
  category: string;
  confidenceScore: number;
}

export interface BeliefSubmitFormProps {
  initialRawText?: string;
  initialAuthorHandle?: string;
  onSuccessRedirect?: (marketId: string) => void;
}

export const BeliefSubmitForm: React.FC<BeliefSubmitFormProps> = ({
  initialRawText = "",
  initialAuthorHandle = "",
  onSuccessRedirect,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [rawText, setRawText] = useState<string>(initialRawText);
  const [authorHandle, setAuthorHandle] = useState<string>(initialAuthorHandle);
  const [sourceUrl, setSourceUrl] = useState<string>("");

  const [extracted, setExtracted] = useState<ExtractedBeliefData>({
    statement: "",
    subject: "ETH",
    direction: "ABOVE",
    targetPrice: 4000,
    targetTime: "2026-12-31",
    category: "Crypto",
    confidenceScore: 90,
  });

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!rawText.trim()) {
      setErrorMessage("Please enter the raw post or opinion text.");
      return;
    }
    if (!authorHandle.trim()) {
      setErrorMessage("Please enter the author handle.");
      return;
    }

    try {
      setIsExtracting(true);
      const res = await fetch("/api/beliefs/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText, author_handle: authorHandle, source_url: sourceUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        const extractedData = data.data || data.extracted;
        if (extractedData) {
          setExtracted({
            statement: extractedData.statement || rawText,
            subject: extractedData.subject || "Crypto",
            direction: extractedData.direction || "ABOVE",
            targetPrice: extractedData.target_price || extractedData.targetPrice || 4000,
            targetTime: extractedData.target_time || extractedData.targetTime || "2026-12-31",
            category: extractedData.category || "Crypto",
            confidenceScore: Number(extractedData.confidence_score || extractedData.confidenceScore || 90),
          });
        }
        setStep(2);
      } else {
        setExtracted({
          statement: rawText,
          subject: "Crypto",
          direction: "ABOVE",
          targetPrice: 4000,
          targetTime: "2026-12-31",
          category: "Crypto",
          confidenceScore: 88,
        });
        setStep(2);
      }
    } catch {
      setExtracted({
        statement: rawText,
        subject: "Crypto",
        direction: "ABOVE",
        targetPrice: 4000,
        targetTime: "2026-12-31",
        category: "Crypto",
        confidenceScore: 88,
      });
      setStep(2);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!extracted.statement.trim()) {
      setErrorMessage("Statement cannot be empty.");
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = async () => {
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/beliefs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: extracted.statement.trim(),
          raw_text: rawText.trim(),
          author: authorHandle.trim(),
          source_url: sourceUrl.trim() || null,
          ai_confidence: extracted.confidenceScore,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to deploy market");
      }

      const data = await res.json();
      const marketId = data.marketId || data.data?.market_id;
      if (!marketId) {
        throw new Error("Market ID not returned");
      }

      if (onSuccessRedirect) {
        onSuccessRedirect(marketId);
      } else {
        router.push(`/market/${marketId}`);
      }
    } catch {
      setErrorMessage("Failed to deploy market. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              step >= 1 ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            }`}
          >
            1
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            Raw Input
          </span>
        </div>

        <div className="h-0.5 w-12 bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              step >= 2 ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            }`}
          >
            2
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            AI Review
          </span>
        </div>

        <div className="h-0.5 w-12 bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              step >= 3 ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
            }`}
          >
            3
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            Launch Market
          </span>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-4 mb-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
          {errorMessage}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-5">
          <div>
            <label htmlFor="raw-text-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Raw Post or Opinion Text
            </label>
            <textarea
              id="raw-text-input"
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. ETH is definitely hitting $4,000 before this year ends! The ETF flows and staking yield are unmatched."
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author-handle-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Author Handle
              </label>
              <input
                id="author-handle-input"
                type="text"
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
                placeholder="@vitalikbuterin"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="source-url-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Original Post URL (Optional)
              </label>
              <input
                id="source-url-input"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://x.com/vitalikbuterin/status/..."
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isExtracting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
          >
            {isExtracting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Extracting Parameters with AI...</span>
              </>
            ) : (
              <span>Analyze with AI →</span>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Step 2: Review AI Extraction
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {extracted.confidenceScore}% Confidence
            </span>
          </div>

          <div>
            <label htmlFor="statement-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Structured Belief Statement
            </label>
            <input
              id="statement-input"
              type="text"
              value={extracted.statement}
              onChange={(e) => setExtracted({ ...extracted, statement: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Subject Asset
              </label>
              <input
                id="subject-input"
                type="text"
                value={extracted.subject}
                onChange={(e) => setExtracted({ ...extracted, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="direction-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Predicted Direction
              </label>
              <input
                id="direction-input"
                type="text"
                value={extracted.direction}
                onChange={(e) => setExtracted({ ...extracted, direction: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="category-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Category
              </label>
              <input
                id="category-input"
                type="text"
                value={extracted.category}
                onChange={(e) => setExtracted({ ...extracted, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-98"
            >
              Proceed to Confirmation →
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Step 3: Confirm & Launch Market
          </h3>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Statement
              </span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {extracted.statement}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 text-xs">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Author</span>
                <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">{authorHandle}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Asset / Direction</span>
                <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">{extracted.subject} ({extracted.direction})</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Resolution Oracle</span>
                <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">Chainlink Aggregator</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Settlement Chain</span>
                <p className="font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">Sepolia & Robinhood</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleStep3Submit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Deploying Market On-Chain...</span>
                </>
              ) : (
                <span>Launch On-Chain Market 🚀</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeliefSubmitForm;
