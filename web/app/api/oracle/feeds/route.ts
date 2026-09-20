import { NextResponse } from "next/server";
import { fetchChainlinkPrice } from "@/lib/oracle/chainlink";
import {
  ETHEREUM_SEPOLIA_CHAIN_ID,
  CHAINLINK_ETH_USD_FEED,
  CHAINLINK_BTC_USD_FEED,
  CHAINLINK_SOL_USD_FEED,
} from "@/lib/constants";
import { OracleFeedState } from "@/types/api";

const CONFIG_FEEDS = [
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    asset: "ETH",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    contractAddress: CHAINLINK_ETH_USD_FEED,
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    asset: "BTC",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    contractAddress: CHAINLINK_BTC_USD_FEED,
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    asset: "SOL",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: ETHEREUM_SEPOLIA_CHAIN_ID,
    contractAddress: CHAINLINK_SOL_USD_FEED,
  },
];

export async function GET() {
  try {
    const feedsPromises = CONFIG_FEEDS.map(async (cfg): Promise<OracleFeedState> => {
      try {
        const onChainData = await fetchChainlinkPrice(cfg.asset, cfg.chainId);
        const updatedDate = new Date(Number(onChainData.updatedAt) * 1000);
        const now = Date.now();
        const diffSeconds = Math.floor((now - updatedDate.getTime()) / 1000);
        const status = diffSeconds > cfg.heartbeatSec * 24 ? "DEGRADED" : "HEALTHY";

        return {
          symbol: cfg.symbol,
          name: cfg.name,
          price: onChainData.price,
          decimals: cfg.decimals,
          roundId: onChainData.roundId.toString(),
          updatedAt: updatedDate.toISOString(),
          heartbeatSec: cfg.heartbeatSec,
          contractAddress: cfg.contractAddress,
          chainId: cfg.chainId,
          status,
        };
      } catch {
        return {
          symbol: cfg.symbol,
          name: cfg.name,
          price: 0,
          decimals: cfg.decimals,
          roundId: "0",
          updatedAt: new Date(0).toISOString(),
          heartbeatSec: cfg.heartbeatSec,
          contractAddress: cfg.contractAddress,
          chainId: cfg.chainId,
          status: "OFFLINE",
        };
      }
    });

    const results = await Promise.all(feedsPromises);

    return NextResponse.json({
      success: true,
      feeds: results,
      data: results,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
