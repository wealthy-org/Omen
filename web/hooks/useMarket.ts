import { formatEther, Address } from "viem";
import { useReadContracts } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import type { UseMarketResult } from "@/types";

export type { UseMarketResult };

export function useMarket(marketAddress?: string): UseMarketResult {
  const isValidAddress = Boolean(
    marketAddress && marketAddress.startsWith("0x") && marketAddress.length === 42
  );
  const targetAddress = isValidAddress ? (marketAddress as Address) : undefined;

  const { data, isLoading, refetch: contractRefetch } = useReadContracts({
    contracts: targetAddress
      ? [
          {
            address: targetAddress,
            abi: OMEN_MARKET_ABI as any,
            functionName: "agreePool",
          },
          {
            address: targetAddress,
            abi: OMEN_MARKET_ABI as any,
            functionName: "disagreePool",
          },
          {
            address: targetAddress,
            abi: OMEN_MARKET_ABI as any,
            functionName: "status",
          },
        ]
      : [],
    query: {
      enabled: Boolean(targetAddress),
    },
  });

  let agreePool = 50;
  let disagreePool = 50;
  let status = "OPEN";

  if (data && Array.isArray(data)) {
    try {
      const item0: any = data[0];
      const item1: any = data[1];
      const item2: any = data[2];

      const agreeVal = item0?.result !== undefined ? item0.result : (typeof item0 === "bigint" || typeof item0 === "number" ? item0 : undefined);
      const disagreeVal = item1?.result !== undefined ? item1.result : (typeof item1 === "bigint" || typeof item1 === "number" ? item1 : undefined);
      const statusVal = item2?.result !== undefined ? item2.result : (typeof item2 === "number" || typeof item2 === "bigint" ? item2 : undefined);

      if (agreeVal !== undefined) {
        agreePool = typeof agreeVal === "bigint" ? parseFloat(formatEther(agreeVal)) : Number(agreeVal);
      }
      if (disagreeVal !== undefined) {
        disagreePool = typeof disagreeVal === "bigint" ? parseFloat(formatEther(disagreeVal)) : Number(disagreeVal);
      }
      if (statusVal !== undefined) {
        const statusCode = Number(statusVal);
        status = statusCode === 0 ? "OPEN" : statusCode === 1 ? "RESOLVED" : statusCode === 2 ? "VOIDED" : "PAUSED";
      }
    } catch {
    }
  }

  const refetch = () => {
    if (contractRefetch) {
      contractRefetch();
    }
  };

  return {
    agreePool,
    disagreePool,
    status,
    isLoading,
    refetch,
  };
}

export default useMarket;
