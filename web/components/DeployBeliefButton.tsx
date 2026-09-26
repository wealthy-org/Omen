"use client";

import { useState } from "react";
import { useConnection } from "wagmi";
import { useAdminCreateMarket } from "@/hooks/useAdminCreateMarket";
import { parseBeliefResolution } from "@/lib/market/belief-resolution";
import { formatUserErrorMessage } from "@/lib/format-error";
import type { CreateMarketParams } from "@/types";

export function buildDeployParams(beliefId: string, statement: string, sourceUrl?: string): CreateMarketParams | null {
  const resolution = parseBeliefResolution(statement);
  if (!resolution) return null;
  return {
    title: statement,
    category: resolution.asset.toLowerCase(),
    endTime: resolution.deadline.toISOString(),
    resolutionSourceUrl: sourceUrl ?? "",
    resolutionCriteria: JSON.stringify({ asset: resolution.asset, type: resolution.resolutionType, target: resolution.targetPrice }),
    beliefId,
    assetSymbol: resolution.asset,
    targetPrice: resolution.targetPrice,
    resolutionType: resolution.resolutionType === "PRICE_BELOW" ? 1 : 0,
  };
}

type DeployBeliefButtonProps = {
  beliefId: string;
  statement: string;
  sourceUrl?: string;
  onDeployed?: () => void;
};

export default function DeployBeliefButton({ beliefId, statement, sourceUrl, onDeployed }: DeployBeliefButtonProps) {
  const { address } = useConnection();
  const { createMarket } = useAdminCreateMarket();
  const [state, setState] = useState<"idle" | "deploying" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const params = buildDeployParams(beliefId, statement, sourceUrl);

  if (!params) {
    return <span className="text-[11px] text-text-muted dark:text-[#A9B3AD]">Needs manual params</span>;
  }

  if (state === "done") {
    return <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Deployed</span>;
  }

  const handleDeploy = async () => {
    setError(null);
    setState("deploying");
    try {
      await createMarket(params);
      setState("done");
      onDeployed?.();
    } catch (err) {
      setError(formatUserErrorMessage(err));
      setState("idle");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDeploy}
        disabled={!address || state === "deploying"}
        title={address ? undefined : "Connect your admin wallet to deploy"}
        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
      >
        {state === "deploying" ? "Deploying..." : "Deploy market"}
      </button>
      {error && <span className="text-[10px] text-no-red max-w-[180px] line-clamp-2">{error}</span>}
    </div>
  );
}
