import { createWalletClient, createPublicClient, http, Hex, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { and, eq, isNull, lte, ne, or } from "drizzle-orm";
import { getDb, schema } from "../db";
import { fetchChainlinkPrice } from "../oracle/chainlink";
import { evaluateOracleCondition } from "./resolution-helper";
import { updateCreatorProfile, insertResolutionRecord, insertSettlementRecord } from "./resolution-service";
import { OMEN_MARKET_ABI } from "../contracts";
import { ROBINHOOD_TESTNET_CHAIN_ID, robinhoodChain } from "../constants";
import type { ResolvedOutcome, ResolutionExecutionResult, ResolutionEngineSummary, DbMarketStatus } from "@/types";

export type { ResolutionExecutionResult, ResolutionEngineSummary };

export async function resolveSingleMarket(marketId: string): Promise<ResolutionExecutionResult> {
  const db = getDb();
  const { markets, oracle_snapshots } = schema;

  const market = await db.query.markets.findFirst({ where: eq(markets.id, marketId) });

  if (!market) {
    return {
      success: false,
      marketId,
      outcome: "VOID",
      error: "Market not found",
    };
  }

  const activeStatuses = ["OPEN", "active"];
  if (!activeStatuses.includes(market.status)) {
    return {
      success: false,
      marketId,
      outcome: "VOID",
      error: `Market status is ${market.status}, not eligible for resolution`,
    };
  }

  if (market.resolution_type === "MANUAL") {
    return {
      success: false,
      marketId,
      outcome: "VOID",
      error: "Manual markets are resolved by an admin, not by the price oracle",
    };
  }

  const config = (market.resolution_config || {}) as Record<string, any>;
  const asset = config.asset || config.assetA || "ETH";
  const targetPrice = Number(config.targetPrice || 0);
  const resolutionType = market.resolution_type || "PRICE_ABOVE";
  const rawChainId = Number(market.chain_id);
  if (!rawChainId || isNaN(rawChainId)) {
    return {
      success: false,
      marketId,
      outcome: "VOID",
      error: `Market ${marketId} does not have a valid chain_id`,
    };
  }
  const chainId = rawChainId;

  let outcome: ResolvedOutcome = "VOID";
  let startPrice: number | undefined;
  let endPrice: number | undefined;

  const startSnapshot = await db.query.oracle_snapshots.findFirst({
    where: and(eq(oracle_snapshots.market_id, market.id), eq(oracle_snapshots.snapshot_type, "START")),
  });

  if (startSnapshot) {
    startPrice = Number(startSnapshot.price);
  }

  try {
    const endPriceData = await fetchChainlinkPrice(asset, chainId);
    endPrice = endPriceData.price;

    await db
      .insert(oracle_snapshots)
      .values({
        market_id: market.id,
        asset: asset.toUpperCase().trim(),
        price: endPrice,
        snapshot_type: "END",
        source: "chainlink",
        recorded_at: new Date().toISOString(),
      });

    outcome = evaluateOracleCondition(
      resolutionType as any,
      targetPrice,
      startPrice,
      endPrice
    );
  } catch {
    outcome = "VOID";
  }

  let txHash: string | null = null;
  const privateKey = (process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY) as Hex | undefined;

  if (privateKey && market.contract_address) {
    try {
      const account = privateKeyToAccount(privateKey);
      const chain = chainId === ROBINHOOD_TESTNET_CHAIN_ID ? robinhoodChain : sepolia;

      const publicClient = createPublicClient({ chain, transport: http() });
      const walletClient = createWalletClient({ account, chain, transport: http() });

      const outcomeUint = outcome === "AGREE" ? 1 : outcome === "DISAGREE" ? 2 : 3;

      const hash = await walletClient.writeContract({
        address: market.contract_address as Address,
        abi: OMEN_MARKET_ABI as any,
        functionName: "resolveMarket",
        args: [outcomeUint],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      txHash = hash;
    } catch (contractErr: any) {
      void contractErr;
    }
  }

  const marketStatus: DbMarketStatus = "RESOLVED";

  await db
    .update(markets)
    .set({
      status: marketStatus,
      winner: outcome,
    })
    .where(eq(markets.id, market.id));

  if (market.belief_id) {
    await updateCreatorProfile(db, market.belief_id, outcome);
  }

  await insertResolutionRecord(db, {
    marketId: market.id,
    oracleSource: "chainlink",
    startPrice: startPrice || null,
    endPrice: endPrice || null,
    resolvedOutcome: outcome,
    resolutionTxHash: txHash,
    resolvedAt: new Date().toISOString(),
  });

  const agreePool = Number(market.agree_pool ?? 0);
  const disagreePool = Number(market.disagree_pool ?? 0);

  await insertSettlementRecord(db, {
    marketId: market.id,
    agreePool,
    disagreePool,
    outcome,
  });

  return {
    success: true,
    marketId: market.id,
    outcome,
    txHash: txHash ?? undefined,
  };
}

export async function processPendingResolutions(): Promise<ResolutionEngineSummary> {
  const { markets } = schema;
  const nowIso = new Date().toISOString();

  let expiredMarkets: { id: string }[];
  try {
    expiredMarkets = await getDb().query.markets.findMany({
      columns: { id: true },
      where: and(
        eq(markets.status, "OPEN"),
        lte(markets.close_time, nowIso),
        or(isNull(markets.resolution_type), ne(markets.resolution_type, "MANUAL"))
      ),
    });
  } catch {
    return {
      success: false,
      processedCount: 0,
      results: [],
    };
  }

  const results: ResolutionExecutionResult[] = [];

  for (const market of expiredMarkets) {
    const res = await resolveSingleMarket(market.id);
    results.push(res);
  }

  return {
    success: true,
    processedCount: results.length,
    results,
  };
}
