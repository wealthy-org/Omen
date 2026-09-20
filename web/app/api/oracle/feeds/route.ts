import { NextResponse } from "next/server";
import { fetchChainlinkPrice, CHAINLINK_PRICE_FEEDS } from "@/lib/oracle/chainlink";
import { OracleFeedState } from "@/types/api";

const CONFIG_FEEDS = [
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    asset: "ETH",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: 11155111,
    contractAddress: CHAINLINK_PRICE_FEEDS[11155111]?.ETH || "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    asset: "BTC",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: 11155111,
    contractAddress: CHAINLINK_PRICE_FEEDS[11155111]?.BTC || "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    asset: "SOL",
    decimals: 8,
    heartbeatSec: 3600,
    chainId: 11155111,
    contractAddress: CHAINLINK_PRICE_FEEDS[11155111]?.SOL || "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d",
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
