import { createPublicClient, http, type Address } from "viem";
import { sepolia, arbitrumSepolia } from "viem/chains";

export const CHAINLINK_SEPOLIA_FEEDS = {
  ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306" as Address,
  BTC_USD: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43" as Address,
  SOL_USD: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d" as Address,
};

export const CHAINLINK_AGGREGATOR_ABI = [
  {
    name: "latestRoundData",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "description",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const AGGREGATOR_V3_ABI = CHAINLINK_AGGREGATOR_ABI;

export const CHAINLINK_PRICE_FEEDS: Record<number, Record<string, Address>> = {
  11155111: {
    ETH: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    BTC: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    LINK: "0xc59E3633BAAC79493d908e636ee6716c2D0ca80b",
    SOL: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d",
  },
  421614: {
    ETH: "0xd30e2101a74d88b72e6e05f01f49f8b049d79ff4",
    BTC: "0x0c9973e7a27d00e656b9f153348da46ca95e8542",
    LINK: "0x5227E044516daa801A2538C17F407922Ed3dd756",
  },
};

export type ResolutionType = "PRICE_ABOVE" | "PRICE_BELOW" | "RELATIVE_PERFORMANCE";
export type ResolutionOutcome = "AGREE_WON" | "DISAGREE_WON" | "INVALID";

export interface ResolutionParams {
  type: ResolutionType;
  targetPrice?: number;
  startPriceA?: number;
  endPriceA?: number;
  startPriceB?: number;
  endPriceB?: number;
}

export function normalizeChainlinkPrice(rawPrice: bigint | number, decimals = 8): number {
  if (!rawPrice || rawPrice === BigInt(0) || rawPrice === 0) return 0;
  const answer = typeof rawPrice === "bigint" ? rawPrice : BigInt(Math.trunc(rawPrice));
  const isNegative = answer < BigInt(0);
  const absAnswer = isNegative ? -answer : answer;
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = absAnswer / divisor;
  const fractionalPart = absAnswer % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const normalizedStr = `${isNegative ? "-" : ""}${integerPart.toString()}.${fractionalStr}`;
  return parseFloat(normalizedStr);
}

export function evaluateResolution(params: ResolutionParams): ResolutionOutcome {
  switch (params.type) {
    case "PRICE_ABOVE": {
      if (params.targetPrice === undefined || params.endPriceA === undefined) {
        return "INVALID";
      }
      return params.endPriceA >= params.targetPrice ? "AGREE_WON" : "DISAGREE_WON";
    }
    case "PRICE_BELOW": {
      if (params.targetPrice === undefined || params.endPriceA === undefined) {
        return "INVALID";
      }
      return params.endPriceA <= params.targetPrice ? "AGREE_WON" : "DISAGREE_WON";
    }
    case "RELATIVE_PERFORMANCE": {
      if (
        params.startPriceA === undefined ||
        params.endPriceA === undefined ||
        params.startPriceB === undefined ||
        params.endPriceB === undefined ||
        params.startPriceA <= 0 ||
        params.startPriceB <= 0
      ) {
        return "INVALID";
      }
      const returnA = (params.endPriceA - params.startPriceA) / params.startPriceA;
      const returnB = (params.endPriceB - params.startPriceB) / params.startPriceB;
      return returnA > returnB ? "AGREE_WON" : "DISAGREE_WON";
    }
    default:
      return "INVALID";
  }
}

export function calculateResolutionResult(
  type: ResolutionType,
  currentPrice: number,
  targetPrice: number
): { isResolved: boolean; resolvedSide: "AGREE" | "DISAGREE" | "VOID" } {
  const outcome = evaluateResolution({
    type,
    endPriceA: currentPrice,
    targetPrice,
  });

  if (outcome === "AGREE_WON") {
    return { isResolved: true, resolvedSide: "AGREE" };
  }
  if (outcome === "DISAGREE_WON") {
    return { isResolved: true, resolvedSide: "DISAGREE" };
  }
  return { isResolved: false, resolvedSide: "VOID" };
}

export function getPublicClientForChain(chainId: number) {
  const chain = chainId === 421614 ? arbitrumSepolia : sepolia;
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export async function getLatestPrice(
  publicClient: {
    readContract: (args: {
      address: Address;
      abi: typeof CHAINLINK_AGGREGATOR_ABI;
      functionName: string;
    }) => Promise<any>;
  },
  feedAddress: Address,
  maxStaleDurationSeconds = 3600
): Promise<{
  price: number;
  rawAnswer: bigint;
  decimals: number;
  updatedAt: number;
}> {
  const roundData = await publicClient.readContract({
    address: feedAddress,
    abi: CHAINLINK_AGGREGATOR_ABI,
    functionName: "latestRoundData",
  });

  const decimals = await publicClient.readContract({
    address: feedAddress,
    abi: CHAINLINK_AGGREGATOR_ABI,
    functionName: "decimals",
  });

  const rawAnswer: bigint = roundData[1];
  const updatedAtNumber = Number(roundData[3]);
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (currentTimestamp - updatedAtNumber > maxStaleDurationSeconds) {
    throw new Error(
      `Chainlink oracle price is stale. Last updated ${currentTimestamp - updatedAtNumber}s ago (threshold: ${maxStaleDurationSeconds}s).`
    );
  }

  const price = normalizeChainlinkPrice(rawAnswer, Number(decimals));

  return {
    price,
    rawAnswer,
    decimals: Number(decimals),
    updatedAt: updatedAtNumber,
  };
}

export async function fetchChainlinkPrice(
  asset: string,
  chainId = 11155111,
  customFeedAddress?: Address
): Promise<{ price: number; roundId: bigint; updatedAt: bigint }> {
  const normalizedAsset = asset.toUpperCase().trim();
  const feedAddress = customFeedAddress || CHAINLINK_PRICE_FEEDS[chainId]?.[normalizedAsset];

  if (!feedAddress) {
    throw new Error(`Chainlink feed not configured for asset ${normalizedAsset} on chain ${chainId}`);
  }

  const client = getPublicClientForChain(chainId);

  const [decimals, roundData] = await Promise.all([
    client.readContract({
      address: feedAddress,
      abi: CHAINLINK_AGGREGATOR_ABI,
      functionName: "decimals",
    }),
    client.readContract({
      address: feedAddress,
      abi: CHAINLINK_AGGREGATOR_ABI,
      functionName: "latestRoundData",
    }),
  ]);

  const [roundId, answer, , updatedAt] = roundData as [bigint, bigint, bigint, bigint, bigint];
  const price = normalizeChainlinkPrice(BigInt(answer.toString()), Number(decimals));

  return {
    price,
    roundId: BigInt(roundId.toString()),
    updatedAt: BigInt(updatedAt.toString()),
  };
}
