"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BeliefSubmitForm from "@/components/BeliefSubmitForm";

function CreatePageContent() {
  const searchParams = useSearchParams();
  const initialRawText = searchParams?.get("text") || "";
  const initialAuthor = searchParams?.get("author") || "";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 animate-slide-down">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            AI Ingestion & Market Creation Wizard
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Submit Social Belief
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Paste any high-conviction opinion or tweet. Our AI pipeline parses the parameters and creates a decentralized belief market.
        </p>
      </div>

      <div className="animate-slide-up stagger-1">
        <BeliefSubmitForm
          initialRawText={initialRawText}
          initialAuthorHandle={initialAuthor}
        />
      </div>
    </div>
  );
}

export default function CreateBeliefPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl mx-auto p-8 animate-pulse" />}>
      <CreatePageContent />
    </Suspense>
  );
}
