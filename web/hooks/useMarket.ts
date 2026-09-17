import { formatEther, Address } from "viem";
import { useReadContract } from "wagmi";
import { OMEN_MARKET_ABI, USE_MOCK_CONTRACT } from "@/lib/contracts";

export interface UseMarketResult {
  agreePool: number;
  disagreePool: number;
  status: string;
  isLoading: boolean;
  refetch: () => void;
}

export function useMarket(marketAddress?: string): UseMarketResult {
  const { data, isLoading, refetch: contractRefetch } = useReadContract({
    address: (marketAddress || "0x0000000000000000000000000000000000000000") as Address,
    abi: OMEN_MARKET_ABI,
    functionName: "getMarketSummary",
    query: {
      enabled: Boolean(marketAddress && !USE_MOCK_CONTRACT),
    },
  });

  let agreePool = 50;
  let disagreePool = 50;
  let status = "OPEN";

  if (data && Array.isArray(data)) {
    try {
      const agreeWei = data[0] as bigint;
      const disagreeWei = data[1] as bigint;
      const statusCode = Number(data[2]);

      agreePool = parseFloat(formatEther(agreeWei)) || 0;
      disagreePool = parseFloat(formatEther(disagreeWei)) || 0;
      status = statusCode === 0 ? "OPEN" : statusCode === 1 ? "CLOSED" : "RESOLVED";
    } catch {
    }
  }

  const refetch = () => {
    if (!USE_MOCK_CONTRACT && contractRefetch) {
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
