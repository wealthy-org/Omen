import { createWalletClient, createPublicClient, http, Hex, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { getSupabaseAdminClient } from "../supabase";
import { fetchChainlinkPrice } from "../oracle/chainlink";
import { evaluateOracleCondition, calculateSettlementPool } from "./resolution-helper";
import { OMEN_MARKET_ABI, ROBINHOOD_TESTNET_CHAIN_ID, robinhoodChain } from "../contracts";
import type { ResolvedOutcome, ResolutionExecutionResult, ResolutionEngineSummary, DbMarketStatus } from "@/types";

export type { ResolutionExecutionResult, ResolutionEngineSummary };

export async function resolveSingleMarket(marketId: string): Promise<ResolutionExecutionResult> {
  const supabase = getSupabaseAdminClient();

  const { data: market, error: marketError } = await supabase
    .from("markets")
    .select("*")
    .eq("id", marketId)
    .maybeSingle();

  if (marketError || !market) {
    return {
      success: false,
      marketId,
      outcome: "VOID",
      error: marketError?.message || "Market not found",
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

  const config = (market.resolution_config || {}) as Record<string, any>;
  const asset = config.asset || config.assetA || "ETH";
  const targetPrice = Number(config.targetPrice || 0);
  const resolutionType = market.resolution_type || "PRICE_ABOVE";
  const chainId = Number(market.chain_id) || 11155111;

  let outcome: ResolvedOutcome = "VOID";
  let startPrice: number | undefined;
  let endPrice: number | undefined;

  const { data: startSnapshot } = await supabase
    .from("oracle_snapshots")
    .select("*")
    .eq("market_id", market.id)
    .maybeSingle();

  if (startSnapshot) {
    startPrice = Number(startSnapshot.price);
  }

  try {
    const endPriceData = await fetchChainlinkPrice(asset, chainId);
    endPrice = endPriceData.price;

    await supabase
      .from("oracle_snapshots")
      .insert({
        market_id: market.id,
        asset: asset.toUpperCase().trim(),
        price: endPrice,
        snapshot_type: "END",
        source: "chainlink",
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

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

  await supabase
    .from("markets")
    .update({
      status: marketStatus,
      winner: outcome,
    })
    .eq("id", market.id)
    .select()
    .single();

  if (market.belief_id) {
    await supabase
      .from("beliefs")
      .update({ status: "RESOLVED" })
      .eq("id", market.belief_id);

    const { data: belief } = await supabase
      .from("beliefs")
      .select("*")
      .eq("id", market.belief_id)
      .maybeSingle();

    if (belief?.author) {
      const normalizedAuthor = belief.author.toLowerCase();
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("wallet_address", normalizedAuthor)
        .maybeSingle();

      if (profile) {
        const isCorrect = outcome === "AGREE";
        await supabase
          .from("creator_profiles")
          .upsert({
            ...profile,
            wallet_address: normalizedAuthor,
            resolved_count: (profile.resolved_count || 0) + 1,
            correct_count: (profile.correct_count || 0) + (isCorrect ? 1 : 0),
          })
          .select();
      }
    }
  }

  await supabase
    .from("market_resolutions")
    .insert({
      market_id: market.id,
      oracle_source: "chainlink",
      start_price: startPrice || null,
      end_price: endPrice || null,
      resolved_outcome: outcome,
      resolution_tx_hash: txHash,
      resolved_at: new Date().toISOString(),
    })
    .select()
    .single();

  const agreePool = Number(market.agree_pool ?? 0);
  const disagreePool = Number(market.disagree_pool ?? 0);
  const settlement = calculateSettlementPool(agreePool, disagreePool, outcome);

  await supabase
    .from("market_settlements")
    .insert({
      market_id: market.id,
      total_pool: settlement.totalPool,
      distributable_pool: settlement.distributablePool,
      protocol_fee: settlement.protocolFee,
      settled_at: new Date().toISOString(),
    })
    .select()
    .single();

  return {
    success: true,
    marketId: market.id,
    outcome,
    txHash: txHash ?? undefined,
  };
}

export async function processPendingResolutions(): Promise<ResolutionEngineSummary> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data: expiredMarkets, error } = await supabase
    .from("markets")
    .select("*")
    .eq("status", "OPEN")
    .lte("close_time", nowIso);

  if (error || !expiredMarkets) {
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
