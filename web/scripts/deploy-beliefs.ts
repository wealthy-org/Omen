import { config } from "dotenv";
import { eq, isNull } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { computeBeliefHashes, createOnChainMarket } from "../lib/market/factory-client";
import { parseBeliefResolution } from "../lib/market/belief-resolution";
import { CHAINLINK_ETH_USD_FEED, CHAINLINK_PRICE_FEEDS, ETHEREUM_SEPOLIA_CHAIN_ID, ROBINHOOD_TESTNET_CHAIN_ID } from "../lib/constants";
import type { BeliefClaim } from "../lib/db/schema";

type MarketPlan = {
  kind: "PRICE" | "EVENT";
  asset?: string;
  feed?: `0x${string}`;
  targetPrice: number;
  deadline: Date;
  category: string;
  resolutionType: "PRICE_ABOVE" | "PRICE_BELOW" | "MANUAL";
  resolutionConfig: Record<string, unknown>;
};

function planMarket(statement: string, claim: BeliefClaim | null): MarketPlan | null {
  if (claim?.kind === "EVENT") {
    return {
      kind: "EVENT",
      targetPrice: 0,
      deadline: new Date(claim.deadline),
      category: claim.category,
      resolutionType: "MANUAL",
      resolutionConfig: { kind: "EVENT", criteria: claim.criteria },
    };
  }
  const price = claim?.kind === "PRICE"
    ? { asset: claim.asset, targetPrice: claim.targetPrice, deadline: new Date(claim.deadline), resolutionType: claim.direction === "BELOW" ? "PRICE_BELOW" as const : "PRICE_ABOVE" as const }
    : parseBeliefResolution(statement);
  if (!price) return null;
  return {
    kind: "PRICE",
    asset: price.asset,
    feed: CHAINLINK_PRICE_FEEDS[ETHEREUM_SEPOLIA_CHAIN_ID]?.[price.asset],
    targetPrice: price.targetPrice,
    deadline: price.deadline,
    category: price.asset.toLowerCase(),
    resolutionType: price.resolutionType,
    resolutionConfig: { asset: price.asset, targetPrice: price.targetPrice },
  };
}

async function main() {
  config({ path: [".env.local", ".env"], quiet: true });

  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");
  if (!/^0x[0-9a-fA-F]{64}$/.test(process.env.ADMIN_PRIVATE_KEY ?? "")) throw new Error("ADMIN_PRIVATE_KEY must be a 0x-prefixed 32-byte private key");

  const chainId = Number(process.env.DEPLOY_CHAIN_ID ?? ROBINHOOD_TESTNET_CHAIN_ID);
  const db = getDb();
  const { beliefs, belief_sources, markets, market_events } = schema;

  const pending = await db
    .select({ id: beliefs.id, statement: beliefs.statement, author: beliefs.author, source_url: beliefs.source_url, claim: beliefs.claim })
    .from(beliefs)
    .leftJoin(markets, eq(markets.belief_id, beliefs.id))
    .where(isNull(markets.id));

  console.log(`${pending.length} beliefs without a market on chain ${chainId}`);

  let deployed = 0;
  for (const belief of pending) {
    const plan = planMarket(belief.statement, belief.claim);
    if (!plan) {
      console.log(`skip (needs manual params): ${belief.statement}`);
      continue;
    }
    if (plan.kind === "PRICE" && !plan.feed) {
      console.log(`skip (no Chainlink feed for ${plan.asset}): ${belief.statement}`);
      continue;
    }
    if (plan.deadline.getTime() <= Date.now()) {
      console.log(`skip (deadline passed): ${belief.statement}`);
      continue;
    }

    const source = await db.query.belief_sources.findFirst({ where: eq(belief_sources.belief_id, belief.id) });
    const openTime = Math.floor(Date.now() / 1000);
    const closeTime = Math.floor(plan.deadline.getTime() / 1000);
    const feed = plan.feed ?? CHAINLINK_ETH_USD_FEED;
    const hashes = computeBeliefHashes(belief.statement, source?.raw_text ?? belief.source_url ?? belief.statement, plan.resolutionConfig);

    try {
      const onChain = await createOnChainMarket({
        ...hashes,
        openTime,
        closeTime,
        chainId,
        config: {
          resType: plan.resolutionType === "PRICE_BELOW" ? 1 : 0,
          assetAFeed: feed,
          assetBFeed: feed,
          targetPrice: plan.targetPrice,
          startTimestamp: openTime,
          endTimestamp: closeTime,
        },
      });

      const [market] = await db
        .insert(markets)
        .values({
          belief_id: belief.id,
          contract_address: onChain.contractAddress,
          contract_market_id: onChain.contractMarketId,
          chain_id: chainId,
          title: belief.statement,
          category: plan.category,
          open_time: new Date(openTime * 1000).toISOString(),
          close_time: plan.deadline.toISOString(),
          deadline: plan.deadline.toISOString(),
          status: "OPEN",
          resolution_type: plan.resolutionType,
          resolution_config: plan.resolutionConfig,
          resolution_source: plan.kind === "PRICE" ? "chainlink" : "manual",
          metadata_hash: hashes.resolutionHash,
        })
        .returning({ id: markets.id });

      await db.update(beliefs).set({ status: "OPEN" }).where(eq(beliefs.id, belief.id));
      await db
        .insert(market_events)
        .values({ market_id: market.id, event_type: "MarketCreated", wallet_address: belief.author, tx_hash: onChain.txHash })
        .onConflictDoNothing();

      deployed += 1;
      console.log(`+ ${onChain.contractAddress} #${onChain.contractMarketId}: ${belief.statement}`);
    } catch (err) {
      console.error(`failed: ${belief.statement}\n  ${err instanceof Error ? err.message.split("\n")[0] : err}`);
    }
  }

  console.log(`\n${deployed} markets deployed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
